import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { SkillTags } from "@/components/SkillTags";
import { requestToJoin, respondToRequest, setPostStatus } from "../actions";
import { Card, Button, Badge, Textarea } from "@/components/ui";
import { TeamComposition } from "@/components/TeamComposition";
import { Confetti } from "@/components/Confetti";
import { ConfettiButton } from "@/components/ConfettiButton";

const TYPE_LABEL: Record<string, string> = {
  hackathon: "🏆 Hackathon",
  project: "🛠️ Project",
};

type Contactable = { name: string | null; githubUrl: string | null; linkedinUrl: string | null };

function Contact({ u }: { u: Contactable }) {
  const links: { label: string; href: string }[] = [];
  if (u.githubUrl) links.push({ label: "GitHub", href: u.githubUrl });
  if (u.linkedinUrl) links.push({ label: "LinkedIn", href: u.linkedinUrl });
  if (links.length === 0)
    return <p className="text-sm text-muted">No contact links on their profile yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" className="px-3 py-1.5 text-xs">{l.label}</Button>
        </a>
      ))}
    </div>
  );
}

export default async function PostDetail({ params }: PageProps<"/posts/[id]">) {
  const { id } = await params;
  const me = await currentUser();
  if (!me) redirect("/signin");

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      author: true,
      requests: { orderBy: { createdAt: "asc" }, include: { requester: true } },
    },
  });
  if (!post) notFound();

  const isAuthor = post.authorId === me.id;
  const myReq = post.requests.find((r) => r.requesterId === me.id);
  const pending = post.requests.filter((r) => r.status === "pending");
  const accepted = post.requests.filter((r) => r.status === "accepted");
  const declined = post.requests.filter((r) => r.status === "declined");

  const memberSkills = [post.author.skills, ...accepted.map((r) => r.requester.skills)].flat();
  const filledSpots = 1 + accepted.length;

  return (
    <main className="flex flex-col gap-6">
      <Link href="/" className="text-sm text-muted hover:text-fg">← Browse</Link>

      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
          <span>{TYPE_LABEL[post.type] ?? post.type}</span>
          {post.hackathonName && <Badge tone="accent">{post.hackathonName}</Badge>}
          {post.status === "closed" && <Badge>closed</Badge>}
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{post.title}</h1>
        <p className="text-sm text-muted">
          by {post.author.name ?? "Someone"}
          {post.author.branch ? ` · ${post.author.branch}` : ""} · team of {post.teamSize}
          {post.happeningAt ? ` · ${post.happeningAt.toLocaleDateString()}` : ""}
        </p>
        <p className="whitespace-pre-wrap text-fg/90">{post.description}</p>
        {post.expecting && (
          <p className="text-sm text-muted">
            <span className="font-medium text-fg">Looking for:</span> {post.expecting}
          </p>
        )}
        <div className="mt-1">
          <p className="mb-1.5 text-xs font-medium text-muted">Skills needed</p>
          <SkillTags skills={post.neededSkills} highlight={isAuthor ? [] : me.skills} />
        </div>
      </header>

      <TeamComposition
        neededSkills={post.neededSkills}
        memberSkills={memberSkills}
        filled={filledSpots}
        teamSize={post.teamSize}
      />

      {isAuthor ? (
        <section className="flex flex-col gap-5">
          <form action={setPostStatus.bind(null, post.id, post.status === "open" ? "closed" : "open")}>
            <Button variant="secondary" className="px-3 py-1.5 text-xs">
              {post.status === "open" ? "Close post (team formed)" : "Reopen post"}
            </Button>
          </form>

          <div>
            <h2 className="mb-3 font-semibold tracking-tight">Requests to join</h2>
            {post.requests.length === 0 && <p className="text-sm text-muted">No requests yet.</p>}

            {pending.length > 0 && (
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <Card key={r.id}>
                    <p className="text-sm font-medium">
                      {r.requester.name ?? r.requester.email}
                      {r.requester.branch ? ` · ${r.requester.branch}` : ""}
                    </p>
                    <div className="mt-1.5">
                      <SkillTags skills={r.requester.skills} highlight={post.neededSkills} />
                    </div>
                    {r.message && <p className="mt-2 text-sm text-muted">{r.message}</p>}
                    <div className="mt-3 flex gap-2">
                      <form action={respondToRequest.bind(null, r.id, "accepted")}>
                        <ConfettiButton>Accept</ConfettiButton>
                      </form>
                      <form action={respondToRequest.bind(null, r.id, "declined")}>
                        <Button variant="secondary" className="px-3 py-1.5 text-xs">Decline</Button>
                      </form>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {accepted.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-[var(--success)]">Accepted — your crew</h3>
                <div className="flex flex-col gap-3">
                  {accepted.map((r) => (
                    <div key={r.id} className="rounded-[12px] border border-[var(--success)]/35 bg-[var(--success-soft)] p-3">
                      <p className="text-sm font-medium">{r.requester.name ?? r.requester.email}</p>
                      <div className="mt-2"><Contact u={r.requester} /></div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {declined.length > 0 && <p className="mt-3 text-xs text-faint">{declined.length} declined</p>}
          </div>
        </section>
      ) : (
        <Card>
          {!myReq && post.status === "open" && (
            <form action={requestToJoin.bind(null, post.id)} className="flex flex-col gap-3">
              <span className="text-sm font-medium">Request to join</span>
              <Textarea name="message" rows={3} placeholder="Say what you bring (1–2 lines)." />
              <Button type="submit" className="self-start">Send request</Button>
            </form>
          )}

          {!myReq && post.status === "closed" && <p className="text-sm text-muted">This post is closed.</p>}

          {myReq?.status === "pending" && (
            <p className="text-sm text-muted">
              ✅ Request sent — waiting for {post.author.name ?? "the author"} to respond.
            </p>
          )}

          {myReq?.status === "accepted" && (
            <div className="flex flex-col gap-2">
              <Confetti fireKey={`join-${myReq.id}`} />
              <p className="text-sm font-semibold text-[var(--success)]">
                🎉 You&apos;re in! Here&apos;s how to reach {post.author.name ?? "the author"}:
              </p>
              <Contact u={post.author} />
            </div>
          )}

          {myReq?.status === "declined" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-muted">This request was declined.</p>
              {post.status === "open" && (
                <form action={requestToJoin.bind(null, post.id)} className="flex flex-col gap-2">
                  <Textarea name="message" rows={2} placeholder="Try again with a note." />
                  <Button type="submit" variant="secondary" className="self-start px-3 py-1.5 text-xs">
                    Request again
                  </Button>
                </form>
              )}
            </div>
          )}
        </Card>
      )}
    </main>
  );
}
