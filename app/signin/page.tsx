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

        <div className="rounded-[14px] border border-border bg-surface/70 p-5 backdrop-blur-sm">
          {isProd ? (
            <p className="text-center text-sm text-muted">Sign-in coming soon.</p>
          ) : (
            <form action={devSignIn} className="flex flex-col gap-3">
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
          )}
        </div>
        <p className="text-center font-mono text-xs text-faint">move your cursor ✨</p>
      </div>
    </main>
  );
}
