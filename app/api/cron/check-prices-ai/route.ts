import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { items, profiles, priceHistory } from "@/db/schema";
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

    // Get all items that need price checking
    // Criteria: Has URL, not purchased, and either:
    // 1. Never checked (lastPriceCheck is null)
    // 2. Last checked more than 24 hours ago
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const itemsToCheck = await db
      .select({
        item: items,
        profile: profiles,
      })
      .from(items)
      .innerJoin(profiles, eq(items.userId, profiles.id))
      .where(
        and(
          eq(items.isPurchased, false),
          sql`${items.url} IS NOT NULL AND ${items.url} != ''`,
          or(
            isNull(items.lastPriceCheck),
            sql`${items.lastPriceCheck} < ${oneDayAgo}`
          )
        )
      )
      .limit(100); // Limit to prevent excessive API usage

    console.log(`Found ${itemsToCheck.length} items to check`);

    const results = {
      total: itemsToCheck.length,
      successful: 0,
      failed: 0,
      priceDrops: 0,
      errors: [] as string[],
    };

    // Process each item with delay to avoid rate limiting
    for (const { item, profile } of itemsToCheck) {
      try {
        console.log(`Checking price for: ${item.name} (${item.url})`);

        // Use AI to extract product metadata from URL
        const metadata = await extractProductMetadata(item.url!);

        if (metadata.success && metadata.price) {
          const newPrice = metadata.price;
          const oldPrice = item.currentPrice
            ? parseFloat(item.currentPrice)
            : null;
          const targetPrice = parseFloat(item.targetPrice);

          // Calculate lowest and highest prices
          const currentLowest = item.lowestPriceEver
            ? Math.min(parseFloat(item.lowestPriceEver), newPrice)
            : newPrice;

          const currentHighest = item.highestPriceEver
            ? Math.max(parseFloat(item.highestPriceEver), newPrice)
            : newPrice;

          // Update item with new price
          await db
            .update(items)
            .set({
              currentPrice: newPrice.toString(),
              lastPriceCheck: new Date(),
              lowestPriceEver: currentLowest.toString(),
              highestPriceEver: currentHighest.toString(),
              updatedAt: new Date(),
            })
            .where(eq(items.id, item.id));

          // Create price history record
          await db.insert(priceHistory).values({
            itemId: item.id,
            price: newPrice.toString(),
            source: "ai-cron",
            checkedAt: new Date(),
          });

          // Send alert if price dropped below target
          const isPriceDrop = newPrice < targetPrice;
          const wasAboveTarget = oldPrice ? oldPrice >= targetPrice : true;

          if (isPriceDrop && wasAboveTarget && profile.email) {
            const emailResult = await sendPriceAlertEmail({
              to: profile.email,
              userName: profile.name || "there",
              itemName: item.name,
              oldPrice: oldPrice
                ? `$${oldPrice.toFixed(2)}`
                : `$${targetPrice.toFixed(2)}`,
              newPrice: `$${newPrice.toFixed(2)}`,
              savings: `$${(targetPrice - newPrice).toFixed(2)}`,
              productUrl: item.url || undefined,
            });

            if (emailResult.success) {
              results.priceDrops++;
              console.log(`🎉 Price drop alert sent for: ${item.name}`);
            } else {
              console.error(`Failed to send price alert for ${item.name}: ${emailResult.error}`);
              results.errors.push(`Failed to send alert for ${item.name}: ${emailResult.error}`);
            }
          }

          results.successful++;
          console.log(`✓ Updated price for: ${item.name} - $${newPrice}`);
        } else {
          // Update lastPriceCheck even if failed, to avoid checking again too soon
          await db
            .update(items)
            .set({
              lastPriceCheck: new Date(),
            })
            .where(eq(items.id, item.id));

          results.failed++;
          const error = `Failed to extract price for: ${item.name}`;
          results.errors.push(error);
          console.log(`✗ ${error}`);
        }

        // Add delay between requests to be respectful to AI API
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay
      } catch (error) {
        results.failed++;
        const errorMsg = `Error checking ${item.name}: ${error instanceof Error ? error.message : "Unknown error"}`;
        results.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    console.log("Price check cron job completed:", results);

    return NextResponse.json({
      success: true,
      ...results,
      message: `Checked ${results.total} items. ${results.successful} successful, ${results.failed} failed, ${results.priceDrops} price drops detected.`,
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
