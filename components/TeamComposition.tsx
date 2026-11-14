import { Card } from "@/components/ui";

// Visual "team composition": how many spots are filled, and which needed skills
// the current crew (author + accepted members) already covers vs. still open.
export function TeamComposition({
  neededSkills,
  memberSkills,
  filled,
  teamSize,
}: {
  neededSkills: string[];
  memberSkills: string[]; // flattened skills of author + accepted members
  filled: number;
  teamSize: number;
}) {
  const have = new Set(memberSkills.map((s) => s.toLowerCase()));
  const pct = teamSize > 0 ? Math.min(100, Math.round((filled / teamSize) * 100)) : 0;

  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Team composition</h2>
        <span className="text-xs text-muted">{filled}/{teamSize} spots filled</span>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
          style={{ width: `${pct}%` }}
        />
      </div>

      {neededSkills.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {neededSkills.map((s) => {
            const covered = have.has(s.toLowerCase());
            return (
              <li key={s} className="flex items-center gap-2 text-sm">
                <span
                  className={
                    covered
                      ? "grid h-4 w-4 place-items-center rounded-full bg-[var(--success-soft)] text-[10px] text-[var(--success)]"
                      : "grid h-4 w-4 place-items-center rounded-full border border-border text-[10px] text-faint"
                  }
                >
                  {covered ? "✓" : ""}
                </span>
                <span className={covered ? "text-fg" : "text-muted"}>{s}</span>
                {!covered && <span className="text-xs text-faint">· open</span>}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
