import { redirect } from "next/navigation";
import { currentUser } from "@/lib/user";
import { SKILLS, ROLES, OPEN_TO } from "@/lib/skills";
import { updateProfile } from "./actions";

const input =
  "w-full rounded-md border border-gray-300 bg-transparent p-2 text-sm dark:border-gray-700";
const label = "text-sm font-medium text-gray-600 dark:text-gray-400";

export default async function ProfilePage() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const skillSet = new Set(me.skills);
  const otherSkills = me.skills.filter((s) => !(SKILLS as readonly string[]).includes(s));
  const openToSet = new Set(me.openTo);

  return (
    <main>
      <h1 className="mb-1 text-xl font-bold">Your profile</h1>
      <p className="mb-6 text-sm text-gray-500">
        Skills, role and experience power the People directory and your match score.
      </p>

      <form action={updateProfile} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1">
          <label className={label}>Name</label>
          <input name="name" defaultValue={me.name ?? ""} className={input} required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={label}>Role</label>
            <select name="role" defaultValue={me.role ?? ""} className={input}>
              <option value="">—</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>Years of experience</label>
            <input
              name="yearsExperience"
              type="number"
              min={0}
              max={50}
              defaultValue={me.yearsExperience ?? ""}
              className={input}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className={label}>Location</label>
            <input name="location" defaultValue={me.location ?? ""} placeholder="Delhi" className={input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>Year / branch</label>
            <div className="flex gap-2">
              <input name="year" defaultValue={me.year ?? ""} placeholder="3" className={input} />
              <input name="branch" defaultValue={me.branch ?? ""} placeholder="CSE" className={input} />
            </div>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className={label}>Stack / skills</legend>
          <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
            {SKILLS.map((s) => (
              <label key={s} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="skills" value={s} defaultChecked={skillSet.has(s)} />
                {s}
              </label>
            ))}
          </div>
          <input
            name="skillsOther"
            defaultValue={otherSkills.join(", ")}
            placeholder="other skills, comma-separated"
            className={input}
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2">
          <legend className={label}>Open to</legend>
          <div className="flex flex-wrap gap-3">
            {OPEN_TO.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm">
                <input type="checkbox" name="openTo" value={o} defaultChecked={openToSet.has(o)} />
                {o}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-col gap-1">
          <label className={label}>Looking for</label>
          <input
            name="lookingFor"
            defaultValue={me.lookingFor ?? ""}
            placeholder="backend + designer for a weekend hack"
            className={input}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className={label}>About / bio</label>
          <textarea name="bio" defaultValue={me.bio ?? ""} rows={3} className={input} />
        </div>

        <fieldset className="flex flex-col gap-4 rounded-md border border-dashed border-gray-300 p-4 dark:border-gray-700">
          <legend className="px-1 text-xs text-gray-500">
            Links — GitHub is auto-fetched (avatar, bio, top repos). LinkedIn revealed on connect.
          </legend>
          <div className="flex flex-col gap-1">
            <label className={label}>GitHub URL</label>
            <input name="githubUrl" defaultValue={me.githubUrl ?? ""} placeholder="https://github.com/you" className={input} />
          </div>
          <div className="flex flex-col gap-1">
            <label className={label}>LinkedIn URL</label>
            <input name="linkedinUrl" defaultValue={me.linkedinUrl ?? ""} className={input} />
          </div>
        </fieldset>

        <button
          type="submit"
          className="self-start rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black"
        >
          Save profile
        </button>
      </form>
    </main>
  );
}
