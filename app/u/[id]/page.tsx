import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { SkillTags } from "@/components/SkillTags";
import { GithubHighlights } from "@/components/GithubHighlights";
import type { GithubRepo, GithubStats } from "@/lib/github";
import { sendConnect, respondConnect } from "@/app/connections/actions";
import { Avatar, Button, Card } from "@/components/ui";

function ContactLinks({ githubUrl, linkedinUrl }: { githubUrl: string | null; linkedinUrl: string | null }) {
  const links = [
    githubUrl && { label: "GitHub", href: githubUrl },
    linkedinUrl && { label: "LinkedIn", href: linkedinUrl },
  ].filter(Boolean) as { label: string; href: string }[];
  if (links.length === 0) return <p className="text-sm text-muted">No links on their profile.</p>;
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

export default async function PublicProfile({ params }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const me = await currentUser();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isMe = me?.id === user.id;
  const repos = (user.githubRepos as unknown as GithubRepo[] | null) ?? [];
  const githubStats = (user.githubStats as unknown as GithubStats | null) ?? null;

  const [outgoing, incoming] =
    me && !isMe
      ? await Promise.all([
          prisma.connectRequest.findUnique({ where: { fromId_toId: { fromId: me.id, toId: user.id } } }),
          prisma.connectRequest.findUnique({ where: { fromId_toId: { fromId: user.id, toId: me.id } } }),
        ])
      : [null, null];
  const connected = outgoing?.status === "accepted" || incoming?.status === "accepted";

  const meta = [user.role, user.location, user.branch && `${user.branch}${user.year ? ` · Y${user.year}` : ""}`]
    .filter(Boolean)
    .join(" · ");

  return (
    <main className="flex flex-col gap-6">
      <Link href="/people" className="text-sm text-muted hover:text-fg">← People</Link>

      <header className="flex items-start gap-4">
        <Avatar src={user.image} name={user.name ?? user.email} size={64} />
        <div className="flex-1">
          <h1 className="text-2xl font-bold tracking-tight">{user.name ?? user.email}</h1>
          <p className="text-sm text-muted">
            {meta}
            {user.yearsExperience != null ? `${meta ? " · " : ""}${user.yearsExperience} yr exp` : ""}
          </p>
          {isMe && (
            <Link href="/profile" className="text-sm text-accent-2 hover:underline">Edit your profile</Link>
          )}
        </div>
      </header>

      {user.bio && <p className="whitespace-pre-wrap text-fg/90">{user.bio}</p>}

      {user.skills.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Skills</p>
          <SkillTags skills={user.skills} />
        </div>
      )}

      {user.openTo.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-muted">Open to</p>
          <SkillTags skills={user.openTo} />
        </div>
      )}

      <GithubHighlights githubUrl={user.githubUrl} githubBio={user.githubBio} repos={repos} stats={githubStats} />

      {!isMe && me && (
        <Card>
          {connected ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-[var(--success)]">✅ Connected — reach out:</p>
              <ContactLinks githubUrl={user.githubUrl} linkedinUrl={user.linkedinUrl} />
            </div>
          ) : incoming?.status === "pending" ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm">
                <span className="font-semibold">{user.name ?? "They"}</span> want to connect
                {incoming.message ? `: "${incoming.message}"` : "."}
              </p>
              <div className="flex gap-2">
                <form action={respondConnect.bind(null, incoming.id, "accepted")}>
                  <Button className="px-3 py-1.5 text-xs">Accept</Button>
                </form>
                <form action={respondConnect.bind(null, incoming.id, "declined")}>
                  <Button variant="secondary" className="px-3 py-1.5 text-xs">Decline</Button>
                </form>
              </div>
            </div>
          ) : outgoing?.status === "pending" ? (
            <p className="text-sm text-muted">
              ✅ Connect request sent — waiting for {user.name ?? "them"} to accept.
            </p>
          ) : (
            <form action={sendConnect.bind(null, user.id)} className="flex flex-col gap-3">
              <span className="text-sm font-medium">Connect with {user.name ?? "this person"}</span>
              {outgoing?.status === "declined" && (
                <p className="text-xs text-muted">Your earlier request was declined — you can try again.</p>
              )}
              <textarea
                name="message"
                rows={2}
                placeholder="Say why you'd like to connect (1–2 lines)."
                className="w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint focus:border-accent"
              />
              <Button type="submit" className="self-start">Request to connect</Button>
            </form>
          )}
        </Card>
      )}
    </main>
  );
}
