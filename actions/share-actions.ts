"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { shareTokens, lists, profiles, gifts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { generateShareToken } from "@/lib/utils";

export async function getOrCreateShareToken(listId: string) {
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

  // Verify list ownership
  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, profile.id)))
    .limit(1);

  if (!list) {
    throw new Error("List not found");
  }

  const [existingToken] = await db
    .select()
    .from(shareTokens)
    .where(and(eq(shareTokens.listId, listId), eq(shareTokens.isActive, true)))
    .orderBy(desc(shareTokens.createdAt))
    .limit(1);

  if (existingToken) {
    return existingToken.token;
  }

  const token = generateShareToken();

  await db.insert(shareTokens).values({
    listId,
    token,
    isActive: true,
  });

  return token;
}

export async function regenerateShareToken(listId: string) {
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

  // Verify list ownership
  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, profile.id)))
    .limit(1);

  if (!list) {
    throw new Error("List not found");
  }

  await db
    .update(shareTokens)
    .set({ isActive: false })
    .where(eq(shareTokens.listId, listId));

  const token = generateShareToken();

  await db.insert(shareTokens).values({
    listId,
    token,
    isActive: true,
  });

  return token;
}

export async function getSharedWishlist(token: string) {
  const [shareToken] = await db
    .select()
    .from(shareTokens)
    .where(and(eq(shareTokens.token, token), eq(shareTokens.isActive, true)))
    .limit(1);

  if (!shareToken) {
    return null;
  }

  const [list] = await db
    .select()
    .from(lists)
    .where(eq(lists.id, shareToken.listId))
    .limit(1);

  if (!list || list.isArchived) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, list.userId))
    .limit(1);

  if (!profile) {
    return null;
  }

  const wishlistGifts = await db
    .select()
    .from(gifts)
    .where(and(eq(gifts.listId, list.id), eq(gifts.isPurchased, false)))
    .orderBy(desc(gifts.priority), desc(gifts.createdAt));

  return {
    list: {
      name: list.name,
      description: list.description,
    },
    profile: {
      name: profile.name,
      imageUrl: profile.imageUrl,
    },
    gifts: wishlistGifts,
  };
}
