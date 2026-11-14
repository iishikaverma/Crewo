"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";

export async function sendConnect(toId: string, formData: FormData) {
  const fromId = await requireUserId();
  if (toId === fromId) throw new Error("You can't connect with yourself");

  const target = await prisma.user.findUnique({ where: { id: toId }, select: { id: true } });
  if (!target) throw new Error("User not found");

  const message = String(formData.get("message") ?? "").trim();

  // ponytail: upsert so a declined request can be re-sent without a duplicate row
  await prisma.connectRequest.upsert({
    where: { fromId_toId: { fromId, toId } },
    update: { message, status: "pending" },
    create: { fromId, toId, message },
  });
  revalidatePath(`/u/${toId}`);
  revalidatePath("/connections");
}

export async function respondConnect(
  requestId: string,
  status: "accepted" | "declined"
) {
  const userId = await requireUserId();
  const req = await prisma.connectRequest.findUnique({ where: { id: requestId } });
  if (!req || req.toId !== userId) throw new Error("Not allowed");

  await prisma.connectRequest.update({ where: { id: requestId }, data: { status } });
  revalidatePath(`/u/${req.fromId}`);
  revalidatePath("/connections");
}
