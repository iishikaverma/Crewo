// Crewo mark: an open "C" (crew) with a node settling into the gap — "join your crew".
// Flat gradient, references the shared #crewoGrad def rendered once in app/layout.tsx.
export function Logo({ size = 20, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M29.19 10.81 A13 13 0 1 0 29.19 29.19"
        fill="none"
        stroke="url(#crewoGrad)"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="30.5" cy="20" r="3.3" fill="url(#crewoGrad)" />
    </svg>
  );
}
