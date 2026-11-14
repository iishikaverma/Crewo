import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";
import { currentUser } from "@/lib/user";

export default async function SignInPage() {
  // DB-backed check (not just the JWT) so a stale session for a deleted user
  // doesn't loop: it falls through to the login form instead of redirecting.
  const me = await currentUser();
  if (me) redirect("/");

  const isProd = process.env.NODE_ENV === "production";
  const users = isProd
    ? []
    : await prisma.user.findMany({ orderBy: { name: "asc" }, select: { email: true, name: true, branch: true } });

  async function devSignIn(formData: FormData) {
    "use server";
    await signIn("dev", {
      email: String(formData.get("email")),
      redirectTo: "/",
    });
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Crewo</h1>
        <p className="text-sm text-gray-500">Form your crew — hackathons, projects, study.</p>
      </div>

      {isProd ? (
        <p className="text-sm text-gray-500">Sign-in coming soon.</p>
      ) : (
        <form action={devSignIn} className="flex flex-col gap-3">
          <label className="text-sm font-medium text-gray-600">
            Dev login — sign in as a seeded user
          </label>
          <select
            name="email"
            defaultValue={users[0]?.email}
            className="rounded-md border border-gray-300 bg-transparent p-2"
          >
            {users.map((u) => (
              <option key={u.email} value={u.email}>
                {u.name} · {u.branch} ({u.email})
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-md bg-black px-4 py-2 font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black"
          >
            Sign in
          </button>
          {users.length === 0 && (
            <p className="text-sm text-amber-600">
              No users yet — run <code>npm run db:seed</code>.
            </p>
          )}
        </form>
      )}
    </main>
  );
}
