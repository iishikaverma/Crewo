import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { currentUser } from "@/lib/user";
import { TileGrid } from "@/components/TileGrid";
import { Button, Select } from "@/components/ui";

export default async function SignInPage() {
  const me = await currentUser();
  if (me) redirect("/");

  const isProd = process.env.NODE_ENV === "production";
  const hasGithub = !!process.env.AUTH_GITHUB_ID;
  const users = isProd
    ? []
    : await prisma.user.findMany({
        orderBy: { name: "asc" },
        select: { email: true, name: true, branch: true },
      });

  async function devSignIn(formData: FormData) {
    "use server";
    await signIn("dev", { email: String(formData.get("email")), redirectTo: "/" });
  }

  async function githubSignIn() {
    "use server";
    await signIn("github", { redirectTo: "/" });
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4">
      {/* background grid — tiles reveal on hover */}
      <TileGrid />

      <div className="relative z-10 flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="h-11 w-11 rounded-[12px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_30px_-4px_var(--accent-glow)]" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Crewo</h1>
            <p className="mt-1 text-sm text-muted">
              Form your crew — hackathons &amp; projects.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-[14px] border border-border bg-surface/70 p-5 backdrop-blur-sm">
          {hasGithub && (
            <form action={githubSignIn}>
              <Button type="submit" variant="secondary" className="w-full gap-2">
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
                  <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                Continue with GitHub
              </Button>
            </form>
          )}
          {isProd && !hasGithub ? (
            <p className="text-center text-sm text-muted">Sign-in coming soon.</p>
          ) : !isProd ? (
            <form action={devSignIn} className="flex flex-col gap-3">
              {hasGithub && <span className="text-center text-xs text-faint">or dev login</span>}
              <span className="text-xs font-medium text-muted">Dev login — sign in as a seeded user</span>
              <Select name="email" defaultValue={users[0]?.email}>
                {users.map((u) => (
                  <option key={u.email} value={u.email}>
                    {u.name} · {u.branch} ({u.email})
                  </option>
                ))}
              </Select>
              <Button type="submit" className="w-full">Sign in</Button>
              {users.length === 0 && (
                <p className="text-sm text-[var(--danger)]">
                  No users yet — run <code className="font-mono">npm run db:seed</code>.
                </p>
              )}
            </form>
          ) : null}
        </div>
        <p className="text-center font-mono text-xs text-faint">move your cursor ✨</p>
      </div>
    </main>
  );
}
