import Link from "next/link";
import { SKILLS, ROLES, OPEN_TO } from "@/lib/skills";
import type { PeopleFilter } from "@/lib/matchScore";

const input =
  "rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700";
const label = "text-xs font-medium text-gray-500";

// GET form → filters live in the URL query string (shareable, no client JS).
export function FilterBar({ filter }: { filter: PeopleFilter }) {
  const skillSet = new Set(filter.skills);
  const openSet = new Set(filter.openTo);

  return (
    <form method="get" action="/people" className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label className={label}>Role</label>
          <select name="role" defaultValue={filter.role ?? ""} className={input}>
            <option value="">any</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className={label}>Min years exp</label>
          <input name="minYears" type="number" min={0} max={50} defaultValue={filter.minYears ?? ""} className={input} />
        </div>
        <div className="flex flex-col gap-1">
          <label className={label}>Location</label>
          <input name="location" defaultValue={filter.location ?? ""} placeholder="Delhi" className={input} />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className={label}>Stack</span>
        <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-5">
          {SKILLS.map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="skills" value={s} defaultChecked={skillSet.has(s)} />
              {s}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <span className={label}>Open to</span>
        <div className="flex flex-wrap gap-3">
          {OPEN_TO.map((o) => (
            <label key={o} className="flex items-center gap-1.5 text-sm">
              <input type="checkbox" name="openTo" value={o} defaultChecked={openSet.has(o)} />
              {o}
            </label>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black"
        >
          Search
        </button>
        <Link
          href="/people"
          className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
        >
          Clear
        </Link>
      </div>
    </form>
  );
}
