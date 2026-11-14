import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { postFit } from "@/lib/matchScore";
import { PostCard } from "@/components/PostCard";
import { EmptyState } from "@/components/ui";

const TYPES = [
  { v: "", label: "All" },
  { v: "hackathon", label: "🏆 Hackathons" },
  { v: "project", label: "🛠️ Projects" },
] as const;

export default async function Home({ searchParams }: PageProps<"/">) {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const sp = await searchParams;
  const typeRaw = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const typeFilter = typeRaw === "hackathon" || typeRaw === "project" ? typeRaw : null;

  const [openPostsRaw, myPosts] = await Promise.all([
    prisma.post.findMany({
      where: { status: "open", authorId: { not: me.id }, ...(typeFilter ? { type: typeFilter } : {}) },
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

  // rank open posts by how well the viewer fits the needed skills
  const openPosts = openPostsRaw
    .map((p) => ({ p, fit: postFit(me.skills, p.neededSkills) }))
    .sort((a, b) => b.fit - a.fit || +b.p.createdAt - +a.p.createdAt);

  return (
    <main className="flex flex-col gap-10">
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Open posts</h2>
          <div className="flex gap-1.5">
            {TYPES.map((t) => {
              const active = (typeFilter ?? "") === t.v;
              return (
                <Link
                  key={t.v}
                  href={t.v ? `/?type=${t.v}` : "/"}
                  className={
                    "rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
                    (active
                      ? "bg-accent text-accent-fg"
                      : "bg-surface-2 text-muted hover:text-fg")
                  }
                >
                  {t.label}
                </Link>
              );
            })}
          </div>
        </div>

        {openPosts.length === 0 ? (
          <EmptyState>
            No open posts{typeFilter ? " of this type" : ""} yet.{" "}
            <Link href="/posts/new" className="text-accent-2 hover:underline">Post a need</Link>.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {openPosts.map(({ p, fit }) => (
              <PostCard key={p.id} post={p} viewerSkills={me.skills} fit={fit} />
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
