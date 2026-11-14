import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { FilterBar } from "@/components/FilterBar";
import { ProfileCard } from "@/components/ProfileCard";
import { PageHeader } from "@/components/ui";
import {
  peopleFit,
  completeness,
  hasActiveFilter,
  type PeopleFilter,
} from "@/lib/matchScore";

const asArray = (v: string | string[] | undefined) =>
  v == null ? [] : Array.isArray(v) ? v : [v];

const asString = (v: string | string[] | undefined) => {
  const s = Array.isArray(v) ? v[0] : v;
  return s && s.trim() ? s.trim() : null;
};

export default async function PeoplePage({ searchParams }: PageProps<"/people">) {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const sp = await searchParams;
  const minYearsRaw = asString(sp.minYears);
  const minYearsNum = minYearsRaw != null ? Number(minYearsRaw) : NaN;
  const filter: PeopleFilter = {
    skills: asArray(sp.skills).map(String),
    role: asString(sp.role),
    minYears: Number.isFinite(minYearsNum) ? minYearsNum : null,
    location: asString(sp.location),
    openTo: asArray(sp.openTo).map(String),
  };

  const users = await prisma.user.findMany({
    where: { id: { not: me.id } },
    select: {
      id: true, name: true, email: true, image: true, role: true, location: true,
      yearsExperience: true, skills: true, openTo: true, bio: true, githubRepos: true,
      createdAt: true,
    },
  });

  const active = hasActiveFilter(filter);
  const ranked = users
    .map((u) => ({ u, fit: active ? peopleFit(u, filter) : 0 }))
    .sort((a, b) =>
      active ? b.fit - a.fit : completeness(b.u) - completeness(a.u) ||
      +b.u.createdAt - +a.u.createdAt
    );

  return (
    <main className="flex flex-col gap-5">
      <PageHeader
        title="People"
        subtitle="Filter by stack, experience, role and location — ranked by fit."
      />

      <FilterBar filter={filter} />

      <p className="text-sm text-muted">
        {ranked.length} {ranked.length === 1 ? "person" : "people"}
        {active ? " — ranked by fit" : ""}
      </p>

      <div className="flex flex-col gap-3">
        {ranked.map(({ u, fit }) => (
          <ProfileCard
            key={u.id}
            user={u}
            highlightSkills={filter.skills}
            fit={active ? fit : undefined}
          />
        ))}
      </div>
    </main>
  );
}
