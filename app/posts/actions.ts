"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUserId, parseSkills, capStr } from "@/lib/user";
import { sendEmail, emailLayout, appUrl } from "@/lib/email";
import { postSchema, firstError, type ActionState } from "@/lib/validation";

type PostType = "hackathon" | "project";
const nn = (s: string) => (s.length ? s : null);

export async function createPost(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const authorId = await requireUserId();

  const parsed = postSchema.safeParse({
    title: formData.get("title") ?? "",
    description: formData.get("description") ?? "",
    type: formData.get("type") ?? "",
    teamSize: formData.get("teamSize") ?? "",
    hackathonName: formData.get("hackathonName") ?? "",
    expecting: formData.get("expecting") ?? "",
    details: formData.get("details") ?? "",
    happeningAt: formData.get("happeningAt") ?? "",
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const v = parsed.data;

  const post = await prisma.post.create({
    data: {
      authorId,
      type: v.type as PostType,
      title: v.title,
      hackathonName: nn(v.hackathonName),
      description: v.description,
      expecting: nn(v.expecting),
      details: nn(v.details),
      neededSkills: parseSkills(formData.get("neededSkills")),
      teamSize: Number(v.teamSize),
      happeningAt: v.happeningAt ? new Date(v.happeningAt) : null,
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
