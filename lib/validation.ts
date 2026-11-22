import { z } from "zod";
import { ROLES } from "@/lib/skills";
import { parseGithubUsername } from "@/lib/github";

// Shared result shape for server actions wired to useActionState.
export type ActionState = { ok: boolean; message: string } | null;

/** First human-readable message from a failed parse. */
export function firstError(err: z.ZodError): string {
  return err.issues[0]?.message ?? "Please check the form and try again.";
}

// Letters (any script) + spaces and a few name separators — no digits.
const NAME_RE = /^\p{L}[\p{L}\p{M} .'-]*$/u;
// Letters + common separators for place/branch names (e.g. "New Delhi", "CSE & AI").
const WORDS_RE = /^[\p{L}\p{M} &.,'/-]+$/u;

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Enter your name (at least 2 letters).")
    .max(80, "Name is too long (max 80).")
    .regex(NAME_RE, "Name should be letters only — no digits or symbols."),
  role: z
    .string()
    .trim()
    .refine((v) => v === "" || (ROLES as readonly string[]).includes(v), "Pick a valid role."),
  yearsExperience: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{1,2}$/.test(v), "Experience must be a whole number.")
    .refine((v) => v === "" || Number(v) <= 50, "Experience must be between 0 and 50."),
  year: z
    .string()
    .trim()
    .refine((v) => v === "" || /^\d{1,4}$/.test(v), "Year must be a number (e.g. 3 or 2026)."),
  branch: z
    .string()
    .trim()
    .max(40, "Branch is too long.")
    .refine((v) => v === "" || WORDS_RE.test(v), "Branch should be letters only (e.g. CSE)."),
  location: z
    .string()
    .trim()
    .max(60, "Location is too long.")
    .refine((v) => v === "" || WORDS_RE.test(v), "Location should be letters only (e.g. Delhi)."),
  bio: z.string().trim().max(1000, "Description is too long (max 1000)."),
  lookingFor: z.string().trim().max(300, "“Looking for” is too long (max 300)."),
  githubUrl: z
    .string()
    .trim()
    .max(200, "GitHub URL is too long.")
    .refine((v) => v === "" || parseGithubUsername(v) !== null, "Enter a valid GitHub URL or username."),
  linkedinUrl: z
    .string()
    .trim()
    .max(200, "LinkedIn URL is too long.")
    .refine((v) => v === "" || /^https?:\/\/(www\.)?linkedin\.com\//i.test(v), "Enter a full LinkedIn URL (https://linkedin.com/…)."),
});
export type ProfileInput = z.infer<typeof profileSchema>;

export const postSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Give your post a title (at least 3 characters).")
    .max(120, "Title is too long (max 120).")
    .regex(/\p{L}/u, "Title should include some words, not just numbers."),
  description: z
    .string()
    .trim()
    .min(10, "Describe the idea (at least 10 characters).")
    .max(4000, "Description is too long (max 4000)."),
  type: z.string().refine((v) => v === "hackathon" || v === "project", "Pick a valid type."),
  teamSize: z
    .string()
    .trim()
    .refine((v) => /^\d{1,2}$/.test(v) && Number(v) >= 2 && Number(v) <= 20, "Team size must be a number from 2 to 20."),
  hackathonName: z.string().trim().max(100, "Event name is too long."),
  expecting: z.string().trim().max(500, "“What you expect” is too long (max 500)."),
  details: z.string().trim().max(4000, "Additional details are too long (max 4000)."),
  happeningAt: z
    .string()
    .trim()
    .refine((v) => v === "" || !Number.isNaN(Date.parse(v)), "Enter a valid date."),
});
export type PostInput = z.infer<typeof postSchema>;
