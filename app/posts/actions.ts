"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId, parseSkills, capStr } from "@/lib/user";
import { sendEmail, emailLayout, appUrl } from "@/lib/email";

const TYPES = ["hackathon", "project"] as const;
type PostType = (typeof TYPES)[number];

export async function createPost(formData: FormData) {
  const authorId = await requireUserId();
  const title = capStr(formData.get("title"), 120);
  const description = capStr(formData.get("description"), 4000);
  if (!title || !description) throw new Error("Title and description are required");

  const type = String(formData.get("type") ?? "");
  const safeType: PostType = (TYPES as readonly string[]).includes(type)
    ? (type as PostType)
    : "hackathon";

  const teamSize = Math.max(2, Math.min(20, Math.round(Number(formData.get("teamSize")) || 2)));
  const when = String(formData.get("happeningAt") ?? "");
  const trimOrNull = (v: FormDataEntryValue | null, max = 300) => {
    const s = capStr(v, max);
    return s.length ? s : null;
  };

  const post = await prisma.post.create({
    data: {
      authorId,
      type: safeType,
      title,
      hackathonName: trimOrNull(formData.get("hackathonName")),
      description,
      expecting: trimOrNull(formData.get("expecting")),
      details: trimOrNull(formData.get("details"), 4000),
      neededSkills: parseSkills(formData.get("neededSkills")),
      teamSize,
      happeningAt: when ? new Date(when) : null,
    },
  });
  revalidatePath("/");
  redirect(`/posts/${post.id}`);
}

export async function requestToJoin(postId: string, formData: FormData) {
  const requesterId = await requireUserId();
  const message = capStr(formData.get("message"), 1000);

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { email: true, name: true } } },
  });
  if (!post) throw new Error("Post not found");
  if (post.authorId === requesterId) throw new Error("You can't join your own post");
  if (post.status !== "open") throw new Error("This post is closed");

  // ponytail: upsert so a declined user can re-request without a duplicate row
  await prisma.joinRequest.upsert({
    where: { postId_requesterId: { postId, requesterId } },
    update: { message, status: "pending" },
    create: { postId, requesterId, message },
  });

  const me = await prisma.user.findUnique({ where: { id: requesterId }, select: { name: true } });
  await sendEmail({
    to: post.author.email,
    subject: `New request to join "${post.title}"`,
    html: emailLayout(
      "Someone wants to join your post",
      `${me?.name ?? "A student"} requested to join <b>${post.title}</b>${message ? `: "${message}"` : "."}`,
      "View request",
      appUrl(`/posts/${postId}`)
    ),
  });

  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}

export async function respondToRequest(
  requestId: string,
  status: "accepted" | "declined"
) {
  const userId = await requireUserId();
  const req = await prisma.joinRequest.findUnique({
    where: { id: requestId },
    include: {
      post: { select: { id: true, authorId: true, title: true, teamSize: true } },
      requester: { select: { email: true } },
    },
  });
  if (!req || req.post.authorId !== userId) throw new Error("Not allowed");

  // Capacity: author counts as 1 seat. Block accepting past teamSize.
  const acceptedCount = await prisma.joinRequest.count({
    where: { postId: req.postId, status: "accepted" },
  });
  if (status === "accepted" && 1 + acceptedCount >= req.post.teamSize) {
    throw new Error("This team is already full");
  }

  await prisma.joinRequest.update({ where: { id: requestId }, data: { status } });

  // Auto-close the post once this accept fills the last seat.
  if (status === "accepted" && acceptedCount + 2 >= req.post.teamSize) {
    await prisma.post.update({ where: { id: req.postId }, data: { status: "closed" } });
  }

  if (status === "accepted") {
    await sendEmail({
      to: req.requester.email,
      subject: `You're in — "${req.post.title}"`,
      html: emailLayout(
        "🎉 Your request was accepted",
        `You've been accepted to <b>${req.post.title}</b>. Open the post to see the contact details.`,
        "See your team",
        appUrl(`/posts/${req.postId}`)
      ),
    });
  }

  revalidatePath(`/posts/${req.postId}`);
  revalidatePath("/");
}

export async function setPostStatus(postId: string, status: "open" | "closed") {
  const userId = await requireUserId();
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.authorId !== userId) throw new Error("Not allowed");

  await prisma.post.update({ where: { id: postId }, data: { status } });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}

export async function deletePost(postId: string) {
  const userId = await requireUserId();
  const post = await prisma.post.findUnique({ where: { id: postId }, select: { authorId: true } });
  if (!post || post.authorId !== userId) throw new Error("Not allowed");

  // Join requests cascade-delete with the post (schema onDelete: Cascade).
  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/");
  redirect("/");
}

export async function withdrawJoinRequest(postId: string) {
  const requesterId = await requireUserId();
  // deleteMany so withdrawing a non-existent request is a no-op, not a throw.
  await prisma.joinRequest.deleteMany({ where: { postId, requesterId } });
  revalidatePath(`/posts/${postId}`);
  revalidatePath("/");
}
