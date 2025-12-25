import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currency } = await request.json();

    if (!currency || typeof currency !== "string") {
      return NextResponse.json({ error: "Invalid currency" }, { status: 400 });
    }

    // Update currency in database
    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.clerkUserId, userId))
      .limit(1);

    if (profile) {
      await db
        .update(profiles)
        .set({ currency, updatedAt: new Date() })
        .where(eq(profiles.id, profile.id));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update currency:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
