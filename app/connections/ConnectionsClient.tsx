"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
import { respondConnect } from "./actions";
import { Card, Button, EmptyState, Avatar } from "@/components/ui";
import { burstConfetti } from "@/components/confettiBurst";

type Person = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  image: string | null;
  githubUrl: string | null;
  linkedinUrl: string | null;
};
type Req = { id: string; message: string; from: Person };
type Conn = { id: string; other: Person };
type Sent = { id: string; to: { id: string; name: string | null; email: string } };

// Run a DOM update as a View Transition when supported, so cards morph/glide.
function withTransition(fn: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => void;
  };
  if (doc.startViewTransition) doc.startViewTransition(() => flushSync(fn));
  else fn();
}

function PersonLink({ user }: { user: { id: string; name: string | null; email: string } }) {
  return (
    <Link href={`/u/${user.id}`} className="font-medium text-fg transition-colors hover:text-accent-2">
      {user.name ?? user.email}
    </Link>
  );
}

export function ConnectionsClient({
  initialRequests,
  initialConnections,
  sent,
}: {
  initialRequests: Req[];
  initialConnections: Conn[];
  sent: Sent[];
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [connections, setConnections] = useState(initialConnections);

  function accept(r: Req, x: number, y: number) {
    burstConfetti(x, y);
    withTransition(() => {
      setRequests((rs) => rs.filter((x) => x.id !== r.id));
      setConnections((cs) => [{ id: r.id, other: r.from }, ...cs]);
    });
    respondConnect(r.id, "accepted");
    toast.success(`Connected with ${r.from.name ?? "them"}`);
  }

  function decline(id: string) {
    withTransition(() => setRequests((rs) => rs.filter((x) => x.id !== id)));
    respondConnect(id, "declined");
    toast("Request declined");
  }

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">
          Requests to you{requests.length > 0 ? ` (${requests.length})` : ""}
        </h2>
        {requests.length === 0 ? (
          <EmptyState>No pending requests.</EmptyState>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
          {requests.map((r) => (
            <div key={r.id} style={{ viewTransitionName: `conn-${r.id}` }}>
              <Card className="flex h-full flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <Avatar src={r.from.image} name={r.from.name} size={36} />
                  <div className="min-w-0">
                    <PersonLink user={r.from} />
                    {r.from.role && <p className="truncate text-xs text-muted">{r.from.role}</p>}
                  </div>
                </div>
                {r.message && <p className="text-sm text-muted">&ldquo;{r.message}&rdquo;</p>}
                <div className="mt-auto flex gap-2 pt-1">
                  <button
                    onClick={(e) => accept(r, e.clientX, e.clientY)}
                    className="inline-flex items-center justify-center rounded-[10px] bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg shadow-[0_2px_20px_-6px_var(--accent-glow)] transition-all hover:brightness-110"
                  >
                    Accept
                  </button>
                  <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => decline(r.id)}>
                    Decline
                  </Button>
                </div>
              </Card>
            </div>
          ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Your connections</h2>
        {connections.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-[12px] border border-dashed border-border p-10 text-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-faint" aria-hidden>
              <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a3 3 0 1 0 0-6M3 20c0-3 2.7-5 6-5s6 2 6 5m2-5c2.7.3 4 2 4 5" />
            </svg>
            <div>
              <p className="text-sm font-medium text-fg">No connections yet</p>
              <p className="mt-0.5 text-sm text-muted">Connect with people and they&apos;ll show up here.</p>
            </div>
            <Link href="/people" className="inline-flex items-center rounded-[10px] bg-accent px-3.5 py-2 text-xs font-medium text-accent-fg shadow-[0_2px_20px_-6px_var(--accent-glow)] transition-all hover:brightness-110">
              Find people
            </Link>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
          {connections.map((c) => (
            <div key={c.id} style={{ viewTransitionName: `conn-${c.id}` }}>
              <Card className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2.5">
                  <Avatar src={c.other.image} name={c.other.name} size={36} />
                  <div className="min-w-0">
                    <PersonLink user={c.other} />
                    {c.other.role && <p className="truncate text-sm text-muted">{c.other.role}</p>}
                  </div>
                </div>
                <div className="flex shrink-0 gap-3 text-sm">
                  {c.other.githubUrl && (
                    <a href={c.other.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">GitHub</a>
                  )}
                  {c.other.linkedinUrl && (
                    <a href={c.other.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">LinkedIn</a>
                  )}
                </div>
              </Card>
            </div>
          ))}
          </div>
        )}
      </section>

      {sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Sent — pending</h2>
          <div className="grid gap-3 sm:grid-cols-2">
          {sent.map((r) => (
            <Card key={r.id} className="py-3 text-sm">
              <PersonLink user={r.to} /> <span className="text-muted">· waiting</span>
            </Card>
          ))}
          </div>
        </section>
      )}
    </>
  );
}
