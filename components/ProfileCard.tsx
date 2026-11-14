import Link from "next/link";
import { SkillTags } from "@/components/SkillTags";

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
      className="flex gap-3 rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
    >
      {user.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={user.image} alt="" className="h-12 w-12 shrink-0 rounded-full" />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gray-200 font-semibold dark:bg-gray-800">
          {(user.name ?? user.email).charAt(0).toUpperCase()}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate font-semibold">{user.name ?? user.email}</h3>
          {fit != null && (
            <span className="shrink-0 rounded bg-green-600/15 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
              {fit}% fit
            </span>
          )}
        </div>
        {meta && <p className="text-sm text-gray-500">{meta}</p>}
        {user.bio && <p className="mt-0.5 line-clamp-1 text-sm text-gray-500">{user.bio}</p>}
        <div className="mt-2">
          <SkillTags skills={user.skills} highlight={highlightSkills} />
        </div>
      </div>
    </Link>
  );
}
