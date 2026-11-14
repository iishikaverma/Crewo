// Shared confetti burst — appends short-lived DOM pieces at an origin point.
const COLORS = ["#7c6cff", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#38bdf8"];

export function burstConfetti(originX?: number, originY?: number) {
  if (typeof window === "undefined") return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

  const ox = originX ?? window.innerWidth / 2;
  const oy = originY ?? window.innerHeight * 0.3;

  for (let i = 0; i < 70; i++) {
    const p = document.createElement("div");
    p.className = "confetti-piece";
    p.style.left = `${ox}px`;
    p.style.top = `${oy}px`;
    p.style.background = COLORS[i % COLORS.length];
    const ang = Math.random() * Math.PI * 2;
    const dist = 120 + Math.random() * 240;
    p.style.setProperty("--cx", `${Math.cos(ang) * dist}px`);
    p.style.setProperty("--cy", `${Math.sin(ang) * dist + 220}px`);
    p.style.setProperty("--cr", `${Math.random() * 720 - 360}deg`);
    p.style.animationDelay = `${Math.random() * 0.12}s`;
    document.body.appendChild(p);
    p.addEventListener("animationend", () => p.remove());
  }
}
