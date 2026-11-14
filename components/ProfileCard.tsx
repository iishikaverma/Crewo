import Link from "next/link";
import { SkillTags } from "@/components/SkillTags";
import { Avatar } from "@/components/ui";
import { FitRing } from "@/components/FitRing";

export type ProfileCardData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string | null;
  location: string | null;
  yearsExperience: number | null;
  skills: string[];
  bio: string | null;
};

export function ProfileCard({
  user,
  highlightSkills,
  fit,
}: {
  user: ProfileCardData;
  highlightSkills?: string[];
  fit?: number;
}) {
  const meta = [
    user.role,
    user.location,
    user.yearsExperience != null ? `${user.yearsExperience} yr exp` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <Link
      href={`/u/${user.id}`}
      className="glow-card group relative flex gap-3 overflow-hidden rounded-[12px] border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2"
    >
      <Avatar src={user.image} name={user.name} size={48} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold tracking-tight">{user.name ?? user.email}</h3>
          {fit != null && <FitRing fit={fit} size={38} />}
        </div>
        {meta && <p className="text-sm text-muted">{meta}</p>}
        {user.bio && <p className="mt-0.5 line-clamp-1 text-sm text-faint">{user.bio}</p>}
        <div className="mt-2">
          <SkillTags skills={user.skills} highlight={highlightSkills} />
        </div>
      </div>
    </Link>
  );
}
