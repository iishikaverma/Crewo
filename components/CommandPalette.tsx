"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Item = { href: string; label: string; sub: string; kind: "person" | "post" | "nav" };

const NAV: Item[] = [
  { href: "/", label: "Browse", sub: "feed", kind: "nav" },
  { href: "/people", label: "People", sub: "directory", kind: "nav" },
  { href: "/connections", label: "Connections", sub: "your crew", kind: "nav" },
  { href: "/posts/new", label: "New post", sub: "post a need", kind: "nav" },
  { href: "/profile", label: "Profile", sub: "edit yours", kind: "nav" },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Item[]>(NAV);
  const [sel, setSel] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // global shortcut
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpen = () => setOpen(true);
    document.addEventListener("keydown", onKey);
    window.addEventListener("crewo:open-cmdk", onOpen);
    return () => {
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("crewo:open-cmdk", onOpen);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQ("");
      setItems(NAV);
      setSel(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  // debounced search
  useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (!term) {
      setItems(NAV);
      setSel(0);
      return;
    }
    const navMatches = NAV.filter((n) => n.label.toLowerCase().includes(term.toLowerCase()));
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
        const data = await res.json();
        const people: Item[] = (data.people ?? []).map((p: { id: string; name: string | null; role: string | null }) => ({
          href: `/u/${p.id}`,
          label: p.name ?? "Unnamed",
          sub: p.role ?? "person",
          kind: "person" as const,
        }));
        const posts: Item[] = (data.posts ?? []).map((p: { id: string; title: string; type: string }) => ({
          href: `/posts/${p.id}`,
          label: p.title,
          sub: p.type,
          kind: "post" as const,
        }));
        setItems([...navMatches, ...people, ...posts]);
        setSel(0);
      } catch {
        setItems(navMatches);
      }
    }, 160);
    return () => clearTimeout(t);
  }, [q, open]);

  const go = useCallback(
    (item?: Item) => {
      if (!item) return;
      setOpen(false);
      router.push(item.href);
    },
    [router]
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => Math.min(s + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => Math.max(s - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(items[sel]);
    }
  };

  if (!open) return null;

  const icon = (k: Item["kind"]) => (k === "person" ? "◍" : k === "post" ? "◆" : "→");

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[18vh] backdrop-blur-sm"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-[14px] border border-border-strong bg-bg-elev shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={inputRef}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search people, posts, or jump to…"
          className="w-full border-b border-border bg-transparent px-4 py-3.5 text-sm text-fg placeholder:text-faint focus:outline-none"
        />
        <ul className="max-h-80 overflow-y-auto p-1.5">
          {items.length === 0 && <li className="px-3 py-6 text-center text-sm text-muted">No matches.</li>}
          {items.map((it, i) => (
            <li key={it.href + i}>
              <button
                onMouseEnter={() => setSel(i)}
                onClick={() => go(it)}
                className={
                  "flex w-full items-center gap-3 rounded-[9px] px-3 py-2 text-left text-sm " +
                  (i === sel ? "bg-accent text-accent-fg" : "text-fg hover:bg-surface-2")
                }
              >
                <span className={i === sel ? "text-accent-fg" : "text-faint"}>{icon(it.kind)}</span>
                <span className="flex-1 truncate">{it.label}</span>
                <span className={"text-xs " + (i === sel ? "text-accent-fg/70" : "text-faint")}>{it.sub}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="flex items-center justify-between border-t border-border px-3 py-2 text-[11px] text-faint">
          <span>↑↓ navigate · ↵ open · esc close</span>
          <span className="font-mono">⌘K</span>
        </div>
      </div>
    </div>
  );
}
