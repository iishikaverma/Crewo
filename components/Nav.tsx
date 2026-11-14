import Link from "next/link";
import { currentUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import { signOut } from "@/auth";
import { Avatar, Button } from "@/components/ui";
import { CmdKButton } from "@/components/CmdKButton";

export async function Nav() {
  const user = await currentUser();
  if (!user) return null; // signin page

  const pendingConnects = await prisma.connectRequest.count({
    where: { toId: user.id, status: "pending" },
  });

  const link = "text-sm text-muted transition-colors hover:text-fg";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-3xl items-center justify-between px-4">
        <nav className="flex items-center gap-5">
          <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
            <span className="h-5 w-5 rounded-[5px] bg-gradient-to-br from-[var(--accent)] to-[var(--accent-2)] shadow-[0_0_14px_-2px_var(--accent-glow)]" />
            Crewo
          </Link>
          <Link href="/" className={link}>Browse</Link>
          <Link href="/people" className={link}>People</Link>
          <Link href="/connections" className={`${link} flex items-center gap-1.5`}>
            Connections
            {pendingConnects > 0 && (
              <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg">
                {pendingConnects}
              </span>
            )}
          </Link>
          <Link href="/posts/new" className={link}>New post</Link>
        </nav>

        <div className="flex items-center gap-3">
          <CmdKButton />
          <Link href="/profile" className="flex items-center gap-2">
            <Avatar src={user.image} name={user.name} size={26} />
            <span className="hidden text-sm text-muted sm:inline">{user.name ?? user.email}</span>
          </Link>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/signin" });
            }}
          >
            <Button variant="ghost" className="px-2.5 py-1.5 text-xs">Sign out</Button>
          </form>
        </div>
      </div>
    </header>
  );
}
