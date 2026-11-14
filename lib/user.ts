import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/** Full DB user for the signed-in session, or null. Routes are proxy-guarded,
 *  but server actions still call requireUserId() to be safe. */
export async function currentUser() {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) return null;
  return prisma.user.findUnique({ where: { id } });
}

export async function requireUserId() {
  const session = await auth();
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
