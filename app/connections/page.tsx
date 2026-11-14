import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { PageHeader } from "@/components/ui";
import { ConnectionsClient } from "./ConnectionsClient";

const person = (u: {
  id: string; name: string | null; email: string; role: string | null;
  githubUrl: string | null; linkedinUrl: string | null;
}) => ({ id: u.id, name: u.name, email: u.email, role: u.role, githubUrl: u.githubUrl, linkedinUrl: u.linkedinUrl });

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
      <ConnectionsClient
        initialRequests={incoming.map((r) => ({ id: r.id, message: r.message, from: person(r.from) }))}
        initialConnections={accepted.map((r) => ({
          id: r.id,
          other: person(r.fromId === me.id ? r.to : r.from),
        }))}
        sent={sent.map((r) => ({ id: r.id, to: { id: r.to.id, name: r.to.name, email: r.to.email } }))}
      />
    </main>
  );
}
