import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { PageHeader, Card } from "@/components/ui";
import { CountUp } from "@/components/CountUp";

function StatTile({ value, label, hint }: { value: number; label: string; hint?: string }) {
  return (
    <Card className="flex flex-col gap-1">
      <span className="text-3xl font-bold tracking-tight">
        <CountUp value={value} />
      </span>
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="text-xs text-faint">{hint}</span>}
    </Card>
  );
}

export default async function StatsPage() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const [profiles, posts, teams, connections] = await Promise.all([
    prisma.user.count(),
    prisma.post.count(),
    prisma.joinRequest.count({ where: { status: "accepted" } }),
    prisma.connectRequest.count({ where: { status: "accepted" } }),
  ]);

  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Stats" subtitle="North-star: teams + connections formed." />
      <div className="grid grid-cols-2 gap-4">
        <StatTile value={profiles} label="Profiles" />
        <StatTile value={posts} label="Posts" />
        <StatTile value={teams} label="Teams formed" hint="accepted join requests" />
        <StatTile value={connections} label="Connections" hint="accepted connect requests" />
      </div>
    </main>
  );
}
