import { NextResponse } from "next/server";
import { db } from "@/db";
import { items } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * Cron job that runs daily to auto-update all items with autoUpdateEnabled=true
 * Triggers background updates via QStash for each enabled item
 */
async function handleRequest(request: Request) {
  try {
    // Verify this is coming from QStash (optional but recommended)
    const authHeader = request.headers.get("authorization");
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`;

    if (authHeader !== expectedAuth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find all items with auto-update enabled
    const enabledItems = await db
      .select()
      .from(items)
      .where(eq(items.autoUpdateEnabled, true));

    console.log(`Found ${enabledItems.length} items with auto-update enabled`);

    if (enabledItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No items with auto-update enabled",
        itemsUpdated: 0,
      });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL not configured");
    }

    // Queue background updates for each item
    const updatePromises = enabledItems.map(async (item) => {
      try {
        // Trigger background update via QStash
        const result = await qstash.publishJSON({
          url: `${baseUrl}/api/workers/update-price`,
          body: {
            itemId: item.id,
            userId: item.userId,
          },
          // Add delay to stagger updates (avoid overwhelming the system)
          delay: Math.floor(Math.random() * 300), // Random delay 0-5 minutes
        });

        // Update lastAutoUpdate timestamp
        await db
          .update(items)
          .set({
            lastAutoUpdate: new Date(),
          })
          .where(eq(items.id, item.id));

        return {
          itemId: item.id,
          itemName: item.name,
          success: true,
          messageId: result.messageId,
        };
      } catch (error) {
        console.error(`Failed to queue update for item ${item.id}:`, error);
        return {
          itemId: item.id,
          itemName: item.name,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    });

    const results = await Promise.all(updatePromises);
    const successCount = results.filter((r) => r.success).length;
    const failCount = results.filter((r) => !r.success).length;

    console.log(
      `Auto-update cron completed: ${successCount} queued, ${failCount} failed`
    );

    return NextResponse.json({
      success: true,
      message: `Queued ${successCount} auto-updates`,
      itemsUpdated: successCount,
      itemsFailed: failCount,
      results,
    });
  } catch (error) {
    console.error("Auto-update cron error:", error);
    return NextResponse.json(
      {
        error: "Failed to run auto-update cron",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}
