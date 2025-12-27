import { NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { clearExpiredCache } from "@/lib/marketplace-search";

/**
 * Cron job to clear expired marketplace search cache
 * Triggered daily by Upstash QStash
 *
 * This keeps the database clean by removing search results older than 24 hours
 */
async function handler(request: Request) {
  try {
    const cleared = await clearExpiredCache();

    return NextResponse.json({
      success: true,
      message: "Cache cleared successfully",
      cleared,
    });
  } catch (error) {
    console.error("Cache cleanup failed:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(handler);
export const GET = verifySignatureAppRouter(handler);
