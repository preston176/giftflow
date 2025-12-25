import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gifts, profiles } from "@/db/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";
import { sendWeeklyReminderEmail } from "@/lib/email";

// This endpoint should be called by a cron service
// Recommended: Run every Sunday at 9 AM local time
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting weekly reminder cron job...");

    // Get all users with their gift statistics
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Query all profiles with their gifts
    const allProfiles = await db
      .select({
        id: profiles.id,
        email: profiles.email,
        name: profiles.name,
      })
      .from(profiles)
      .where(sql`${profiles.email} IS NOT NULL AND ${profiles.email} != ''`);

    console.log(`Found ${allProfiles.length} users with email addresses`);

    const results = {
      total: allProfiles.length,
      emailsSent: 0,
      skipped: 0,
      errors: [] as string[],
    };

    for (const profile of allProfiles) {
      try {
        // Get user's gifts that need price checking
        const userGifts = await db
          .select()
          .from(gifts)
          .where(
            and(
              eq(gifts.userId, profile.id),
              eq(gifts.isPurchased, false),
              sql`${gifts.url} IS NOT NULL AND ${gifts.url} != ''`
            )
          );

        // Count items without recent price checks
        const itemsToCheck = userGifts.filter(
          (g) =>
            !g.lastPriceCheck ||
            new Date(g.lastPriceCheck) < sevenDaysAgo
        ).length;

        // Skip if no items need checking
        if (itemsToCheck === 0) {
          results.skipped++;
          console.log(`Skipping ${profile.name || profile.email}: No items to check`);
          continue;
        }

        // Calculate current savings
        const giftsWithPrices = userGifts.filter((g) => g.currentPrice);
        const savingsData = giftsWithPrices
          .map((g) => {
            const target = parseFloat(g.targetPrice);
            const current = parseFloat(g.currentPrice!);
            const savings = target - current;
            return {
              name: g.name,
              savings: savings > 0 ? savings : 0,
            };
          })
          .filter((s) => s.savings > 0);

        const totalSavings = savingsData.reduce((sum, s) => sum + s.savings, 0);
        const bestDeal = savingsData.reduce<{ name: string; savings: number } | undefined>(
          (best, item) => {
            if (!best || item.savings > best.savings) {
              return item;
            }
            return best;
          },
          undefined
        );

        // Send reminder email
        await sendWeeklyReminderEmail({
          to: profile.email!,
          userName: profile.name || "there",
          itemsToCheck,
          giftsWithPrices: giftsWithPrices.length,
          potentialSavings: totalSavings,
          bestDeal,
        });

        results.emailsSent++;
        console.log(`✓ Sent reminder to: ${profile.name || profile.email}`);

        // Add delay between emails to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1 second delay
      } catch (error) {
        const errorMsg = `Error sending reminder to ${profile.email}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log("Weekly reminder cron job completed:", results);

    return NextResponse.json({
      success: true,
      ...results,
      message: `Processed ${results.total} users. Sent ${results.emailsSent} reminders, skipped ${results.skipped}.`,
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
