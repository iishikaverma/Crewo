import { auth, signOut } from "@/auth";

export default async function Home() {
  const session = await auth();
  const user = session?.user;

  return (
    <main className="mx-auto max-w-2xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Crewo</h1>
        {user && (
          <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-500">{user.name ?? user.email}</span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/signin" });
              }}
            >
              <button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 dark:hover:bg-gray-800">
                Sign out
              </button>
            </form>
          </div>
        )}
      </header>

      <section className="rounded-lg border border-dashed border-gray-300 p-8 text-center text-gray-500">
        <p className="font-medium">Browse board</p>
        <p className="text-sm">Posts and the match score land in Phase 1 &amp; 2.</p>
      </section>
    </main>
  );
}
