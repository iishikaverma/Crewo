"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/Logo";

export default function Error({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size={40} />
      <div>
        <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-1 text-sm text-muted">
          That didn&apos;t work as expected. You can try again.
        </p>
      </div>
      <div className="flex gap-2">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/">
          <Button variant="secondary">Go home</Button>
        </Link>
      </div>
    </main>
  );
}
