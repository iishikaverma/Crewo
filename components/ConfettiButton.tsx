"use client";

import { burstConfetti } from "./confetti";

// A submit button that fires confetti from the click point, then submits the form.
export function ConfettiButton({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      onClick={(e) => burstConfetti(e.clientX, e.clientY)}
      className={
        "inline-flex items-center justify-center gap-2 rounded-[10px] bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg shadow-[0_2px_20px_-6px_var(--accent-glow)] transition-all hover:brightness-110 " +
        className
      }
    >
      {children}
    </button>
  );
}
