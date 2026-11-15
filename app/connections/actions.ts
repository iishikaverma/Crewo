"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/user";
import { sendEmail, emailLayout, appUrl } from "@/lib/email";

export async function sendConnect(toId: string, formData: FormData) {
  const fromId = await requireUserId();
  if (toId === fromId) throw new Error("You can't connect with yourself");

  const target = await prisma.user.findUnique({ where: { id: toId }, select: { email: true } });
  if (!target) throw new Error("User not found");

  const message = String(formData.get("message") ?? "").trim();

  // ponytail: upsert so a declined request can be re-sent without a duplicate row
  await prisma.connectRequest.upsert({
    where: { fromId_toId: { fromId, toId } },
    update: { message, status: "pending" },
    create: { fromId, toId, message },
  });

  const me = await prisma.user.findUnique({ where: { id: fromId }, select: { name: true } });
  await sendEmail({
    to: target.email,
    subject: `${me?.name ?? "Someone"} wants to connect on Crewo`,
    html: emailLayout(
      "New connect request",
      `${me?.name ?? "A student"} wants to connect${message ? `: "${message}"` : "."}`,
      "View request",
      appUrl("/connections")
    ),
  });

  revalidatePath(`/u/${toId}`);
  revalidatePath("/connections");
}

export async function respondConnect(
  requestId: string,
  status: "accepted" | "declined"
) {
  const userId = await requireUserId();
  const req = await prisma.connectRequest.findUnique({
    where: { id: requestId },
    include: { from: { select: { email: true } }, to: { select: { name: true } } },
  });
  if (!req || req.toId !== userId) throw new Error("Not allowed");

  await prisma.connectRequest.update({ where: { id: requestId }, data: { status } });

  if (status === "accepted") {
    await sendEmail({
      to: req.from.email,
      subject: `${req.to.name ?? "Someone"} accepted your connect request`,
      html: emailLayout(
        "🎉 You're connected",
        `${req.to.name ?? "They"} accepted your request. Their contact is now on their profile.`,
        "View connection",
        appUrl("/connections")
      ),
    });
  }

  revalidatePath(`/u/${req.fromId}`);
  revalidatePath("/connections");
}
