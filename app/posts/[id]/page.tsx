import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { SkillTags } from "@/components/SkillTags";
import { requestToJoin, respondToRequest, setPostStatus } from "../actions";

const TYPE_LABEL: Record<string, string> = {
  hackathon: "🏆 Hackathon",
  project: "🛠️ Project",
  study: "📚 Study",
};

type Contactable = {
  name: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
};

function Contact({ u }: { u: Contactable }) {
  const links: { label: string; href: string }[] = [];
  if (u.githubUrl) links.push({ label: "GitHub", href: u.githubUrl });
  if (u.linkedinUrl) links.push({ label: "LinkedIn", href: u.linkedinUrl });

  if (links.length === 0)
    return <p className="text-sm text-gray-500">No contact links on their profile yet.</p>;

  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          {l.label}
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
      requests: {
        orderBy: { createdAt: "asc" },
        include: { requester: true },
      },
    },
  });
  if (!post) notFound();

  const isAuthor = post.authorId === me.id;
  const myReq = post.requests.find((r) => r.requesterId === me.id);
  const pending = post.requests.filter((r) => r.status === "pending");
  const accepted = post.requests.filter((r) => r.status === "accepted");
  const declined = post.requests.filter((r) => r.status === "declined");

  return (
    <main className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm text-gray-500 hover:underline">
          ← Browse
        </Link>
      </div>

      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{TYPE_LABEL[post.type] ?? post.type}</span>
          {post.status === "closed" && (
            <span className="rounded bg-gray-200 px-1.5 py-0.5 dark:bg-gray-800">closed</span>
          )}
        </div>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-500">
          by {post.author.name ?? "Someone"}
          {post.author.branch ? ` · ${post.author.branch}` : ""} · team of {post.teamSize}
          {post.happeningAt ? ` · ${post.happeningAt.toLocaleDateString()}` : ""}
        </p>
        <p className="whitespace-pre-wrap">{post.description}</p>
        <div className="mt-1">
          <p className="mb-1 text-xs font-medium text-gray-500">Skills needed</p>
          <SkillTags skills={post.neededSkills} highlight={isAuthor ? [] : me.skills} />
        </div>
      </header>

      {isAuthor ? (
        <section className="flex flex-col gap-5">
          <form action={setPostStatus.bind(null, post.id, post.status === "open" ? "closed" : "open")}>
            <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
              {post.status === "open" ? "Close post (team formed)" : "Reopen post"}
            </button>
          </form>

          <div>
            <h2 className="mb-2 font-semibold">Requests to join</h2>
            {post.requests.length === 0 && (
              <p className="text-sm text-gray-500">No requests yet.</p>
            )}

            {pending.length > 0 && (
              <div className="flex flex-col gap-3">
                {pending.map((r) => (
                  <div key={r.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                    <p className="text-sm font-medium">
                      {r.requester.name ?? r.requester.email}
                      {r.requester.branch ? ` · ${r.requester.branch}` : ""}
                    </p>
                    <SkillTags skills={r.requester.skills} highlight={post.neededSkills} />
                    {r.message && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{r.message}</p>}
                    <div className="mt-3 flex gap-2">
                      <form action={respondToRequest.bind(null, r.id, "accepted")}>
                        <button className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700">
                          Accept
                        </button>
                      </form>
                      <form action={respondToRequest.bind(null, r.id, "declined")}>
                        <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                          Decline
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {accepted.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-green-700 dark:text-green-400">
                  Accepted — your crew
                </h3>
                <div className="flex flex-col gap-3">
                  {accepted.map((r) => (
                    <div key={r.id} className="rounded-lg border border-green-600/40 p-3">
                      <p className="text-sm font-medium">{r.requester.name ?? r.requester.email}</p>
                      <div className="mt-2">
                        <Contact u={r.requester} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {declined.length > 0 && (
              <p className="mt-3 text-xs text-gray-400">{declined.length} declined</p>
            )}
          </div>
        </section>
      ) : (
        <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
          {!myReq && post.status === "open" && (
            <form action={requestToJoin.bind(null, post.id)} className="flex flex-col gap-3">
              <label className="text-sm font-medium">Request to join</label>
              <textarea
                name="message"
                rows={3}
                placeholder="Say what you bring (1–2 lines)."
                className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700"
              />
              <button className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black">
                Send request
              </button>
            </form>
          )}

          {!myReq && post.status === "closed" && (
            <p className="text-sm text-gray-500">This post is closed.</p>
          )}

          {myReq?.status === "pending" && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              ✅ Request sent — waiting for {post.author.name ?? "the author"} to respond.
            </p>
          )}

          {myReq?.status === "accepted" && (
            <div className="flex flex-col gap-2">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">
                🎉 You&apos;re in! Here&apos;s how to reach {post.author.name ?? "the author"}:
              </p>
              <Contact u={post.author} />
            </div>
          )}

          {myReq?.status === "declined" && (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-gray-500">This request was declined.</p>
              {post.status === "open" && (
                <form action={requestToJoin.bind(null, post.id)} className="flex flex-col gap-2">
                  <textarea
                    name="message"
                    rows={2}
                    placeholder="Try again with a note."
                    className="w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700"
                  />
                  <button className="self-start rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                    Request again
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
