"use client";

import { useEffect } from "react";
import { burstConfetti } from "./confetti";

// Fires a one-shot burst on mount, deduped per key per session (for the person
// who lands on a success state, e.g. "You're in").
export function Confetti({ fireKey }: { fireKey: string }) {
  useEffect(() => {
    const k = `confetti:${fireKey}`;
    try {
      if (sessionStorage.getItem(k)) return;
      sessionStorage.setItem(k, "1");
    } catch {}
    burstConfetti();
  }, [fireKey]);

  return null;
}
