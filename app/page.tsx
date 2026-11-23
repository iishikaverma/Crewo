import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { postMatch } from "@/lib/matchScore";
import { PostCard } from "@/components/PostCard";
import { EmptyState, Card, Avatar } from "@/components/ui";
import { Landing } from "@/components/Landing";
import { WelcomeToast } from "@/components/WelcomeToast";
import { TypeGlyph } from "@/components/PostType";
import { MyPostRow } from "@/components/MyPostRow";

const TYPES = [
  { v: "", label: "All" },
  { v: "hackathon", label: "Hackathons" },
  { v: "project", label: "Projects" },
] as const;

export default async function Home({ searchParams }: PageProps<"/">) {
  const me = await currentUser();
  if (!me) return <Landing />;
  if (!me.name?.trim()) redirect("/profile");

  const sp = await searchParams;
  const typeRaw = Array.isArray(sp.type) ? sp.type[0] : sp.type;
  const typeFilter = typeRaw === "hackathon" || typeRaw === "project" ? typeRaw : null;

  const [openPostsRaw, myPosts, pendingConnects, connections, suggested] = await Promise.all([
    prisma.post.findMany({
      where: { status: "open", authorId: { not: me.id }, ...(typeFilter ? { type: typeFilter } : {}) },
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { name: true, branch: true, image: true, skills: true } },
        requests: { where: { status: "accepted" }, select: { requester: { select: { skills: true } } } },
      },
    }),
    prisma.post.findMany({
      where: { authorId: me.id },
      orderBy: { createdAt: "desc" },
      include: { requests: { select: { status: true } } },
    }),
    prisma.connectRequest.count({ where: { toId: me.id, status: "pending" } }),
    prisma.connectRequest.count({ where: { status: "accepted", OR: [{ fromId: me.id }, { toId: me.id }] } }),
    prisma.user.findMany({
      where: { id: { not: me.id }, name: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: { id: true, name: true, image: true, role: true },
    }),
  ]);

  const openPosts = openPostsRaw
    .map((p) => {
      const memberSkills = [p.author.skills, ...p.requests.map((r) => r.requester.skills)].flat();
      const { fit, reasons } = postMatch({
        viewerSkills: me.skills,
        viewerOpenTo: me.openTo,
        viewerBranch: me.branch,
        neededSkills: p.neededSkills,
        postType: p.type,
        authorBranch: p.author.branch,
        memberSkills,
      });
      return { p, fit, reasons };
    })
    .sort((a, b) => b.fit - a.fit || +b.p.createdAt - +a.p.createdAt);

  const firstName = (me.name ?? "there").split(" ")[0];

  return (
    <main className="flex flex-col gap-6">
      <WelcomeToast name={me.name ?? "there"} />

      {/* Dashboard header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {firstName}</h1>
          <p className="text-sm text-muted">Find your crew — browse open posts or post a need.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/connections" className="rounded-[10px] border border-border bg-surface px-3 py-2 text-center transition-colors hover:border-border-strong">
            <div className="text-lg font-bold leading-none">{connections}</div>
            <div className="text-[11px] text-muted">connections</div>
          </Link>
          <Link href="/connections" className="rounded-[10px] border border-border bg-surface px-3 py-2 text-center transition-colors hover:border-border-strong">
            <div className="text-lg font-bold leading-none text-accent-warm">{pendingConnects}</div>
            <div className="text-[11px] text-muted">pending</div>
          </Link>
        </div>
      </header>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[1fr_300px]">
        {/* Feed */}
        <section className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
            <h2 className="text-lg font-semibold tracking-tight">Open posts</h2>
            <div className="flex flex-wrap gap-1.5">
              {TYPES.map((t) => {
                const active = (typeFilter ?? "") === t.v;
                return (
                  <Link
                    key={t.v}
                    href={t.v ? `/?type=${t.v}` : "/"}
                    className={
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-colors " +
                      (active ? "bg-accent text-accent-fg" : "bg-surface-2 text-muted hover:text-fg")
                    }
                  >
                    <TypeGlyph type={t.v} />
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
              {openPosts.map(({ p, fit, reasons }) => (
                <PostCard key={p.id} post={p} viewerSkills={me.skills} fit={fit} reasons={reasons} />
              ))}
            </div>
          )}
        </section>

        {/* Right rail */}
        <aside className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Your posts</h3>
              <Link href="/posts/new" className="text-xs text-accent-2 hover:underline">+ New</Link>
            </div>
            {myPosts.length === 0 ? (
              <EmptyState>No posts yet.</EmptyState>
            ) : (
              <>
                {myPosts.slice(0, 4).map((p) => (
                  <MyPostRow key={p.id} post={p} />
                ))}
                {myPosts.length > 4 && (
                  <Link href="/posts/mine" className="mt-1 text-xs text-accent-2 hover:underline">
                    View all ({myPosts.length}) →
                  </Link>
                )}
              </>
            )}
          </div>

          <Card className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold">Suggested people</h3>
            {suggested.map((u) => (
              <Link key={u.id} href={`/u/${u.id}`} className="flex items-center gap-2 rounded-[8px] px-1 py-1 transition-colors hover:bg-surface-2">
                <Avatar src={u.image} name={u.name} size={28} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  {u.role && <p className="truncate text-xs text-muted">{u.role}</p>}
                </div>
              </Link>
            ))}
            <Link href="/people" className="mt-1 text-xs text-accent-2 hover:underline">Browse everyone →</Link>
          </Card>
        </aside>
      </div>
    </main>
  );
}
