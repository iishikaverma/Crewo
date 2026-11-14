"use client";

import { useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { respondConnect } from "./actions";
import { Card, Button, EmptyState } from "@/components/ui";
import { burstConfetti } from "@/components/confetti";

type Person = {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
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
    <Link href={`/u/${user.id}`} className="font-medium hover:text-accent-2 hover:underline">
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
  }

  function decline(id: string) {
    withTransition(() => setRequests((rs) => rs.filter((x) => x.id !== id)));
    respondConnect(id, "declined");
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
          requests.map((r) => (
            <div key={r.id} style={{ viewTransitionName: `conn-${r.id}` }}>
              <Card>
                <p className="text-sm">
                  <PersonLink user={r.from} />
                  {r.from.role ? ` · ${r.from.role}` : ""}
                </p>
                {r.message && <p className="mt-1 text-sm text-muted">{r.message}</p>}
                <div className="mt-3 flex gap-2">
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
          ))
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold tracking-tight">Your connections</h2>
        {connections.length === 0 ? (
          <EmptyState>
            None yet. <Link href="/people" className="text-accent-2 hover:underline">Find people</Link>.
          </EmptyState>
        ) : (
          connections.map((c) => (
            <div key={c.id} style={{ viewTransitionName: `conn-${c.id}` }}>
              <Card className="flex items-center justify-between">
                <div>
                  <PersonLink user={c.other} />
                  <p className="text-sm text-muted">{c.other.role ?? ""}</p>
                </div>
                <div className="flex gap-3 text-sm">
                  {c.other.githubUrl && (
                    <a href={c.other.githubUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">GitHub</a>
                  )}
                  {c.other.linkedinUrl && (
                    <a href={c.other.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-fg">LinkedIn</a>
                  )}
                </div>
              </Card>
            </div>
          ))
        )}
      </section>

      {sent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold tracking-tight">Sent — pending</h2>
          {sent.map((r) => (
            <Card key={r.id} className="py-3 text-sm">
              <PersonLink user={r.to} /> <span className="text-muted">· waiting</span>
            </Card>
          ))}
        </section>
      )}
    </>
  );
}
