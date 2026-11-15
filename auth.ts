import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { prisma } from "@/lib/prisma";

// College-email gate: when ALLOWED_EMAIL_DOMAINS is set (comma-separated),
// only those domains may sign in. Off by default.
function isAllowedEmail(email: string | null | undefined) {
  const allow = (process.env.ALLOWED_EMAIL_DOMAINS ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean);
  if (allow.length === 0) return true;
  const domain = (email ?? "").split("@")[1]?.toLowerCase();
  return !!domain && allow.includes(domain);
}

// Dev login stub (non-production). Real GitHub OAuth when AUTH_GITHUB_ID is set.
const providers = [
  ...(process.env.AUTH_GITHUB_ID ? [GitHub({ allowDangerousEmailAccountLinking: true })] : []),
  ...(process.env.NODE_ENV !== "production"
    ? [
        Credentials({
          id: "dev",
          name: "Dev login",
          credentials: { email: { label: "Email" } },
          authorize: async (creds) => {
            const email = String(creds?.email ?? "").trim().toLowerCase();
            if (!email) return null;
            const user = await prisma.user.findUnique({ where: { email } });
            if (!user) return null;
            return { id: user.id, email: user.email, name: user.name, image: user.image };
          },
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    signIn({ user }) {
      return isAllowedEmail(user?.email);
    },
    async jwt({ token, user, account, profile }) {
      if (!user) return token;

      // Dev credentials return our DB user id directly.
      if (account?.provider === "dev") {
        token.uid = user.id;
        return token;
      }

      // GitHub (JWT, no adapter): upsert a User by email so the app has a row.
      const email = user.email;
      if (email) {
        const gh = profile as { html_url?: string; login?: string } | undefined;
        const githubUrl = gh?.html_url ?? (gh?.login ? `https://github.com/${gh.login}` : undefined);
        const dbUser = await prisma.user.upsert({
          where: { email },
          update: {},
          create: {
            email,
            name: user.name ?? null,
            image: user.image ?? null,
            githubUrl: githubUrl ?? null,
          },
        });
        token.uid = dbUser.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
  pages: { signIn: "/signin" },
});
