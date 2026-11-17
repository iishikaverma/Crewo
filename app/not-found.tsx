import Link from "next/link";
import { Button } from "@/components/ui";
import { Logo } from "@/components/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 text-center">
      <Logo size={40} />
      <div>
        <h1 className="text-xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-1 text-sm text-muted">
          That page doesn&apos;t exist or may have moved.
        </p>
      </div>
      <Link href="/">
        <Button>Go home</Button>
      </Link>
    </main>
  );
}
