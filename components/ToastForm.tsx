"use client";

import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { burstConfetti } from "./confettiBurst";
import { cn } from "./ui";

// A form whose submit button fires its toast based on the REAL result of the
// server action — success only when it resolves, error when it rejects — instead
// of optimistically on click. Use for non-redirecting mutations (request/connect/
// accept). Redirecting actions (e.g. createPost) should NOT use this.
function Submit({
  children,
  variant,
  className,
}: {
  children: React.ReactNode;
  variant: "primary" | "secondary";
  className?: string;
}) {
  const { pending } = useFormStatus();
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[10px] px-3 py-1.5 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none";
  const styles =
    variant === "primary"
      ? "bg-accent text-accent-fg shadow-[0_2px_20px_-6px_var(--accent-glow)] hover:brightness-110"
      : "border border-border bg-surface text-fg hover:bg-surface-2";
  return (
    <button type="submit" disabled={pending} className={cn(base, styles, className)}>
      {children}
    </button>
  );
}

export function ToastForm({
  action,
  success,
  confetti,
  variant = "primary",
  submitLabel,
  submitClassName,
  className,
  children,
}: {
  action: (formData: FormData) => Promise<void>;
  success: string;
  confetti?: boolean;
  variant?: "primary" | "secondary";
  submitLabel: React.ReactNode;
  submitClassName?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  async function run(formData: FormData) {
    try {
      await action(formData);
      if (confetti) burstConfetti(window.innerWidth / 2, window.innerHeight * 0.4);
      toast.success(success);
    } catch {
      toast.error("That didn't go through — please try again.");
    }
  }

  return (
    <form action={run} className={className}>
      {children}
      <Submit variant={variant} className={submitClassName}>
        {submitLabel}
      </Submit>
    </form>
  );
}
