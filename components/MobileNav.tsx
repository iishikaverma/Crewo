"use client";

import { useState } from "react";
import Link from "next/link";

const LINKS = [
  { href: "/", label: "Browse" },
  { href: "/people", label: "People" },
  { href: "/connections", label: "Connections" },
  { href: "/posts/new", label: "New post" },
  { href: "/profile", label: "Profile" },
];

export function MobileNav({
  signOutAction,
  pending,
}: {
  signOutAction: () => void;
  pending: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="sm:hidden">
      <button
        aria-label="Menu"
        onClick={() => setOpen((o) => !o)}
        className="grid h-9 w-9 place-items-center rounded-md border border-border text-muted hover:text-fg"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6">
          {open ? (
            <path d="M3 3l10 10M13 3L3 13" strokeLinecap="round" />
          ) : (
            <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
          )}
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-4 top-14 z-50 w-48 overflow-hidden rounded-[12px] border border-border-strong bg-bg-elev p-1.5 shadow-2xl">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between rounded-[8px] px-3 py-2 text-sm text-fg hover:bg-surface-2"
              >
                {l.label}
                {l.href === "/connections" && pending > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-fg">
                    {pending}
                  </span>
                )}
              </Link>
            ))}
            <form action={signOutAction} className="border-t border-border pt-1.5">
              <button className="w-full rounded-[8px] px-3 py-2 text-left text-sm text-muted hover:bg-surface-2 hover:text-fg">
                Sign out
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
