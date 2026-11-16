"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS: Record<string, React.ReactNode> = {
  "/": <path d="M3 9.5 10 4l7 5.5V17a1 1 0 0 1-1 1h-3v-5H7v5H4a1 1 0 0 1-1-1V9.5Z" />,
  "/people": <path d="M7 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM2 17c0-2.5 2.2-4 5-4s5 1.5 5 4m2-4c2.2.2 4 1.6 4 4" />,
  "/connections": <path d="M8 12a3 3 0 0 0 4 0l2-2a3 3 0 0 0-4-4l-1 1m1 5a3 3 0 0 1-4 0l-2-2a3 3 0 0 1 4-4l1 1" />,
  "/posts/new": <path d="M10 4v12M4 10h12" />,
  "/profile": <path d="M10 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-6 7c0-3 2.7-5 6-5s6 2 6 5" />,
  "/stats": <path d="M4 16V9m4 7V5m4 11v-4m4 4V8" />,
};

export function SidebarNav({ pending }: { pending: number }) {
  const pathname = usePathname();
  const links = [
    { href: "/", label: "Browse" },
    { href: "/people", label: "People" },
    { href: "/connections", label: "Connections", badge: pending },
    { href: "/posts/new", label: "New post" },
    { href: "/profile", label: "Profile" },
    { href: "/stats", label: "Stats" },
  ];

  return (
    <nav className="flex flex-col gap-1">
      {links.map((l) => {
        const active = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={
              "flex items-center gap-3 rounded-[10px] px-3 py-2 text-sm font-medium transition-colors " +
              (active ? "bg-surface-2 text-fg" : "text-muted hover:bg-surface-2 hover:text-fg")
            }
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-accent-2" : ""}>
              {ICONS[l.href]}
            </svg>
            <span className="flex-1">{l.label}</span>
            {l.badge ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg">
                {l.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
