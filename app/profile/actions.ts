"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, parseSkills } from "@/lib/user";
import { fetchGithubProfile } from "@/lib/github";
import { OPEN_TO } from "@/lib/skills";
import { profileSchema, firstError, type ActionState } from "@/lib/validation";

export type { ActionState };

const nn = (s: string) => (s.length ? s : null);

export async function updateProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = await requireUserId();

  const parsed = profileSchema.safeParse({
    name: formData.get("name") ?? "",
    role: formData.get("role") ?? "",
    yearsExperience: formData.get("yearsExperience") ?? "",
    year: formData.get("year") ?? "",
    branch: formData.get("branch") ?? "",
    location: formData.get("location") ?? "",
    bio: formData.get("bio") ?? "",
    lookingFor: formData.get("lookingFor") ?? "",
    githubUrl: formData.get("githubUrl") ?? "",
    linkedinUrl: formData.get("linkedinUrl") ?? "",
  });
  if (!parsed.success) return { ok: false, message: firstError(parsed.error) };
  const v = parsed.data;

  // skills = checked options + "other" free-text, deduped lowercase
  const checked = formData.getAll("skills").map((s) => String(s).toLowerCase());
  const other = parseSkills(formData.get("skillsOther"));
  const skills = [...new Set([...checked, ...other].filter(Boolean))];

  const openTo = formData
    .getAll("openTo")
    .map(String)
    .filter((o) => (OPEN_TO as readonly string[]).includes(o));

  const gh = await fetchGithubProfile(nn(v.githubUrl)); // null on failure — never blocks save

  const data: Prisma.UserUpdateInput = {
    name: v.name,
    year: nn(v.year),
    branch: nn(v.branch),
    location: nn(v.location),
    role: nn(v.role),
    yearsExperience: v.yearsExperience === "" ? null : Number(v.yearsExperience),
    openTo,
    bio: nn(v.bio),
    lookingFor: nn(v.lookingFor),
    githubUrl: nn(v.githubUrl),
    linkedinUrl: nn(v.linkedinUrl),
    skills,
  };

  if (gh) {
    if (gh.avatar) data.image = gh.avatar;
    data.githubBio = gh.bio;
    data.githubRepos = gh.topRepos as unknown as Prisma.InputJsonValue;
    data.githubStats = gh.stats as unknown as Prisma.InputJsonValue;
    data.githubFetchedAt = new Date();
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath(`/u/${id}`);
  return { ok: true, message: gh ? "Profile saved · GitHub synced ✓" : "Profile saved ✓" };
}
