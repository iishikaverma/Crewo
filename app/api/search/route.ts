import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";

export async function GET(req: Request) {
  const me = await currentUser();
  if (!me) return NextResponse.json({ people: [], posts: [] }, { status: 401 });

  const q = (new URL(req.url).searchParams.get("q") ?? "").trim();
  if (!q) return NextResponse.json({ people: [], posts: [] });
  const ql = q.toLowerCase();

  const [people, posts] = await Promise.all([
    prisma.user.findMany({
      where: {
        id: { not: me.id },
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { role: { contains: q, mode: "insensitive" } },
          { location: { contains: q, mode: "insensitive" } },
          { skills: { has: ql } },
        ],
      },
      take: 6,
      select: { id: true, name: true, role: true, image: true },
    }),
    prisma.post.findMany({
      where: {
        status: "open",
        OR: [
          { title: { contains: q, mode: "insensitive" } },
          { hackathonName: { contains: q, mode: "insensitive" } },
          { neededSkills: { has: ql } },
        ],
      },
      take: 6,
      select: { id: true, title: true, type: true },
    }),
  ]);

  return NextResponse.json({ people, posts });
}
