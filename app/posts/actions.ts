"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId, parseSkills } from "@/lib/user";

const TYPES = ["hackathon", "project", "study"] as const;
type PostType = (typeof TYPES)[number];

export async function createPost(formData: FormData) {
  const authorId = await requireUserId();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  if (!title || !description) throw new Error("Title and description are required");

  const type = String(formData.get("type") ?? "");
  const safeType: PostType = (TYPES as readonly string[]).includes(type)
    ? (type as PostType)
    : "hackathon";

  const teamSize = Math.max(2, Math.min(20, Math.round(Number(formData.get("teamSize")) || 2)));
  const when = String(formData.get("happeningAt") ?? "");

  const post = await prisma.post.create({
    data: {
      authorId,
      type: safeType,
      title,
      description,
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
  const message = String(formData.get("message") ?? "").trim();

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) throw new Error("Post not found");
  if (post.authorId === requesterId) throw new Error("You can't join your own post");
  if (post.status !== "open") throw new Error("This post is closed");

  // ponytail: upsert so a declined user can re-request without a duplicate row
  await prisma.joinRequest.upsert({
    where: { postId_requesterId: { postId, requesterId } },
    update: { message, status: "pending" },
    create: { postId, requesterId, message },
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
    include: { post: { select: { authorId: true } } },
  });
  if (!req || req.post.authorId !== userId) throw new Error("Not allowed");

  await prisma.joinRequest.update({ where: { id: requestId }, data: { status } });
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
