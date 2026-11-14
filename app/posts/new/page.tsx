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

        <Field label="Title">
          <Input name="title" required placeholder="Need 1 backend + 1 designer for HackNU this weekend" />
        </Field>

        <Field label="Description">
          <Textarea name="description" required rows={4} placeholder="What you're building, what's covered, what you need." />
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
