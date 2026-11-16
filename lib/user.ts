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

/** Owner-only gate (e.g. the Stats page). Matches the signed-in user against the
 *  OWNER_EMAILS / OWNER_GITHUB env allowlists — by email OR GitHub login, so it works
 *  for both dev email login and prod GitHub login (whose email may be a private noreply). */
export function isOwner(
  user: { email: string | null; githubUrl: string | null } | null
): boolean {
  if (!user) return false;
  const list = (v?: string) => (v ?? "").split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  const email = user.email?.toLowerCase();
  if (email && list(process.env.OWNER_EMAILS).includes(email)) return true;
  const login = user.githubUrl?.toLowerCase().match(/github\.com\/([^/?#]+)/)?.[1];
  return !!login && list(process.env.OWNER_GITHUB).includes(login);
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
