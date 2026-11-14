// Fixed option lists so people-directory filters stay consistent.
// Users pick from these; "other" free-text is merged in via parseSkills (lib/user.ts).

export const SKILLS = [
  "typescript",
  "javascript",
  "react",
  "next.js",
  "node",
  "python",
  "java",
  "go",
  "c++",
  "flutter",
  "react native",
  "postgres",
  "mongodb",
  "firebase",
  "docker",
  "aws",
  "pytorch",
  "tensorflow",
  "figma",
  "ui/ux",
] as const;

export const ROLES = [
  "frontend",
  "backend",
  "full-stack",
  "designer",
  "ml",
  "mobile",
  "pm",
  "devops",
] as const;

export const OPEN_TO = ["hackathon", "project", "internship"] as const;

export type Role = (typeof ROLES)[number];
export type OpenTo = (typeof OPEN_TO)[number];
