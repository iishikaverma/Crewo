import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireOnboarded } from "@/lib/user";
import { PageHeader, EmptyState } from "@/components/ui";
import { MyPostRow } from "@/components/MyPostRow";

export default async function MyPostsPage() {
  const me = await requireOnboarded();

  const myPosts = await prisma.post.findMany({
    where: { authorId: me.id },
    orderBy: { createdAt: "desc" },
    include: { requests: { select: { status: true } } },
  });

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between gap-3">
        <PageHeader title="Your posts" subtitle="Manage the needs you've posted." />
        <Link href="/posts/new" className="shrink-0 text-sm text-accent-2 hover:underline">
          + New
        </Link>
      </div>

      {myPosts.length === 0 ? (
        <EmptyState>
          You haven&apos;t posted anything yet.{" "}
          <Link href="/posts/new" className="text-accent-2 hover:underline">Post a need</Link>.
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-3">
          {myPosts.map((p) => (
            <MyPostRow key={p.id} post={p} />
          ))}
        </div>
      )}
    </main>
  );
}
