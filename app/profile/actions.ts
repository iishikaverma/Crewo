"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserId, parseSkills } from "@/lib/user";

const str = (v: FormDataEntryValue | null) => {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
};

export async function updateProfile(formData: FormData) {
  const id = await requireUserId();
  await prisma.user.update({
    where: { id },
    data: {
      name: str(formData.get("name")),
      year: str(formData.get("year")),
      branch: str(formData.get("branch")),
      bio: str(formData.get("bio")),
      lookingFor: str(formData.get("lookingFor")),
      image: str(formData.get("image")),
      githubUrl: str(formData.get("githubUrl")),
      linkedinUrl: str(formData.get("linkedinUrl")),
      whatsapp: str(formData.get("whatsapp")),
      skills: parseSkills(formData.get("skills")),
    },
  });
  revalidatePath("/profile");
  revalidatePath("/");
}
