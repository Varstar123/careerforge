import { cache } from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/**
 * Resolve the current Clerk user to our DB User, creating/syncing on first use.
 * Returns null when unauthenticated. This is the bridge between Clerk identity
 * and our relational data (also handled by the Clerk webhook for back-fill).
 *
 * Wrapped in React `cache()` so the layout and the page (and any other server
 * component in the same render) share a single auth() + DB round trip instead
 * of repeating it — this is the main lever for snappy dashboard navigation.
 */
export const getOrCreateUser = cache(async function getOrCreateUser(): Promise<User | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const existing = await prisma.user.findUnique({ where: { clerkId: userId } });
  if (existing) return existing;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email =
    clerkUser.emailAddresses.find(
      (e) => e.id === clerkUser.primaryEmailAddressId,
    )?.emailAddress ??
    clerkUser.emailAddresses[0]?.emailAddress ??
    `${userId}@no-email.local`;

  return prisma.user.upsert({
    where: { clerkId: userId },
    update: {
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
    create: {
      clerkId: userId,
      email,
      firstName: clerkUser.firstName,
      lastName: clerkUser.lastName,
      imageUrl: clerkUser.imageUrl,
    },
  });
});

/** Throwing variant for API routes / server actions that require a user. */
export async function requireUser(): Promise<User> {
  const user = await getOrCreateUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
