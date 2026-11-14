import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { SkillTags } from "@/components/SkillTags";
import { GithubHighlights } from "@/components/GithubHighlights";
import type { GithubRepo } from "@/lib/github";
import { sendConnect, respondConnect } from "@/app/connections/actions";

function ContactLinks({ githubUrl, linkedinUrl }: { githubUrl: string | null; linkedinUrl: string | null }) {
  const links = [
    githubUrl && { label: "GitHub", href: githubUrl },
    linkedinUrl && { label: "LinkedIn", href: linkedinUrl },
  ].filter(Boolean) as { label: string; href: string }[];
  if (links.length === 0) return <p className="text-sm text-gray-500">No links on their profile.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
          className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
          {l.label}
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

  // Connect state between me and this user (either direction)
  const [outgoing, incoming] =
    me && !isMe
      ? await Promise.all([
          prisma.connectRequest.findUnique({ where: { fromId_toId: { fromId: me.id, toId: user.id } } }),
          prisma.connectRequest.findUnique({ where: { fromId_toId: { fromId: user.id, toId: me.id } } }),
        ])
      : [null, null];
  const connected = outgoing?.status === "accepted" || incoming?.status === "accepted";

  return (
    <main className="flex flex-col gap-6">
      <div>
        <Link href="/people" className="text-sm text-gray-500 hover:underline">
          ← People
        </Link>
      </div>

      <header className="flex items-start gap-4">
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="h-16 w-16 rounded-full" />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200 text-xl font-semibold dark:bg-gray-800">
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{user.name ?? user.email}</h1>
          <p className="text-sm text-gray-500">
            {[user.role, user.location, user.branch && `${user.branch}${user.year ? ` · Y${user.year}` : ""}`]
              .filter(Boolean)
              .join(" · ")}
            {user.yearsExperience != null ? ` · ${user.yearsExperience} yr exp` : ""}
          </p>
          {isMe && (
            <Link href="/profile" className="text-sm text-blue-600 hover:underline">
              Edit your profile
            </Link>
          )}
        </div>
      </header>

      {user.bio && <p className="whitespace-pre-wrap">{user.bio}</p>}

      {user.skills.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">Skills</p>
          <SkillTags skills={user.skills} />
        </div>
      )}

      {user.openTo.length > 0 && (
        <div>
          <p className="mb-1 text-xs font-medium text-gray-500">Open to</p>
          <SkillTags skills={user.openTo} />
        </div>
      )}

      <GithubHighlights githubUrl={user.githubUrl} githubBio={user.githubBio} repos={repos} />

      {/* Connect: request → accept → reveal LinkedIn */}
      {!isMe && me && (
        <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          {connected ? (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                ✅ Connected — reach out:
              </p>
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
                  <button className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700">
                    Accept
                  </button>
                </form>
                <form action={respondConnect.bind(null, incoming.id, "declined")}>
                  <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                    Decline
                  </button>
                </form>
              </div>
            </div>
          ) : outgoing?.status === "pending" ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ✅ Connect request sent — waiting for {user.name ?? "them"} to accept.
            </p>
          ) : (
            <form action={sendConnect.bind(null, user.id)} className="flex flex-col gap-3">
              <label className="text-sm font-medium">
                Connect with {user.name ?? "this person"}
              </label>
              {outgoing?.status === "declined" && (
                <p className="text-xs text-gray-500">Your earlier request was declined — you can try again.</p>
              )}
              <textarea
                name="message"
                rows={2}
                placeholder="Say why you'd like to connect (1–2 lines)."
                className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700"
              />
              <button className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black">
                Request to connect
              </button>
            </form>
          )}
        </section>
      )}
    </main>
  );
}
