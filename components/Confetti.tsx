"use client";

import { useEffect } from "react";

const COLORS = ["#7c6cff", "#a78bfa", "#f472b6", "#fbbf24", "#34d399", "#38bdf8"];

// Fires a one-shot burst on mount, deduped per key per session.
export function Confetti({ fireKey }: { fireKey: string }) {
  useEffect(() => {
    const k = `confetti:${fireKey}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const ox = window.innerWidth / 2;
    const oy = window.innerHeight * 0.32;
    for (let i = 0; i < 64; i++) {
      const p = document.createElement("div");
      p.className = "confetti-piece";
      p.style.left = `${ox}px`;
      p.style.top = `${oy}px`;
      p.style.background = COLORS[i % COLORS.length];
      const ang = Math.random() * Math.PI * 2;
      const dist = 120 + Math.random() * 220;
      p.style.setProperty("--cx", `${Math.cos(ang) * dist}px`);
      p.style.setProperty("--cy", `${Math.sin(ang) * dist + 200}px`);
      p.style.setProperty("--cr", `${Math.random() * 720 - 360}deg`);
      p.style.animationDelay = `${Math.random() * 0.12}s`;
      document.body.appendChild(p);
      p.addEventListener("animationend", () => p.remove());
    }
  }, [fireKey]);

  return null;
}
