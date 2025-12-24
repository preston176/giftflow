"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { gifts, profiles, priceHistory } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { scrapePrice } from "@/lib/price-scraper";

/**
 * Manually check price for a gift
 */
export async function checkPriceNow(giftId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkUserId, userId))
    .limit(1);

  if (!profile) {
    throw new Error("Profile not found");
  }

  // Get the gift
  const [gift] = await db
    .select()
    .from(gifts)
    .where(and(eq(gifts.id, giftId), eq(gifts.userId, profile.id)))
    .limit(1);

  if (!gift) {
    throw new Error("Gift not found");
  }

  if (!gift.url) {
    throw new Error("No product URL provided");
  }

  // Scrape the price
  const result = await scrapePrice(gift.url);

  if (!result.success || !result.price) {
    return {
      success: false,
      error: result.error || "Failed to fetch price",
    };
  }

  const newPrice = result.price.toString();

  // Update gift with new price
  await db
    .update(gifts)
    .set({
      currentPrice: newPrice,
      lastPriceCheck: new Date(),
      lowestPriceEver: gift.lowestPriceEver
        ? Math.min(parseFloat(gift.lowestPriceEver), result.price).toString()
        : newPrice,
      highestPriceEver: gift.highestPriceEver
        ? Math.max(parseFloat(gift.highestPriceEver), result.price).toString()
        : newPrice,
      updatedAt: new Date(),
    })
    .where(eq(gifts.id, giftId));

  // Add to price history
  await db.insert(priceHistory).values({
    giftId,
    price: newPrice,
    source: result.source,
  });

  revalidatePath("/dashboard");

  return {
    success: true,
    price: result.price,
    source: result.source,
  };
}

/**
 * Enable or disable price tracking for a gift
 */
export async function togglePriceTracking(
  giftId: string,
  enabled: boolean,
  alertThreshold?: string
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkUserId, userId))
    .limit(1);

  if (!profile) {
    throw new Error("Profile not found");
  }

  await db
    .update(gifts)
    .set({
      priceTrackingEnabled: enabled,
      priceAlertThreshold: alertThreshold || null,
      updatedAt: new Date(),
    })
    .where(and(eq(gifts.id, giftId), eq(gifts.userId, profile.id)));

  revalidatePath("/dashboard");
}

/**
 * Get price history for a gift
 */
export async function getPriceHistory(giftId: string) {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkUserId, userId))
    .limit(1);

  if (!profile) {
    return [];
  }

  // Verify ownership
  const [gift] = await db
    .select()
    .from(gifts)
    .where(and(eq(gifts.id, giftId), eq(gifts.userId, profile.id)))
    .limit(1);

  if (!gift) {
    return [];
  }

  const history = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.giftId, giftId))
    .orderBy(desc(priceHistory.checkedAt))
    .limit(30); // Last 30 price checks

  return history;
}

/**
 * Get all gifts that need price checking
 * Used by cron job
 */
export async function getGiftsForPriceCheck() {
  // Get all gifts with price tracking enabled that haven't been checked in 24h
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const giftsToCheck = await db
    .select()
    .from(gifts)
    .where(
      and(
        eq(gifts.priceTrackingEnabled, true),
        eq(gifts.isPurchased, false)
      )
    )
    .limit(100); // Process 100 at a time to avoid timeouts

  // Filter for gifts that haven't been checked recently
  return giftsToCheck.filter(
    (gift) =>
      !gift.lastPriceCheck || new Date(gift.lastPriceCheck) < twentyFourHoursAgo
  );
}

/**
 * Check prices for a batch of gifts
 * Used by cron job
 */
export async function checkPricesForGifts(giftIds: string[]) {
  const results = [];

  for (const giftId of giftIds) {
    try {
      const [gift] = await db
        .select()
        .from(gifts)
        .where(eq(gifts.id, giftId))
        .limit(1);

      if (!gift || !gift.url) {
        continue;
      }

      const result = await scrapePrice(gift.url);

      if (result.success && result.price) {
        const newPrice = result.price.toString();

        // Update gift
        await db
          .update(gifts)
          .set({
            currentPrice: newPrice,
            lastPriceCheck: new Date(),
            lowestPriceEver: gift.lowestPriceEver
              ? Math.min(parseFloat(gift.lowestPriceEver), result.price).toString()
              : newPrice,
            highestPriceEver: gift.highestPriceEver
              ? Math.max(parseFloat(gift.highestPriceEver), result.price).toString()
              : newPrice,
            updatedAt: new Date(),
          })
          .where(eq(gifts.id, giftId));

        // Add to price history
        await db.insert(priceHistory).values({
          giftId,
          price: newPrice,
          source: result.source,
        });

        // Check if we should send alert
        const shouldAlert =
          gift.priceAlertThreshold &&
          result.price <= parseFloat(gift.priceAlertThreshold);

        results.push({
          giftId,
          success: true,
          price: result.price,
          shouldAlert,
        });
      } else {
        results.push({
          giftId,
          success: false,
          error: result.error,
        });
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      results.push({
        giftId,
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  return results;
}

/**
 * Get price drop percentage
 */
export function calculatePriceDrop(
  currentPrice: string | null,
  targetPrice: string
): number | null {
  if (!currentPrice) return null;

  const current = parseFloat(currentPrice);
  const target = parseFloat(targetPrice);

  if (isNaN(current) || isNaN(target) || target === 0) return null;

  return ((target - current) / target) * 100;
}
