import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Dedupe the session read + user lookup within a single server request, so the
// Nav, the onboarding gate and the page all share ONE DB query instead of 3+.
const getSession = cache(() => auth());

/** Full DB user for the signed-in session, or null. Cached per request. */
export const currentUser = cache(async () => {
  const session = await getSession();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
});

/** Gate app pages: must be signed in AND have a real name set.
 *  Sends unauthenticated → /signin, and name-less users → /profile to finish setup. */
export async function requireOnboarded() {
  const me = await currentUser();
  if (!me) redirect("/signin");
  if (!me.name?.trim()) redirect("/profile");
  return me;
}

export async function requireUserId() {
  const session = await getSession();
  const id = session?.user?.id;
  if (!id) throw new Error("Not signed in");
  return id;
}

/** "react, figma , node" -> ["react","figma","node"] (trimmed, deduped, non-empty) */
export function parseSkills(input: FormDataEntryValue | null): string[] {
  return [
    ...new Set(
      String(input ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean)
    ),
  ];
}
