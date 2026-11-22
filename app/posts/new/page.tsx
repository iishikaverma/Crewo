import { requireOnboarded } from "@/lib/user";
import { PageHeader } from "@/components/ui";
import { NewPostForm } from "./NewPostForm";

export default async function NewPostPage() {
  await requireOnboarded();
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader title="Post a need" subtitle="Tell people what you're building and who you need." />
      <NewPostForm />
    </main>
  );
}
