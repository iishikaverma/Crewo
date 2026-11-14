import Link from "next/link";
import { currentUser } from "@/lib/user";
import { signOut } from "@/auth";

export async function Nav() {
  const user = await currentUser();
  if (!user) return null; // signin page

  return (
    <header className="mb-8 flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800">
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/" className="text-lg font-bold">
          Crewo
        </Link>
        <Link href="/" className="text-gray-500 hover:text-current">Browse</Link>
        <Link href="/people" className="text-gray-500 hover:text-current">People</Link>
        <Link href="/posts/new" className="text-gray-500 hover:text-current">New post</Link>
        <Link href="/profile" className="text-gray-500 hover:text-current">Profile</Link>
      </nav>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-gray-500">{user.name ?? user.email}</span>
        <form
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/signin" });
          }}
        >
          <button className="rounded-md border border-gray-300 px-3 py-1 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
