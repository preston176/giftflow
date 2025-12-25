"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function ensureProfile() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    throw new Error("Unauthorized");
  }

  const [existingProfile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkUserId, userId))
    .limit(1);

  if (existingProfile) {
    return existingProfile;
  }

  const [newProfile] = await db
    .insert(profiles)
    .values({
      clerkUserId: userId,
      email: user.emailAddresses[0]?.emailAddress || "",
      name: user.fullName || user.firstName || "User",
      imageUrl: user.imageUrl,
    })
    .returning();

  return newProfile;
}

export async function updateBudget(budget: string) {
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
    .update(profiles)
    .set({
      totalBudget: budget,
      updatedAt: new Date(),
    })
    .where(eq(profiles.id, profile.id));

  revalidatePath("/dashboard");
}
