import { redirect } from "next/navigation";
import { currentUser } from "@/lib/user";
import { PageHeader } from "@/components/ui";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const me = await currentUser();
  if (!me) redirect("/signin");

  return (
    <main className="flex flex-col gap-6">
      <PageHeader
        title="Your profile"
        subtitle="Skills, role and experience power the People directory and your match score."
      />
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
