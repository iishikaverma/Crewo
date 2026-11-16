import Link from "next/link";
import { SkillTags } from "@/components/SkillTags";
import { Badge, Avatar } from "@/components/ui";
import { FitRing } from "@/components/FitRing";
import { PostType } from "@/components/PostType";

export type PostCardData = {
  id: string;
  type: string;
  title: string;
  neededSkills: string[];
  teamSize: number;
  happeningAt: Date | null;
  status: string;
  author: { name: string | null; branch: string | null; image?: string | null };
};

export function PostCard({
  post,
  viewerSkills,
  fit,
  reasons,
}: {
  post: PostCardData;
  viewerSkills?: string[];
  fit?: number;
  reasons?: string[];
}) {
  return (
    <Link
      href={`/posts/${post.id}`}
      className="glow-card group relative block overflow-hidden rounded-[12px] border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-strong hover:bg-surface-2"
    >
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="text-xs text-muted"><PostType type={post.type} /></span>
        <span className="flex items-center gap-2">
          {post.status === "closed" && <Badge>closed</Badge>}
          {fit != null && <FitRing fit={fit} size={38} />}
        </span>
      </div>
      <h3 className="font-semibold tracking-tight transition-colors group-hover:text-fg">
        {post.title}
      </h3>
      <div className="mb-2.5 mt-1.5 flex items-center gap-2 text-sm text-muted">
        <Avatar src={post.author.image ?? null} name={post.author.name} size={20} />
        <span className="truncate">
          {post.author.name ?? "Someone"}
          {post.author.branch ? ` · ${post.author.branch}` : ""} · team of {post.teamSize}
          {post.happeningAt ? ` · ${post.happeningAt.toLocaleDateString()}` : ""}
        </span>
      </div>
      <SkillTags skills={post.neededSkills} highlight={viewerSkills} />
      {reasons && reasons.length > 0 && (
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--success)]">
          <span className="text-muted">why:</span>
          {reasons.map((r, i) => (
            <span key={i}>
              {r}
              {i < reasons.length - 1 ? " ·" : ""}
            </span>
          ))}
        </p>
      )}
    </Link>
  );
}
