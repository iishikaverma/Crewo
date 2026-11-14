import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { fetchGithubProfile } from "../lib/github";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const USERS = [
  { email: "ishika@college.edu", name: "Ishika", branch: "CSE", year: "3", role: "frontend", location: "Delhi", yearsExperience: 2, openTo: ["hackathon", "project"], bio: "Frontend dev who likes shipping fast. Built ClinSight's dashboard.", skills: ["react", "typescript", "next.js"], lookingFor: "backend + designer for a weekend hack", githubUrl: "https://github.com/gaearon", linkedinUrl: "https://linkedin.com/in/ishika" },
  { email: "rahul@college.edu", name: "Rahul", branch: "CSE", year: "3", role: "backend", location: "Delhi", yearsExperience: 3, openTo: ["hackathon", "internship"], bio: "Backend + databases. Node/Postgres all day.", skills: ["node", "postgres", "typescript"], lookingFor: "a frontend partner", githubUrl: "https://github.com/sindresorhus", linkedinUrl: "https://linkedin.com/in/rahul" },
  { email: "aisha@college.edu", name: "Aisha", branch: "Design", year: "2", role: "designer", location: "Mumbai", yearsExperience: 1, openTo: ["project", "hackathon"], bio: "Product designer. Figma, UI/UX, a bit of front-end.", skills: ["figma", "ui/ux"], lookingFor: "a dev team to design for", linkedinUrl: "https://linkedin.com/in/aisha" },
  { email: "karan@college.edu", name: "Karan", branch: "ECE", year: "4", role: "ml", location: "Bangalore", yearsExperience: 4, openTo: ["hackathon"], bio: "ML/CV. PyTorch, model training, the occasional Kaggle.", skills: ["python", "pytorch", "tensorflow"], lookingFor: "ML hackathon team", githubUrl: "https://github.com/karpathy", linkedinUrl: "https://linkedin.com/in/karan" },
  { email: "meera@college.edu", name: "Meera", branch: "CSE", year: "2", role: "mobile", location: "Pune", yearsExperience: 2, openTo: ["project", "hackathon"], bio: "Mobile dev. Flutter + Firebase.", skills: ["flutter", "firebase", "react native"], lookingFor: "mobile project group", githubUrl: "https://github.com/leerob", linkedinUrl: "https://linkedin.com/in/meera" },
  { email: "dev@college.edu", name: "Dev", branch: "IT", year: "3", role: "devops", location: "Delhi", yearsExperience: 3, openTo: ["hackathon", "internship"], bio: "Infra/DevOps. Docker, AWS, CI/CD.", skills: ["docker", "aws", "go"], lookingFor: "infra-heavy hackathon", githubUrl: "https://github.com/mitchellh", linkedinUrl: "https://linkedin.com/in/dev" },
  { email: "sara@college.edu", name: "Sara", branch: "Design", year: "3", role: "designer", location: "Mumbai", yearsExperience: 2, openTo: ["project", "hackathon"], bio: "UX research + prototyping.", skills: ["figma", "ui/ux"], lookingFor: "a dev team to prototype with" },
  { email: "arjun@college.edu", name: "Arjun", branch: "CSE", year: "1", role: "full-stack", location: "Delhi", yearsExperience: 0, openTo: ["project", "hackathon"], bio: "First-year, building side projects.", skills: ["java", "javascript"], lookingFor: "a side project to build", githubUrl: "https://github.com/arjun" },
];

async function main() {
  // wipe (dev only) so re-seeding is idempotent
  await prisma.joinRequest.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    USERS.map(async (u) => {
      const gh = await fetchGithubProfile(u.githubUrl);
      return prisma.user.create({
        data: {
          ...u,
          ...(gh
            ? {
                image: gh.avatar ?? undefined,
                githubBio: gh.bio,
                githubRepos: gh.topRepos as object,
                githubStats: gh.stats as object,
                githubFetchedAt: new Date(),
              }
            : {}),
        },
      });
    })
  );
  const byEmail = (e: string) => users.find((u) => u.email === e)!;

  const weekend = new Date();
  weekend.setDate(weekend.getDate() + ((6 - weekend.getDay() + 7) % 7 || 7)); // next Saturday

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        authorId: byEmail("ishika@college.edu").id,
        type: "hackathon",
        hackathonName: "HackNU 2026",
        title: "Need 1 backend + 1 designer for HackNU this weekend",
        description: "Building a civic-issues reporting app. Have the frontend covered.",
        expecting: "A backend dev who can own the API, and a designer to shape the UX — both free the full weekend.",
        neededSkills: ["node", "postgres", "figma"],
        teamSize: 4,
        happeningAt: weekend,
      },
    }),
    prisma.post.create({
      data: {
        authorId: byEmail("karan@college.edu").id,
        type: "hackathon",
        hackathonName: "Smart India Hackathon",
        title: "ML team for the AI track",
        description: "Computer-vision idea for crop disease detection. Need a frontend dev.",
        expecting: "A frontend dev comfortable wiring up a React demo fast — I'll handle the model.",
        neededSkills: ["react", "typescript"],
        teamSize: 3,
        happeningAt: weekend,
      },
    }),
    prisma.post.create({
      data: {
        authorId: byEmail("meera@college.edu").id,
        type: "project",
        title: "Flutter app side-project group",
        description: "Campus events app, building over the semester. Want 2 more people.",
        expecting: "People who can commit a few hours weekly through the semester.",
        neededSkills: ["flutter", "firebase", "ui/ux"],
        teamSize: 3,
      },
    }),
    prisma.post.create({
      data: {
        authorId: byEmail("arjun@college.edu").id,
        type: "project",
        title: "Co-dev for a placements-prep side project",
        description: "Building a small full-stack app to track Leetcode progress. Want one more dev.",
        expecting: "Someone to pair with on nights/weekends and actually ship it.",
        neededSkills: ["react", "node"],
        teamSize: 2,
      },
    }),
  ]);

  await prisma.joinRequest.createMany({
    data: [
      { postId: posts[0].id, requesterId: byEmail("rahul@college.edu").id, message: "Backend dev here — Node + Postgres. In!" },
      { postId: posts[0].id, requesterId: byEmail("aisha@college.edu").id, message: "I can design the whole UI." },
      { postId: posts[1].id, requesterId: byEmail("ishika@college.edu").id, message: "Frontend dev, happy to join the AI track." },
    ],
  });

  console.log(`Seeded ${users.length} users, ${posts.length} posts, 3 join requests.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
