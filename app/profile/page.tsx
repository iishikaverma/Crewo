import { redirect } from "next/navigation";
import { currentUser } from "@/lib/user";
import { PageHeader } from "@/components/ui";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  const needsName = !me.name?.trim();

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Your profile"
        subtitle="Skills, role and experience power the People directory and your match score."
      />
      {needsName && (
        <div className="rounded-[12px] border border-[var(--accent)]/40 bg-[var(--accent-soft)] p-4 text-sm">
          👋 Welcome! Enter your <b>real name</b> to finish setting up — it&apos;s how teammates find and
          recognize you. You&apos;ll be able to browse once it&apos;s saved.
        </div>
      )}
      <ProfileForm
        user={{
          name: me.name, role: me.role, yearsExperience: me.yearsExperience,
          location: me.location, year: me.year, branch: me.branch,
          skills: me.skills, openTo: me.openTo, lookingFor: me.lookingFor, bio: me.bio,
          githubUrl: me.githubUrl, linkedinUrl: me.linkedinUrl,
        }}
      />
    </main>
  );
}
