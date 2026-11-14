import Link from "next/link";
import { SkillTags } from "@/components/SkillTags";

const TYPE_LABEL: Record<string, string> = {
  hackathon: "🏆 Hackathon",
  project: "🛠️ Project",
  study: "📚 Study",
};

export type PostCardData = {
  id: string;
  type: string;
  title: string;
  neededSkills: string[];
  teamSize: number;
  happeningAt: Date | null;
  status: string;
  author: { name: string | null; branch: string | null };
};

export function PostCard({
  post,
  viewerSkills,
  fit,
}: {
  post: PostCardData;
  viewerSkills?: string[];
  fit?: number; // 0-100, shown in Phase 2
}) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="block rounded-lg border border-gray-200 p-4 transition hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
    >
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs text-gray-500">{TYPE_LABEL[post.type] ?? post.type}</span>
        <span className="flex items-center gap-2">
          {post.status === "closed" && (
            <span className="rounded bg-gray-200 px-1.5 py-0.5 text-xs text-gray-600 dark:bg-gray-800">
              closed
            </span>
          )}
          {fit != null && (
            <span className="rounded bg-green-600/15 px-1.5 py-0.5 text-xs font-medium text-green-700 dark:text-green-300">
              {fit}% fit
            </span>
          )}
        </span>
      </div>
      <h3 className="font-semibold">{post.title}</h3>
      <p className="mb-2 text-sm text-gray-500">
        {post.author.name ?? "Someone"}
        {post.author.branch ? ` · ${post.author.branch}` : ""} · team of {post.teamSize}
        {post.happeningAt ? ` · ${post.happeningAt.toLocaleDateString()}` : ""}
      </p>
      <SkillTags skills={post.neededSkills} highlight={viewerSkills} />
    </Link>
  );
}
