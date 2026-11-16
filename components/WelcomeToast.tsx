"use client";

import { useEffect } from "react";
import { toast } from "sonner";

// Fires a one-time welcome toast after login, deduped per browser session.
export function WelcomeToast({ name }: { name: string }) {
  useEffect(() => {
    try {
      if (sessionStorage.getItem("welcomed")) return;
      sessionStorage.setItem("welcomed", "1");
    } catch {}
    toast(`Welcome, ${name}`, { description: "Find your crew — post a need or browse people." });
  }, [name]);
  return null;
}
