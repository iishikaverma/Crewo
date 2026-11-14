import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/ui";

export default async function Home() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const [openPosts, myPosts] = await Promise.all([
    prisma.post.findMany({
      where: { status: "open", authorId: { not: me.id } },
      orderBy: { createdAt: "desc" },
      include: { author: { select: { name: true, branch: true } } },
    }),
    prisma.post.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, branch: true } },
        _count: { select: { requests: { where: { status: "pending" } } } },
      },
    }),
  ]);

  return (
    <main className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Open posts</h2>
        {openPosts.length === 0 ? (
          <EmptyState>
            No open posts yet.{" "}
            <Link href="/posts/new" className="text-accent-2 hover:underline">Post a need</Link>.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {openPosts.map((p) => (
              <PostCard key={p.id} post={p} viewerSkills={me.skills} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold tracking-tight">Your posts</h2>
        {myPosts.length === 0 ? (
          <EmptyState>
            You haven&apos;t posted yet.{" "}
            <Link href="/posts/new" className="text-accent-2 hover:underline">Create one</Link>.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {myPosts.map((p) => (
              <div key={p.id} className="relative">
                <PostCard post={p} />
                {p._count.requests > 0 && (
                  <span className="absolute right-3 top-3 z-10 rounded-full bg-accent px-2 py-0.5 text-xs font-medium text-accent-fg shadow-[0_0_14px_-3px_var(--accent-glow)]">
                    {p._count.requests} new
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
