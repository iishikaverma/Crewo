import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";

// ponytail: dev-only login stub. Pick a seeded user by email, no password.
// Real GitHub OAuth is added in Phase 3; this provider is gated to non-production.
const providers =
  process.env.NODE_ENV === "production"
    ? [] // ponytail: GitHub provider slots in here in Phase 3
    : [
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
      ];

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
  pages: { signIn: "/signin" },
});
