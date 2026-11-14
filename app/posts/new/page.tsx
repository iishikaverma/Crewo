import { createPost } from "../actions";
import { PageHeader, Field, Input, Select, Textarea, Button } from "@/components/ui";

export default function NewPostPage() {
  return (
    <main className="flex flex-col gap-6">
      <PageHeader title="Post a need" subtitle="Tell people what you're building and who you need." />

      <form action={createPost} className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <Select name="type" defaultValue="hackathon">
              <option value="hackathon">Hackathon</option>
              <option value="project">Project</option>
            </Select>
          </Field>
          <Field label="Team size">
            <Input name="teamSize" type="number" min={2} max={20} defaultValue={4} />
          </Field>
        </div>

        <Field label="Hackathon / event name (optional)">
          <Input name="hackathonName" placeholder="HackNU 2026, Smart India Hackathon…" />
        </Field>

        <Field label="Title">
          <Input name="title" required placeholder="Need 1 backend + 1 designer this weekend" />
        </Field>

        <Field label="The idea">
          <Textarea name="description" required rows={4} placeholder="What you're building and what's already covered." />
        </Field>

        <Field label="What you expect from a teammate">
          <Textarea name="expecting" rows={2} placeholder="Someone who can own the backend, commits for the full weekend, ships fast." />
        </Field>

        <Field label="Skills needed (comma-separated)">
          <Input name="neededSkills" placeholder="node, postgres, figma" />
        </Field>

        <Field label="When (optional)">
          <Input name="happeningAt" type="date" />
        </Field>

        <Button type="submit" className="self-start">Post it</Button>
      </form>
    </main>
  );
}
