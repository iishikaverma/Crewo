import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { PostCard } from "@/components/PostCard";

export default async function Home() {
  const me = await currentUser();
  if (!me) return null; // proxy redirects, this is just for types

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
    <main className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-lg font-semibold">Open posts</h2>
        {openPosts.length === 0 ? (
          <p className="text-sm text-gray-500">
            No open posts yet. <Link href="/posts/new" className="underline">Post a need</Link>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {openPosts.map((p) => (
              <PostCard key={p.id} post={p} viewerSkills={me.skills} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your posts</h2>
        {myPosts.length === 0 ? (
          <p className="text-sm text-gray-500">
            You haven&apos;t posted yet. <Link href="/posts/new" className="underline">Create one</Link>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {myPosts.map((p) => (
              <div key={p.id} className="relative">
                <PostCard post={p} />
                {p._count.requests > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-0.5 text-xs font-medium text-white">
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
