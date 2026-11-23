import Link from "next/link";
import { Badge } from "@/components/ui";
import { TypeGlyph } from "@/components/PostType";

export type MyPost = {
  id: string;
  type: string;
  title: string;
  status: string;
  teamSize: number;
  requests: { status: string }[];
};

export function MyPostRow({ post }: { post: MyPost }) {
  const pending = post.requests.filter((r) => r.status === "pending").length;
  const filled = 1 + post.requests.filter((r) => r.status === "accepted").length;
  const closed = post.status === "closed";

  return (
    <Link
      href={`/posts/${post.id}`}
      className={
        "block rounded-[10px] border border-border bg-surface px-3 py-2 transition-colors hover:border-border-strong " +
        (closed ? "opacity-60" : "")
      }
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-sm">
          <TypeGlyph type={post.type} className="shrink-0 text-muted" />
          <span className="truncate font-medium">{post.title}</span>
        </span>
        {pending > 0 && <Badge tone="warm" className="shrink-0">{pending} new</Badge>}
      </div>
      <div className="mt-1.5 flex items-center gap-2 text-xs text-muted">
        {closed ? <Badge tone="muted">closed</Badge> : <Badge tone="success">open</Badge>}
        <span>{filled}/{post.teamSize} filled</span>
      </div>
    </Link>
  );
}
