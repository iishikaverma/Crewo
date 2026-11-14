"use client";

export function CmdKButton() {
  return (
    <button
      onClick={() => window.dispatchEvent(new Event("crewo:open-cmdk"))}
      className="hidden items-center gap-1 rounded-md border border-border bg-surface px-2 py-1 font-mono text-[11px] text-muted transition-colors hover:border-border-strong hover:text-fg sm:flex"
      aria-label="Open command palette"
    >
      <span>⌘</span>K
    </button>
  );
}
