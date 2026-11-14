"use server";

import type { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, parseSkills } from "@/lib/user";
import { fetchGithubProfile } from "@/lib/github";
import { ROLES, OPEN_TO } from "@/lib/skills";

const str = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

const pickFrom = (v: FormDataEntryValue | null, allowed: readonly string[]) => {
  const s = String(v ?? "");
  return allowed.includes(s) ? s : null;
};

const intOrNull = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const n = Math.round(Number(s));
  return Number.isFinite(n) ? Math.max(0, Math.min(50, n)) : null;
};

export async function updateProfile(formData: FormData) {
  const id = await requireUserId();

  // skills = checked options + "other" free-text, deduped lowercase
  const checked = formData.getAll("skills").map((s) => String(s).toLowerCase());
  const other = parseSkills(formData.get("skillsOther"));
  const skills = [...new Set([...checked, ...other].filter(Boolean))];

  const openTo = formData
    .getAll("openTo")
    .map(String)
    .filter((v) => (OPEN_TO as readonly string[]).includes(v));

  const githubUrl = str(formData.get("githubUrl"));
  const gh = await fetchGithubProfile(githubUrl); // null on failure — never blocks save

  const data: Prisma.UserUpdateInput = {
    name: str(formData.get("name")),
    year: str(formData.get("year")),
    branch: str(formData.get("branch")),
    location: str(formData.get("location")),
    role: pickFrom(formData.get("role"), ROLES),
    yearsExperience: intOrNull(formData.get("yearsExperience")),
    openTo,
    bio: str(formData.get("bio")),
    lookingFor: str(formData.get("lookingFor")),
    githubUrl,
    linkedinUrl: str(formData.get("linkedinUrl")),
    skills,
  };

  if (gh) {
    if (gh.avatar) data.image = gh.avatar;
    data.githubBio = gh.bio;
    data.githubRepos = gh.topRepos as unknown as Prisma.InputJsonValue;
    data.githubFetchedAt = new Date();
  }

  await prisma.user.update({ where: { id }, data });
  revalidatePath("/profile");
  revalidatePath("/");
  revalidatePath(`/u/${id}`);
}
