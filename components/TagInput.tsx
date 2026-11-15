"use client";

import { useState } from "react";

// Type a skill, press Enter or comma (or click away) → it becomes a chip.
// Submits as a single comma-joined hidden field (server side already splits on commas).
export function TagInput({
  name,
  defaultValue = [],
  placeholder = "type a skill, press enter",
}: {
  name: string;
  defaultValue?: string[];
  placeholder?: string;
}) {
  const [tags, setTags] = useState<string[]>(defaultValue);
  const [val, setVal] = useState("");

  function add(raw: string) {
    const parts = raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
    if (parts.length) setTags((t) => [...new Set([...t, ...parts])]);
    setVal("");
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    const cur = e.currentTarget.value;
    if (e.key === "Enter" || e.key === "," || e.key === "Tab" || e.code === "Comma") {
      if (!cur.trim()) return;
      e.preventDefault();
      add(cur);
    } else if (e.key === "Backspace" && !cur && tags.length) {
      setTags((t) => t.slice(0, -1));
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-1.5 rounded-[10px] border border-border bg-surface p-2 transition-colors focus-within:border-accent">
        {tags.map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs text-fg">
            {t}
            <button
              type="button"
              aria-label={`Remove ${t}`}
              onClick={() => setTags((x) => x.filter((y) => y !== t))}
              className="text-faint hover:text-fg"
            >
              ×
            </button>
          </span>
        ))}
        <input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={(e) => add(e.currentTarget.value)}
          placeholder={tags.length ? "" : placeholder}
          className="min-w-28 flex-1 bg-transparent text-sm text-fg outline-none placeholder:text-faint"
        />
      </div>
      <input type="hidden" name={name} value={tags.join(",")} />
    </div>
  );
}
