"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createPost } from "../actions";
import type { ActionState } from "@/lib/validation";
import { Field, Input, Select, Textarea, Button } from "@/components/ui";
import { TagInput } from "@/components/TagInput";

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="self-start px-5 py-2.5">
      {pending ? "Posting…" : "Post it"}
    </Button>
  );
}

export function NewPostForm() {
  const [state, action] = useActionState<ActionState, FormData>(createPost, null);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Type">
          <Select name="type" defaultValue="hackathon">
            <option value="hackathon">Hackathon</option>
            <option value="project">Project</option>
          </Select>
        </Field>
        <Field label="Team size">
          <Input name="teamSize" type="number" min={2} max={20} defaultValue={4} required />
        </Field>
      </div>

      <Field label="Hackathon / event name (optional)">
        <Input name="hackathonName" maxLength={100} placeholder="HackNU 2026, Smart India Hackathon…" />
      </Field>

      <Field label="Title">
        <Input name="title" required minLength={3} maxLength={120} placeholder="Need 1 backend + 1 designer this weekend" />
      </Field>

      <Field label="The idea">
        <Textarea name="description" required minLength={10} maxLength={4000} rows={4} placeholder="What you're building and what's already covered." />
      </Field>

      <Field label="What you expect from a teammate">
        <Textarea name="expecting" rows={2} maxLength={500} placeholder="Someone who can own the backend, commits for the full weekend, ships fast." />
      </Field>

      <Field label="Additional details (optional)">
        <Textarea name="details" rows={3} maxLength={4000} placeholder="Anything else — timings, links, prizes, prerequisites, how to reach you." />
      </Field>

      <Field label="Skills needed">
        <TagInput name="neededSkills" placeholder="node, then press enter" />
      </Field>

      <Field label="When (optional)">
        <Input name="happeningAt" type="date" />
      </Field>

      {state && !state.ok && (
        <p className="text-sm text-[var(--danger)]" aria-live="polite">{state.message}</p>
      )}

      <Submit />
    </form>
  );
}
