import { SkillChip } from "@/components/ui";

export function SkillTags({
  skills,
  highlight,
}: {
  skills: string[];
  highlight?: string[];
}) {
  if (skills.length === 0) return null;
  const hot = new Set((highlight ?? []).map((s) => s.toLowerCase()));
  return (
    <div className="flex flex-wrap gap-1.5">
      {skills.map((s) => (
        <SkillChip key={s} active={hot.has(s.toLowerCase())}>
          {s}
        </SkillChip>
      ))}
    </div>
  );
}
