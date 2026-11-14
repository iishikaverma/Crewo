export function SkillTags({
  skills,
  highlight,
}: {
  skills: string[];
  highlight?: string[]; // ponytail: matched skills get emphasis (used for fit in Phase 2)
}) {
  if (skills.length === 0) return null;
  const hot = new Set((highlight ?? []).map((s) => s.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <span
          key={s}
          className={
            "rounded-full px-2 py-0.5 text-xs " +
            (hot.has(s.toLowerCase())
              ? "bg-green-600/20 text-green-700 dark:text-green-300"
              : "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300")
          }
        >
          {s}
        </span>
      ))}
    </div>
  );
}
