"use client";

import { useEffect } from "react";

// One global listener that points every .glow-card's radial glow at the cursor.
export function Spotlight() {
  useEffect(() => {
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const target = (e.target as HTMLElement)?.closest(".glow-card") as HTMLElement | null;
        if (!target) return;
        const r = target.getBoundingClientRect();
        target.style.setProperty("--mx", `${e.clientX - r.left}px`);
        target.style.setProperty("--my", `${e.clientY - r.top}px`);
      });
    };
    document.addEventListener("pointermove", onMove);
    return () => document.removeEventListener("pointermove", onMove);
  }, []);
  return null;
}
