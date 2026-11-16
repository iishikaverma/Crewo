// Post-type label text + a small inline icon (replaces the old 🏆 / 🛠️ emoji).
export const TYPE_LABEL: Record<string, string> = {
  hackathon: "Hackathon",
  project: "Project",
};

const PATHS: Record<string, string> = {
  // trophy
  hackathon:
    "M6.5 4h7v2.5a3.5 3.5 0 0 1-7 0V4Zm0 1H4v1a2.5 2.5 0 0 0 2.5 2.5m7-3.5H16v1a2.5 2.5 0 0 1-2.5 2.5M10 10v3m-3 2.5h6m-4.5-2.5h3",
  // wrench
  project:
    "M13.8 4.2a3.2 3.2 0 0 0-4 4.2l-5 5a1.4 1.4 0 0 0 2 2l5-5a3.2 3.2 0 0 0 4.2-4l-2.2 2.2-1.8-.4-.4-1.8 2.2-2.2Z",
};

export function TypeGlyph({ type, className = "" }: { type: string; className?: string }) {
  const d = PATHS[type];
  if (!d) return null;
  return (
    <svg
      width="13" height="13" viewBox="0 0 20 20" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      className={className} aria-hidden
    >
      <path d={d} />
    </svg>
  );
}

export function PostType({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <TypeGlyph type={type} />
      {TYPE_LABEL[type] ?? type}
    </span>
  );
}
