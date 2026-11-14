import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const USERS = [
  { email: "ishika@college.edu", name: "Ishika", branch: "CSE", year: "3", skills: ["react", "typescript", "prisma"], lookingFor: "backend + designer for a weekend hack", githubUrl: "https://github.com/ishika", whatsapp: "+910000000001" },
  { email: "rahul@college.edu", name: "Rahul", branch: "CSE", year: "3", skills: ["node", "postgres", "express"], lookingFor: "a frontend partner", githubUrl: "https://github.com/rahul", whatsapp: "+910000000002" },
  { email: "aisha@college.edu", name: "Aisha", branch: "Design", year: "2", skills: ["figma", "ui", "illustration"], lookingFor: "a dev team to design for", linkedinUrl: "https://linkedin.com/in/aisha" },
  { email: "karan@college.edu", name: "Karan", branch: "ECE", year: "4", skills: ["python", "ml", "pytorch"], lookingFor: "ML hackathon team", githubUrl: "https://github.com/karan" },
  { email: "meera@college.edu", name: "Meera", branch: "CSE", year: "2", skills: ["flutter", "firebase", "dart"], lookingFor: "mobile project group", whatsapp: "+910000000005" },
  { email: "dev@college.edu", name: "Dev", branch: "IT", year: "3", skills: ["devops", "docker", "aws"], lookingFor: "infra-heavy hackathon", githubUrl: "https://github.com/dev" },
  { email: "sara@college.edu", name: "Sara", branch: "Design", year: "3", skills: ["figma", "ux research", "prototyping"], lookingFor: "study pair for DSA" },
  { email: "arjun@college.edu", name: "Arjun", branch: "CSE", year: "1", skills: ["java", "dsa"], lookingFor: "DSA study partner", githubUrl: "https://github.com/arjun" },
];

async function main() {
  // wipe (dev only) so re-seeding is idempotent
  await prisma.joinRequest.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all(
    USERS.map((u) => prisma.user.create({ data: u }))
  );
  const byEmail = (e: string) => users.find((u) => u.email === e)!;

  const weekend = new Date();
  weekend.setDate(weekend.getDate() + ((6 - weekend.getDay() + 7) % 7 || 7)); // next Saturday

  const posts = await Promise.all([
    prisma.post.create({
      data: {
        authorId: byEmail("ishika@college.edu").id,
        type: "hackathon",
        title: "Need 1 backend + 1 designer for HackNU this weekend",
        description: "Building a civic-issues reporting app. Have the frontend covered.",
        neededSkills: ["node", "postgres", "figma"],
        teamSize: 4,
        happeningAt: weekend,
      },
    }),
    prisma.post.create({
      data: {
        authorId: byEmail("karan@college.edu").id,
        type: "hackathon",
        title: "ML team for the AI track",
        description: "Computer-vision idea for crop disease detection. Need a frontend dev.",
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
        neededSkills: ["flutter", "firebase", "ui"],
        teamSize: 3,
      },
    }),
    prisma.post.create({
      data: {
        authorId: byEmail("arjun@college.edu").id,
        type: "study",
        title: "DSA study pair (evenings)",
        description: "Grinding Leetcode for placements. Looking for one consistent partner.",
        neededSkills: ["dsa", "java"],
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
