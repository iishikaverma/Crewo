import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/user";
import { SkillTags } from "@/components/SkillTags";
import { GithubHighlights } from "@/components/GithubHighlights";
import type { GithubRepo } from "@/lib/github";

export default async function PublicProfile({ params }: PageProps<"/u/[id]">) {
  const { id } = await params;
  const me = await currentUser();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  const isMe = me?.id === user.id;
  const repos = (user.githubRepos as unknown as GithubRepo[] | null) ?? [];

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

      {/* Connect flow (request → accept → reveal LinkedIn) lands in Stage 2C */}
      {!isMe && me && (
        <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700">
          Connect requests arrive in the next stage.
        </div>
      )}
    </main>
  );
}
