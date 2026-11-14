import Link from "next/link";
import { SKILLS, ROLES, OPEN_TO } from "@/lib/skills";
import type { PeopleFilter } from "@/lib/matchScore";
import { Card, Field, Input, Select, Button } from "@/components/ui";

// GET form → filters live in the URL query string (shareable, no client JS).
export function FilterBar({ filter }: { filter: PeopleFilter }) {
  const skillSet = new Set(filter.skills);
  const openSet = new Set(filter.openTo);

  return (
    <Card>
      <form method="get" action="/people" className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Role">
            <Select name="role" defaultValue={filter.role ?? ""}>
              <option value="">any</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Min years exp">
            <Input name="minYears" type="number" min={0} max={50} defaultValue={filter.minYears ?? ""} />
          </Field>
          <Field label="Location">
            <Input name="location" defaultValue={filter.location ?? ""} placeholder="Delhi" />
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">Stack</span>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 sm:grid-cols-5">
            {SKILLS.map((s) => (
              <label key={s} className="flex items-center gap-1.5 font-mono text-xs text-muted">
                <input type="checkbox" name="skills" value={s} defaultChecked={skillSet.has(s)} className="accent-[var(--accent)]" />
                {s}
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">Open to</span>
          <div className="flex flex-wrap gap-3">
            {OPEN_TO.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm text-muted">
                <input type="checkbox" name="openTo" value={o} defaultChecked={openSet.has(o)} className="accent-[var(--accent)]" />
                {o}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <Button type="submit">Search</Button>
          <Link href="/people">
            <Button type="button" variant="secondary">Clear</Button>
          </Link>
        </div>
      </form>
    </Card>
  );
}
