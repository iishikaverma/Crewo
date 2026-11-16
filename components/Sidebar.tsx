import Link from "next/link";
import { currentUser, isOwner } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { Avatar, Button } from "@/components/ui";
import { CmdKButton } from "@/components/CmdKButton";
import { SidebarNav } from "@/components/SidebarNav";
import { Logo } from "@/components/Logo";

export async function Sidebar() {
  const user = await currentUser();
  if (!user) return null;

  const pending = await prisma.connectRequest.count({
    where: { toId: user.id, status: "pending" },
  });

  async function signOutAction() {
    "use server";
    await signOut({ redirectTo: "/signin" });
  }

  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-bg/60 px-3 py-4 lg:flex">
      <Link href="/" className="mb-5 flex items-center gap-2 px-2 font-bold tracking-tight">
        <Logo size={26} />
        Crewo
      </Link>

      <SidebarNav pending={pending} showStats={isOwner(user)} />

      <div className="mt-auto flex flex-col gap-3 pt-4">
        <CmdKButton />
        <div className="flex items-center justify-between gap-2 rounded-[10px] border border-border bg-surface p-2">
          <Link href="/profile" className="flex min-w-0 items-center gap-2">
            <Avatar src={user.image} name={user.name} size={30} />
            <span className="truncate text-sm text-fg">{user.name ?? user.email}</span>
          </Link>
          <form action={signOutAction}>
            <Button variant="ghost" className="px-2 py-1.5" title="Sign out" aria-label="Sign out">
              <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M8 4H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3m5-3 3-3-3-3m3 3H8" />
              </svg>
            </Button>
          </form>
        </div>
      </div>
    </aside>
  );
}
