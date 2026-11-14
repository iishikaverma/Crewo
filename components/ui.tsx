import * as React from "react";

export function cn(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ---------- Button ---------- */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger";
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-[10px] px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 disabled:pointer-events-none";
const btnVariants: Record<BtnVariant, string> = {
  primary:
    "bg-accent text-accent-fg shadow-[0_2px_20px_-6px_var(--accent-glow)] hover:brightness-110 active:brightness-95",
  secondary:
    "border border-border bg-surface text-fg hover:bg-surface-2 hover:border-border-strong",
  ghost: "text-muted hover:bg-surface-2 hover:text-fg",
  danger: "border border-border bg-surface text-[var(--danger)] hover:bg-surface-2",
};

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant }) {
  return <button className={cn(btnBase, btnVariants[variant], className)} {...props} />;
}

/* ---------- Inputs ---------- */
const fieldBase =
  "w-full rounded-[10px] border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-faint transition-colors focus:border-accent";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}
export function Textarea({ className, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(fieldBase, "resize-y", className)} {...props} />;
}
export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldBase, "appearance-none", className)} {...props} />;
}
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

/* ---------- Card ---------- */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-[12px] border border-border bg-surface p-4", className)}
      {...props}
    />
  );
}

/* ---------- Badge / chips ---------- */
export function Badge({
  tone = "muted",
  className,
  children,
}: {
  tone?: "muted" | "accent" | "success";
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    muted: "bg-surface-2 text-muted",
    accent: "bg-[var(--accent-soft)] text-accent-2",
    success: "bg-[var(--success-soft)] text-[var(--success)]",
  };
  return (
    <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function SkillChip({ active, children }: { active?: boolean; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "rounded-md px-2 py-0.5 font-mono text-xs",
        active
          ? "bg-[var(--success-soft)] text-[var(--success)] ring-1 ring-[var(--success)]/30"
          : "bg-surface-2 text-muted"
      )}
    >
      {children}
    </span>
  );
}

export function FitBadge({ fit }: { fit: number }) {
  const strong = fit >= 60;
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-1.5 py-0.5 text-xs font-semibold",
        strong ? "bg-[var(--success-soft)] text-[var(--success)]" : "bg-surface-2 text-muted"
      )}
    >
      {fit}% fit
    </span>
  );
}

/* ---------- Avatar ---------- */
export function Avatar({
  src,
  name,
  size = 48,
}: {
  src: string | null;
  name: string | null;
  size?: number;
}) {
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="shrink-0 rounded-full ring-1 ring-border object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold text-muted ring-1 ring-border"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {(name ?? "?").charAt(0).toUpperCase()}
    </div>
  );
}

/* ---------- Layout helpers ---------- */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <h1 className="text-xl font-bold tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[12px] border border-dashed border-border p-8 text-center text-sm text-muted">
      {children}
    </div>
  );
}
