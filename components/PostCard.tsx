import Link from "next/link";
import { SkillTags } from "@/components/SkillTags";
import { Badge, FitBadge } from "@/components/ui";

const TYPE_LABEL: Record<string, string> = {
  hackathon: "🏆 Hackathon",
  project: "🛠️ Project",
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
  fit?: number;
}) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="group block rounded-[12px] border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs text-muted">{TYPE_LABEL[post.type] ?? post.type}</span>
        <span className="flex items-center gap-2">
          {post.status === "closed" && <Badge>closed</Badge>}
          {fit != null && <FitBadge fit={fit} />}
        </span>
      </div>
      <h3 className="font-semibold tracking-tight transition-colors group-hover:text-fg">
        {post.title}
      </h3>
      <p className="mb-2.5 text-sm text-muted">
        {post.author.name ?? "Someone"}
        {post.author.branch ? ` · ${post.author.branch}` : ""} · team of {post.teamSize}
        {post.happeningAt ? ` · ${post.happeningAt.toLocaleDateString()}` : ""}
      </p>
      <SkillTags skills={post.neededSkills} highlight={viewerSkills} />
    </Link>
  );
}
