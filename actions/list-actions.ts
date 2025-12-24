"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/db";
import { lists, profiles } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export const LIST_TEMPLATES = [
  { name: "Christmas 2024", description: "Holiday gift shopping" },
  { name: "Birthday Wishlist", description: "Gifts for my birthday" },
  { name: "Wedding Registry", description: "Wedding gift ideas" },
  { name: "Baby Shower", description: "Baby essentials" },
  { name: "Housewarming", description: "New home necessities" },
  { name: "Anniversary Gifts", description: "Special occasion gifts" },
];

interface CreateListInput {
  name: string;
  description?: string;
  budget?: string;
}

export async function createList(input: CreateListInput) {
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

  // Check if this should be the default list (first list for user)
  const existingLists = await db
    .select()
    .from(lists)
    .where(eq(lists.userId, profile.id))
    .limit(1);

  const [newList] = await db
    .insert(lists)
    .values({
      userId: profile.id,
      name: input.name,
      description: input.description || null,
      budget: input.budget || "0",
      isDefault: existingLists.length === 0,
      isArchived: false,
    })
    .returning();

  revalidatePath("/dashboard");
  return newList;
}

export async function getUserLists(includeArchived = false) {
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

  const userLists = await db
    .select()
    .from(lists)
    .where(
      includeArchived
        ? eq(lists.userId, profile.id)
        : and(eq(lists.userId, profile.id), eq(lists.isArchived, false))
    )
    .orderBy(desc(lists.isDefault), desc(lists.createdAt));

  return userLists;
}

export async function getDefaultList() {
  const { userId} = await auth();

  if (!userId) {
    return null;
  }

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.clerkUserId, userId))
    .limit(1);

  if (!profile) {
    return null;
  }

  const [defaultList] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.userId, profile.id), eq(lists.isDefault, true)))
    .limit(1);

  return defaultList || null;
}

export async function updateList(
  listId: string,
  input: Partial<CreateListInput>
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

  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, profile.id)))
    .limit(1);

  if (!list) {
    throw new Error("List not found");
  }

  await db
    .update(lists)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(lists.id, listId));

  revalidatePath("/dashboard");
}

export async function archiveList(listId: string) {
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

  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, profile.id)))
    .limit(1);

  if (!list) {
    throw new Error("List not found");
  }

  if (list.isDefault) {
    throw new Error("Cannot archive the default list");
  }

  await db
    .update(lists)
    .set({
      isArchived: true,
      updatedAt: new Date(),
    })
    .where(eq(lists.id, listId));

  revalidatePath("/dashboard");
}

export async function unarchiveList(listId: string) {
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
    .update(lists)
    .set({
      isArchived: false,
      updatedAt: new Date(),
    })
    .where(and(eq(lists.id, listId), eq(lists.userId, profile.id)));

  revalidatePath("/dashboard");
}

export async function deleteList(listId: string) {
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

  const [list] = await db
    .select()
    .from(lists)
    .where(and(eq(lists.id, listId), eq(lists.userId, profile.id)))
    .limit(1);

  if (!list) {
    throw new Error("List not found");
  }

  if (list.isDefault) {
    throw new Error("Cannot delete the default list");
  }

  await db.delete(lists).where(eq(lists.id, listId));

  revalidatePath("/dashboard");
}
