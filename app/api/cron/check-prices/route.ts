import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import {
  getGiftsForPriceCheck,
  checkPricesForGifts,
} from "@/actions/price-actions";
import { db } from "@/db";
import { gifts, profiles, marketplaceProducts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPriceAlertEmail } from "@/lib/email";
import { formatCurrency } from "@/lib/utils";
import { scrapePriceFromScreenshot } from "@/lib/price-scraper";

// Marketplace search URL generator
function getMarketplaceSearchUrl(
  marketplace: string,
  productName: string
): string {
  const searchQuery = encodeURIComponent(productName);

  switch (marketplace.toLowerCase()) {
    case "amazon":
      return `https://www.amazon.com/s?k=${searchQuery}`;
    case "walmart":
      return `https://www.walmart.com/search?q=${searchQuery}`;
    case "target":
      return `https://www.target.com/s?searchTerm=${searchQuery}`;
    case "bestbuy":
      return `https://www.bestbuy.com/site/searchpage.jsp?st=${searchQuery}`;
    default:
      return `https://www.google.com/search?q=${searchQuery}`;
  }
}

/**
 * Cron job to check prices for all tracked gifts
 * Triggered daily by Upstash QStash
 *
 * Setup:
 * 1. Sign up at https://console.upstash.com/qstash
 * 2. Add QSTASH_CURRENT_SIGNING_KEY and QSTASH_NEXT_SIGNING_KEY to .env
 * 3. Create schedule: POST https://qstash.upstash.io/v2/schedules
 *    - destination: https://your-app.vercel.app/api/cron/check-prices
 *    - cron: 0 10 * * * (10 AM daily)
 */
async function handler(request: Request) {
  try {
    // Get all gifts that need price checking
    const giftsToCheck = await getGiftsForPriceCheck();

    if (giftsToCheck.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No gifts to check",
        checked: 0,
      });
    }

    let totalChecked = 0;
    let totalSuccessful = 0;
    let totalFailed = 0;
    const alertsSent = [];

    // Process each gift with marketplace tracking
    for (const gift of giftsToCheck) {
      try {
        // Get all marketplace products for this gift
        const mpProducts = await db
          .select()
          .from(marketplaceProducts)
          .where(eq(marketplaceProducts.giftId, gift.id));

        let bestPrice: number | null = null;
        let bestMarketplace: string | null = null;
        let pricesChecked = 0;

        // If no marketplace products, use traditional price check
        if (mpProducts.length === 0) {
          const giftIds = [gift.id];
          const results = await checkPricesForGifts(giftIds);
          totalChecked += results.length;
          totalSuccessful += results.filter((r) => r.success).length;
          totalFailed += results.filter((r) => !r.success).length;

          // Handle alert for single marketplace
          const result = results[0];
          if (result?.success && result.shouldAlert) {
            const alertResult = await sendAlert(gift, result.price!, null);
            if (alertResult.success) {
              alertsSent.push(gift.id);
            } else {
              console.error(`Failed to send alert for ${gift.id}: ${alertResult.error}`);
            }
          }
          continue;
        }

        // Check prices for all marketplace products using screenshots
        for (const mp of mpProducts) {
          try {
            // Use search URL instead of product URL for screenshots
            const searchUrl = getMarketplaceSearchUrl(
              mp.marketplace,
              gift.name
            );
            console.log(
              `[CRON] Checking ${mp.marketplace} via screenshot: ${searchUrl}`
            );

            const result = await scrapePriceFromScreenshot(searchUrl);
            totalChecked++;

            if (result.success && result.price) {
              // Update marketplace product price
              await db
                .update(marketplaceProducts)
                .set({
                  currentPrice: result.price.toString(),
                  lastPriceCheck: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(marketplaceProducts.id, mp.id));

              pricesChecked++;
              totalSuccessful++;

              // Track best price
              if (bestPrice === null || result.price < bestPrice) {
                bestPrice = result.price;
                bestMarketplace = mp.marketplace;
              }
            } else {
              totalFailed++;
            }
          } catch (error) {
            console.error(
              `Failed to check price for ${mp.marketplace}:`,
              error
            );
            totalFailed++;
          }
        }

        // Update gift with best price and primary marketplace
        if (bestPrice !== null && bestMarketplace !== null) {
          const oldPrice = gift.currentPrice
            ? parseFloat(gift.currentPrice)
            : null;
          const shouldAlert =
            oldPrice !== null &&
            bestPrice < oldPrice &&
            bestPrice <= parseFloat(gift.targetPrice);

          // Update gift
          await db
            .update(gifts)
            .set({
              currentPrice: bestPrice.toString(),
              primaryMarketplace: bestMarketplace,
              lastPriceCheck: new Date(),
              lastMarketplaceSync: new Date(),
            })
            .where(eq(gifts.id, gift.id));

          // Send alert if price dropped
          if (shouldAlert) {
            const alertResult = await sendAlert(gift, bestPrice, bestMarketplace);
            if (alertResult.success) {
              alertsSent.push(gift.id);
            } else {
              console.error(`Failed to send alert for ${gift.id}: ${alertResult.error}`);
            }
          }
        }
      } catch (error) {
        console.error(`Failed to process gift ${gift.id}:`, error);
        totalFailed++;
      }
    }

    return NextResponse.json({
      success: true,
      checked: totalChecked,
      successful: totalSuccessful,
      failed: totalFailed,
      alertsSent: alertsSent.length,
    });
  } catch (error) {
    console.error("Cron job failed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

async function sendAlert(
  gift: any,
  newPrice: number,
  marketplace: string | null
): Promise<{ success: boolean; error?: string }> {
  try {
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, gift.userId))
      .limit(1);

    if (!profile || !profile.email) {
      return { success: false, error: "No profile or email found" };
    }

    const targetPrice = parseFloat(gift.targetPrice);
    const savings = targetPrice - newPrice;

    const emailResult = await sendPriceAlertEmail({
      to: profile.email,
      userName: profile.name || "there",
      giftName: gift.name,
      oldPrice: formatCurrency(targetPrice),
      newPrice: formatCurrency(newPrice),
      savings: formatCurrency(savings),
      productUrl: gift.url || undefined,
    });

    if (!emailResult.success) {
      console.error(`Failed to send alert for ${gift.id}: ${emailResult.error}`);
      return { success: false, error: emailResult.error };
    }

    return { success: true };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error(`Failed to send alert for ${gift.id}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

export const POST = verifySignatureAppRouter(handler);
export const GET = verifySignatureAppRouter(handler);
