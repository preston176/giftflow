"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { gifts, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface AddGiftInput {
  listId?: string;
  name: string;
  url?: string;
  imageUrl?: string;
  targetPrice: string;
  currentPrice?: string;
  recipientName: string;
  priority: "low" | "medium" | "high";
  notes?: string;
}

export async function addGift(input: AddGiftInput) {
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
    throw new Error("Profile not found. Please refresh the page.");
  }

  const [newGift] = await db
    .insert(gifts)
    .values({
      userId: profile.id,
      listId: input.listId || null,
      name: input.name,
      url: input.url || null,
      imageUrl: input.imageUrl || null,
      targetPrice: input.targetPrice,
      currentPrice: input.currentPrice || null,
      recipientName: input.recipientName,
      priority: input.priority,
      notes: input.notes || null,
      isPurchased: false,
    })
    .returning();

  revalidatePath("/dashboard");
  return newGift;
}

export async function getUserGifts(listId?: string) {
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

  const userGifts = await db
    .select()
    .from(gifts)
    .where(
      listId
        ? and(eq(gifts.userId, profile.id), eq(gifts.listId, listId))
        : eq(gifts.userId, profile.id)
    )
    .orderBy(desc(gifts.createdAt));

  return userGifts;
}

export async function togglePurchased(giftId: string) {
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

  const [gift] = await db
    .select()
    .from(gifts)
    .where(and(eq(gifts.id, giftId), eq(gifts.userId, profile.id)))
    .limit(1);

  if (!gift) {
    throw new Error("Gift not found");
  }

  await db
    .update(gifts)
    .set({
      isPurchased: !gift.isPurchased,
      updatedAt: new Date(),
    })
    .where(eq(gifts.id, giftId));

  revalidatePath("/dashboard");
}

export async function updateGift(giftId: string, input: Partial<AddGiftInput>) {
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

  const [gift] = await db
    .select()
    .from(gifts)
    .where(and(eq(gifts.id, giftId), eq(gifts.userId, profile.id)))
    .limit(1);

  if (!gift) {
    throw new Error("Gift not found");
  }

  await db
    .update(gifts)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(gifts.id, giftId));

  revalidatePath("/dashboard");
}

export async function deleteGift(giftId: string) {
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
    .delete(gifts)
    .where(and(eq(gifts.id, giftId), eq(gifts.userId, profile.id)));

  revalidatePath("/dashboard");
}
