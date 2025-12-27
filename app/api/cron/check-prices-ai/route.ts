import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { gifts, profiles, priceHistory } from "@/db/schema";
import { eq, and, or, isNull, sql } from "drizzle-orm";
import { sendPriceAlertEmail } from "@/lib/email";
import { extractProductMetadata } from "@/lib/price-scraper";

// This endpoint should be called by a cron service (Vercel Cron, GitHub Actions, etc.)
// Recommended: Run daily at 2 AM UTC
async function handleRequest(request: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("Starting AI-powered price check cron job...");

    // Get all gifts that need price checking
    // Criteria: Has URL, not purchased, and either:
    // 1. Never checked (lastPriceCheck is null)
    // 2. Last checked more than 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const giftsToCheck = await db
      .select({
        gift: gifts,
        profile: profiles,
      })
      .from(gifts)
      .innerJoin(profiles, eq(gifts.userId, profiles.id))
      .where(
        and(
          eq(gifts.isPurchased, false),
          sql`${gifts.url} IS NOT NULL AND ${gifts.url} != ''`,
          or(
            isNull(gifts.lastPriceCheck),
            sql`${gifts.lastPriceCheck} < ${oneDayAgo}`
          )
        )
      )
      .limit(100); // Limit to prevent excessive API usage

    console.log(`Found ${giftsToCheck.length} gifts to check`);

    const results = {
      total: giftsToCheck.length,
      successful: 0,
      failed: 0,
      priceDrops: 0,
      errors: [] as string[],
    };

    // Process each gift with delay to avoid rate limiting
    for (const { gift, profile } of giftsToCheck) {
      try {
        console.log(`Checking price for: ${gift.name} (${gift.url})`);

        // Use AI to extract product metadata from URL
        const metadata = await extractProductMetadata(gift.url!);

        if (metadata.success && metadata.price) {
          const newPrice = metadata.price;
          const oldPrice = gift.currentPrice
            ? parseFloat(gift.currentPrice)
            : null;
          const targetPrice = parseFloat(gift.targetPrice);

          // Calculate lowest and highest prices
          const currentLowest = gift.lowestPriceEver
            ? Math.min(parseFloat(gift.lowestPriceEver), newPrice)
            : newPrice;

          const currentHighest = gift.highestPriceEver
            ? Math.max(parseFloat(gift.highestPriceEver), newPrice)
            : newPrice;

          // Update gift with new price
          await db
            .update(gifts)
            .set({
              currentPrice: newPrice.toString(),
              lastPriceCheck: new Date(),
              lowestPriceEver: currentLowest.toString(),
              highestPriceEver: currentHighest.toString(),
              updatedAt: new Date(),
            })
            .where(eq(gifts.id, gift.id));

          // Create price history record
          await db.insert(priceHistory).values({
            giftId: gift.id,
            price: newPrice.toString(),
            source: "ai-cron",
            checkedAt: new Date(),
          });

          // Send alert if price dropped below target
          const isPriceDrop = newPrice < targetPrice;
          const wasAboveTarget = oldPrice ? oldPrice >= targetPrice : true;

          if (isPriceDrop && wasAboveTarget && profile.email) {
            await sendPriceAlertEmail({
              to: profile.email,
              userName: profile.name || "there",
              giftName: gift.name,
              oldPrice: oldPrice
                ? `$${oldPrice.toFixed(2)}`
                : `$${targetPrice.toFixed(2)}`,
              newPrice: `$${newPrice.toFixed(2)}`,
              savings: `$${(targetPrice - newPrice).toFixed(2)}`,
              productUrl: gift.url || undefined,
            });

            results.priceDrops++;
            console.log(`🎉 Price drop alert sent for: ${gift.name}`);
          }

          results.successful++;
          console.log(`✓ Updated price for: ${gift.name} - $${newPrice}`);
        } else {
          // Update lastPriceCheck even if failed, to avoid checking again too soon
          await db
            .update(gifts)
            .set({
              lastPriceCheck: new Date(),
            })
            .where(eq(gifts.id, gift.id));

          results.failed++;
          const error = `Failed to extract price for: ${gift.name}`;
          results.errors.push(error);
          console.log(`✗ ${error}`);
        }

        // Add delay between requests to be respectful to AI API
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      } catch (error) {
        results.failed++;
        const errorMsg = `Error checking ${gift.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log("Price check cron job completed:", results);

    return NextResponse.json({
      success: true,
      ...results,
      message: `Checked ${results.total} gifts. ${results.successful} successful, ${results.failed} failed, ${results.priceDrops} price drops detected.`,
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

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}
