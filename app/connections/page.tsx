import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { respondConnect } from "./actions";

function PersonLink({ user }: { user: { id: string; name: string | null; email: string } }) {
  return (
    <Link href={`/u/${user.id}`} className="font-medium hover:underline">
      {user.name ?? user.email}
    </Link>
  );
}

export default async function ConnectionsPage() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const [incoming, sent, accepted] = await Promise.all([
    prisma.connectRequest.findMany({
      where: { toId: me.id, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: { from: true },
    }),
    prisma.connectRequest.findMany({
      where: { fromId: me.id, status: "pending" },
      orderBy: { createdAt: "desc" },
      include: { to: true },
    }),
    prisma.connectRequest.findMany({
      where: { status: "accepted", OR: [{ fromId: me.id }, { toId: me.id }] },
      orderBy: { createdAt: "desc" },
      include: { from: true, to: true },
    }),
  ]);

  return (
    <main className="flex flex-col gap-8">
      <h1 className="text-xl font-bold">Connections</h1>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Requests to you{incoming.length > 0 ? ` (${incoming.length})` : ""}
        </h2>
        {incoming.length === 0 ? (
          <p className="text-sm text-gray-500">No pending requests.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {incoming.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-800">
                <p className="text-sm">
                  <PersonLink user={r.from} />
                  {r.from.role ? ` · ${r.from.role}` : ""}
                </p>
                {r.message && <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{r.message}</p>}
                <div className="mt-3 flex gap-2">
                  <form action={respondConnect.bind(null, r.id, "accepted")}>
                    <button className="rounded-md bg-green-600 px-3 py-1 text-sm font-medium text-white hover:bg-green-700">
                      Accept
                    </button>
                  </form>
                  <form action={respondConnect.bind(null, r.id, "declined")}>
                    <button className="rounded-md border border-gray-300 px-3 py-1 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
                      Decline
                    </button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Your connections</h2>
        {accepted.length === 0 ? (
          <p className="text-sm text-gray-500">
            None yet. <Link href="/people" className="underline">Find people</Link>.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {accepted.map((r) => {
              const other = r.fromId === me.id ? r.to : r.from;
              return (
                <div key={r.id} className="flex items-center justify-between rounded-lg border border-green-600/40 p-3">
                  <div>
                    <PersonLink user={other} />
                    <p className="text-sm text-gray-500">{other.role ?? ""}</p>
                  </div>
                  <div className="flex gap-2 text-sm">
                    {other.githubUrl && (
                      <a href={other.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">GitHub</a>
                    )}
                    {other.linkedinUrl && (
                      <a href={other.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">LinkedIn</a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {sent.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Sent — pending</h2>
          <div className="flex flex-col gap-2">
            {sent.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 p-3 text-sm dark:border-gray-800">
                <PersonLink user={r.to} /> <span className="text-gray-500">· waiting</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
