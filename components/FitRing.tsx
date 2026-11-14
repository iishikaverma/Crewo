import type { CSSProperties } from "react";

// CSS-only animated conic ring (works in server components; animates on mount).
export function FitRing({ fit, size = 42 }: { fit: number; size?: number }) {
  const strong = fit >= 60;
  const style = {
    width: size,
    height: size,
    ["--fit-target"]: `${Math.max(0, Math.min(100, fit)) * 3.6}deg`,
    ["--fit-color"]: strong ? "var(--success)" : "var(--accent)",
  } as CSSProperties;

  return (
    <div className="fit-ring shrink-0" style={style} title={`${fit}% fit`}>
      <span className={`font-mono text-[11px] font-semibold ${strong ? "text-[var(--success)]" : "text-accent-2"}`}>
        {fit}
        <span className="text-[8px] text-muted">%</span>
      </span>
    </div>
  );
}
