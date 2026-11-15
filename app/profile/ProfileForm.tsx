"use client";

import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { SKILLS, ROLES, OPEN_TO } from "@/lib/skills";
import { updateProfile, type ActionState } from "./actions";
import { Field, Input, Select, Textarea, Button, Card } from "@/components/ui";
import { TagInput } from "@/components/TagInput";

type U = {
  name: string | null; role: string | null; yearsExperience: number | null;
  location: string | null; year: string | null; branch: string | null;
  skills: string[]; openTo: string[]; lookingFor: string | null; bio: string | null;
  githubUrl: string | null; linkedinUrl: string | null;
};

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-start">
      {pending ? "Saving…" : "Save profile"}
    </Button>
  );
}

export function ProfileForm({ user }: { user: U }) {
  const [state, action] = useActionState<ActionState, FormData>(updateProfile, null);
  const skillSet = new Set(user.skills);
  const otherSkills = user.skills.filter((s) => !(SKILLS as readonly string[]).includes(s));
  const openToSet = new Set(user.openTo);

  useEffect(() => {
    if (state?.ok) toast.success(state.message);
  }, [state]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <Field label="Full name">
        <Input name="name" defaultValue={user.name ?? ""} required placeholder="e.g. Ishika Verma" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Role">
          <Select name="role" defaultValue={user.role ?? ""}>
            <option value="">—</option>
            {ROLES.map((r) => (<option key={r} value={r}>{r}</option>))}
          </Select>
        </Field>
        <Field label="Years of experience">
          <Input name="yearsExperience" type="number" min={0} max={50} defaultValue={user.yearsExperience ?? ""} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Location">
          <Input name="location" defaultValue={user.location ?? ""} placeholder="Delhi" />
        </Field>
        <Field label="Year / branch">
          <div className="flex gap-2">
            <Input name="year" defaultValue={user.year ?? ""} placeholder="3" />
            <Input name="branch" defaultValue={user.branch ?? ""} placeholder="CSE" />
          </div>
        </Field>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-muted">Stack / skills</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 sm:grid-cols-4">
          {SKILLS.map((s) => (
            <label key={s} className="flex items-center gap-1.5 font-mono text-xs text-muted">
              <input type="checkbox" name="skills" value={s} defaultChecked={skillSet.has(s)} className="accent-[var(--accent)]" />
              {s}
            </label>
          ))}
        </div>
        <TagInput name="skillsOther" defaultValue={otherSkills} placeholder="other skill, then press enter" />
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
        <Input name="lookingFor" defaultValue={user.lookingFor ?? ""} placeholder="backend + designer for a weekend hack" />
      </Field>

      <Field label="About / bio">
        <Textarea name="bio" defaultValue={user.bio ?? ""} rows={3} />
      </Field>

      <Card className="flex flex-col gap-4">
        <p className="text-xs text-muted">
          Links — GitHub is auto-fetched (avatar, bio, top repos). LinkedIn revealed on connect.
        </p>
        <Field label="GitHub URL">
          <Input name="githubUrl" defaultValue={user.githubUrl ?? ""} placeholder="https://github.com/you" />
        </Field>
        <Field label="LinkedIn URL">
          <Input name="linkedinUrl" defaultValue={user.linkedinUrl ?? ""} />
        </Field>
      </Card>

      <SaveButton />
    </form>
  );
}
