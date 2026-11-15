"use client";

import { toast } from "sonner";
import { burstConfetti } from "./confettiBurst";
import { cn } from "./ui";

// A submit button that fires a toast (and optionally confetti) on click, then
// lets the form's server action run. Covers post/request/connect feedback.
export function ToastButton({
  children,
  message,
  confetti,
  variant = "primary",
  size = "sm",
  className = "",
}: {
  children: React.ReactNode;
  message?: string;
  confetti?: boolean;
  variant?: "primary" | "secondary";
  size?: "sm" | "md";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[10px] text-sm font-medium transition-all";
  const pad = size === "md" ? "px-5 py-2.5" : "px-3 py-1.5";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-fg shadow-[0_2px_20px_-6px_var(--accent-glow)] hover:brightness-110"
      : "border border-border bg-surface text-fg hover:bg-surface-2";
  return (
    <button
      type="submit"
      onClick={(e) => {
        if (confetti) burstConfetti(e.clientX, e.clientY);
        if (message) toast.success(message);
      }}
      className={cn(base, pad, styles, className)}
    >
      {children}
    </button>
  );
}
