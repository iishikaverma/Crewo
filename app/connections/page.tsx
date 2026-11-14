import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { respondConnect } from "./actions";
import { PageHeader, Card, Button, EmptyState } from "@/components/ui";

function PersonLink({ user }: { user: { id: string; name: string | null; email: string } }) {
  return (
    <Link href={`/u/${user.id}`} className="font-medium hover:text-accent-2 hover:underline">
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
      <PageHeader title="Connections" />

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Requests to you{incoming.length > 0 ? ` (${incoming.length})` : ""}
        </h2>
        {incoming.length === 0 ? (
          <EmptyState>No pending requests.</EmptyState>
        ) : (
          incoming.map((r) => (
            <Card key={r.id}>
              <p className="text-sm">
                <PersonLink user={r.from} />
                {r.from.role ? ` · ${r.from.role}` : ""}
              </p>
              {r.message && <p className="mt-1 text-sm text-muted">{r.message}</p>}
              <div className="mt-3 flex gap-2">
                <form action={respondConnect.bind(null, r.id, "accepted")}>
                  <Button className="px-3 py-1.5 text-xs">Accept</Button>
                </form>
                <form action={respondConnect.bind(null, r.id, "declined")}>
                  <Button variant="secondary" className="px-3 py-1.5 text-xs">Decline</Button>
                </form>
              </div>
            </Card>
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Your connections</h2>
        {accepted.length === 0 ? (
          <EmptyState>
            None yet. <Link href="/people" className="text-accent-2 hover:underline">Find people</Link>.
          </EmptyState>
        ) : (
          accepted.map((r) => {
            const other = r.fromId === me.id ? r.to : r.from;
            return (
              <Card key={r.id} className="flex items-center justify-between">
                <div>
                  <PersonLink user={other} />
                  <p className="text-sm text-muted">{other.role ?? ""}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  {other.githubUrl && (
                    <a href={other.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">GitHub</a>
                  )}
                  {other.linkedinUrl && (
                    <a href={other.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">LinkedIn</a>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </section>

      {sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Sent — pending</h2>
          {sent.map((r) => (
            <Card key={r.id} className="py-3 text-sm">
              <PersonLink user={r.to} /> <span className="text-muted">· waiting</span>
            </Card>
          ))}
        </section>
      )}
    </main>
  );
}
