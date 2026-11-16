import Link from "next/link";
import { TileGrid } from "@/components/TileGrid";
import { FitRing } from "@/components/FitRing";
import { Button, Card, SkillChip } from "@/components/ui";
import { Logo } from "@/components/Logo";

const STACK = [
  "typescript", "react", "next.js", "node", "python", "pytorch", "figma",
  "flutter", "go", "postgres", "docker", "aws", "java", "firebase", "ui/ux",
];

/* ---- hero product preview (built from real UI bits) ---- */
function PreviewRow({
  initials, name, meta, skills, fit, highlight,
}: {
  initials: string; name: string; meta: string; skills: string[]; fit: number; highlight?: string[];
}) {
  const hot = new Set((highlight ?? []).map((s) => s.toLowerCase()));
  return (
    <div className="flex items-center gap-3 rounded-[10px] border border-border bg-bg-elev p-3">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold text-muted ring-1 ring-border">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-muted">{meta}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {skills.map((s) => (
            <SkillChip key={s} active={hot.has(s.toLowerCase())}>{s}</SkillChip>
          ))}
        </div>
      </div>
      <FitRing fit={fit} size={40} />
    </div>
  );
}

function LanguagesBar() {
  const langs = [
    { n: "TypeScript", w: 46, c: "#7c6cff" },
    { n: "Python", w: 28, c: "#38bdf8" },
    { n: "Go", w: 16, c: "#34d399" },
    { n: "Other", w: 10, c: "#fbbf24" },
  ];
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        {langs.map((l) => (
          <span key={l.n} style={{ width: `${l.w}%`, background: l.c }} />
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {langs.map((l) => (
          <span key={l.n} className="flex items-center gap-1 text-xs text-muted">
            <span className="h-2 w-2 rounded-sm" style={{ background: l.c }} />{l.n}
          </span>
        ))}
      </div>
    </div>
  );
}

function TeamChecklist() {
  const items = [
    { s: "react", ok: true }, { s: "figma", ok: true }, { s: "node", ok: false }, { s: "postgres", ok: false },
  ];
  return (
    <ul className="flex flex-col gap-1.5">
      {items.map((i) => (
        <li key={i.s} className="flex items-center gap-2 text-sm">
          <span className={i.ok
            ? "grid h-4 w-4 place-items-center rounded-full bg-[var(--success-soft)] text-[10px] text-[var(--success)]"
            : "grid h-4 w-4 place-items-center rounded-full border border-border text-[10px] text-faint"}>
            {i.ok ? "✓" : ""}
          </span>
          <span className={i.ok ? "font-mono text-fg" : "font-mono text-muted"}>{i.s}</span>
          {!i.ok && <span className="text-xs text-faint">· open</span>}
        </li>
      ))}
    </ul>
  );
}

export function Landing() {
  return (
    <div className="relative left-1/2 -mt-8 w-screen -translate-x-1/2">
      {/* Top bar */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="flex items-center gap-2 font-bold tracking-tight">
          <Logo size={22} />
          Crewo
        </span>
        <Link href="/signin">
          <Button variant="secondary" className="px-3 py-1.5 text-xs">Sign in</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <TileGrid />
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-12 lg:grid-cols-2 lg:pt-20">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <span className="mx-auto w-fit rounded-full border border-border bg-surface/60 px-3 py-1 text-xs text-muted backdrop-blur-sm lg:mx-0">
              GitHub-verified · complementary match · campus-first
            </span>
            <h1 className="text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
              Find your{" "}
              <span className="bg-gradient-to-br from-[var(--accent-2)] to-[var(--accent)] bg-clip-text text-transparent">
                hackathon crew.
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-base text-muted sm:text-lg lg:mx-0">
              Crewo matches students into teams by <span className="text-fg">complementary skills</span> —
              backed by real GitHub profiles. Post a need or browse people, request, and form your team.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link href="/signin"><Button className="px-5 py-2.5 text-sm">Get started →</Button></Link>
              <Link href="#how"><Button variant="secondary" className="px-5 py-2.5 text-sm">How it works</Button></Link>
            </div>
          </div>

          {/* Product preview */}
          <div className="relative">
            <div className="absolute -inset-6 -z-10 rounded-[28px] bg-[radial-gradient(60%_60%_at_60%_30%,var(--accent-glow),transparent)] opacity-60 blur-2xl" />
            <div className="floaty rounded-[16px] border border-border-strong bg-surface p-3 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
              <div className="mb-3 flex items-center gap-2 px-1 pt-1">
                <span className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#f87171]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#fbbf24]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#34d399]" />
                </span>
                <span className="ml-2 font-mono text-xs text-faint">crewo · people</span>
              </div>
              <div className="mb-3 flex gap-1.5">
                {["react", "node", "min 2y"].map((c) => (
                  <span key={c} className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-accent-fg">{c}</span>
                ))}
              </div>
              <div className="flex flex-col gap-2">
                <PreviewRow initials="R" name="Rahul" meta="backend · Delhi · 3 yr exp" skills={["node", "postgres", "typescript"]} fit={88} highlight={["react", "node"]} />
                <PreviewRow initials="A" name="Aisha" meta="designer · Mumbai · 2 yr exp" skills={["figma", "ui/ux"]} fit={41} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech-stack marquee */}
      <section className="relative overflow-hidden border-y border-border py-5">
        <div className="marquee-track gap-3">
          {[...STACK, ...STACK].map((s, i) => (
            <span key={i} className="whitespace-nowrap rounded-md bg-surface-2 px-3 py-1 font-mono text-xs text-muted">{s}</span>
          ))}
        </div>
      </section>

      {/* Bento features */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight sm:text-3xl">Built for how teams actually form</h2>
        <p className="mx-auto mb-10 max-w-xl text-center text-sm text-muted">
          Not another event list — a persistent, GitHub-verified matcher with a match score you can trust.
        </p>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Match — spans 2 cols */}
          <Card className="glow-card relative overflow-hidden md:col-span-2">
            <div className="flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <FitRing fit={88} size={72} />
              <div>
                <h3 className="font-semibold tracking-tight">Complementary match, explained</h3>
                <p className="mt-1 text-sm text-muted">Ranks people by the skills your team still lacks — not keyword overlap.</p>
                <p className="mt-2 flex flex-wrap gap-x-1.5 text-xs text-[var(--success)]">
                  <span className="text-muted">why:</span> brings node, postgres · open to hackathons · same campus
                </p>
              </div>
            </div>
          </Card>

          {/* GitHub proof */}
          <Card className="glow-card relative overflow-hidden">
            <h3 className="mb-3 font-semibold tracking-tight">GitHub-verified</h3>
            <LanguagesBar />
            <p className="mt-3 text-xs text-muted">★ 1,240 stars · active this week</p>
          </Card>

          {/* Team composition */}
          <Card className="glow-card relative overflow-hidden">
            <h3 className="mb-3 font-semibold tracking-tight">Team composition</h3>
            <TeamChecklist />
          </Card>

          {/* Directory — spans 2 */}
          <Card className="glow-card relative overflow-hidden md:col-span-2">
            <h3 className="mb-1 font-semibold tracking-tight">Feed + people directory</h3>
            <p className="text-sm text-muted">Post a need, or filter people by stack, experience, role and location. Request → accept → contact revealed. One clean connect loop, for hackathons and projects.</p>
          </Card>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="mb-10 text-center text-2xl font-bold tracking-tight sm:text-3xl">How it works</h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { n: "1", title: "Build your profile", body: "Add your stack and links — GitHub auto-fills your repos, languages and activity." },
            { n: "2", title: "Match & connect", body: "Browse ranked people and posts, see your % fit, and send a request with a note." },
            { n: "3", title: "Form your team", body: "They accept, contact is revealed, and you’ve got your crew. North-star: teams formed." },
          ].map((s) => (
            <div key={s.n} className="flex flex-col gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--accent-soft)] font-mono text-sm font-semibold text-accent-2">{s.n}</span>
              <h3 className="font-semibold tracking-tight">{s.title}</h3>
              <p className="text-sm text-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <div className="absolute inset-x-0 top-1/2 -z-10 mx-auto h-40 max-w-2xl -translate-y-1/2 rounded-full bg-[var(--accent)] opacity-20 blur-[100px]" />
          <h2 className="text-3xl font-bold tracking-tight sm:text-5xl">Form your crew.</h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">Find the teammates who fill your gaps — for your next hackathon or project.</p>
          <div className="mt-6">
            <Link href="/signin"><Button className="px-6 py-3 text-sm">Get started →</Button></Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-xs text-faint">
          <span className="flex items-center gap-2">
            <Logo size={16} />
            Crewo · hackathons &amp; projects
          </span>
          <Link href="/signin" className="hover:text-fg">Sign in</Link>
        </div>
      </footer>
    </div>
  );
}
