import { redirect } from "next/navigation";
import { currentUser } from "@/lib/user";
import { SKILLS, ROLES, OPEN_TO } from "@/lib/skills";
import { updateProfile } from "./actions";
import { PageHeader, Field, Input, Select, Textarea, Button, Card } from "@/components/ui";

export default async function ProfilePage() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const skillSet = new Set(me.skills);
  const otherSkills = me.skills.filter((s) => !(SKILLS as readonly string[]).includes(s));
  const openToSet = new Set(me.openTo);

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Your profile"
        subtitle="Skills, role and experience power the People directory and your match score."
      />

      <form action={updateProfile} className="flex flex-col gap-5">
        <Field label="Name">
          <Input name="name" defaultValue={me.name ?? ""} required />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Role">
            <Select name="role" defaultValue={me.role ?? ""}>
              <option value="">—</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </Select>
          </Field>
          <Field label="Years of experience">
            <Input name="yearsExperience" type="number" min={0} max={50} defaultValue={me.yearsExperience ?? ""} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Location">
            <Input name="location" defaultValue={me.location ?? ""} placeholder="Delhi" />
          </Field>
          <Field label="Year / branch">
            <div className="flex gap-2">
              <Input name="year" defaultValue={me.year ?? ""} placeholder="3" />
              <Input name="branch" defaultValue={me.branch ?? ""} placeholder="CSE" />
            </div>
          </Field>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">Stack / skills</span>
          <div className="grid grid-cols-3 gap-x-3 gap-y-1.5 sm:grid-cols-4">
            {SKILLS.map((s) => (
              <label key={s} className="flex items-center gap-1.5 font-mono text-xs text-muted">
                <input type="checkbox" name="skills" value={s} defaultChecked={skillSet.has(s)} className="accent-[var(--accent)]" />
                {s}
              </label>
            ))}
          </div>
          <Input name="skillsOther" defaultValue={otherSkills.join(", ")} placeholder="other skills, comma-separated" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium text-muted">Open to</span>
          <div className="flex flex-wrap gap-3">
            {OPEN_TO.map((o) => (
              <label key={o} className="flex items-center gap-1.5 text-sm text-muted">
                <input type="checkbox" name="openTo" value={o} defaultChecked={openToSet.has(o)} className="accent-[var(--accent)]" />
                {o}
              </label>
            ))}
          </div>
        </div>

        <Field label="Looking for">
          <Input name="lookingFor" defaultValue={me.lookingFor ?? ""} placeholder="backend + designer for a weekend hack" />
        </Field>

        <Field label="About / bio">
          <Textarea name="bio" defaultValue={me.bio ?? ""} rows={3} />
        </Field>

        <Card className="flex flex-col gap-4">
          <p className="text-xs text-muted">
            Links — GitHub is auto-fetched (avatar, bio, top repos). LinkedIn revealed on connect.
          </p>
          <Field label="GitHub URL">
            <Input name="githubUrl" defaultValue={me.githubUrl ?? ""} placeholder="https://github.com/you" />
          </Field>
          <Field label="LinkedIn URL">
            <Input name="linkedinUrl" defaultValue={me.linkedinUrl ?? ""} />
          </Field>
        </Card>

        <Button type="submit" className="self-start">Save profile</Button>
      </form>
    </main>
  );
}
