import type { GithubRepo, GithubStats } from "@/lib/github";
import { Card } from "@/components/ui";
import { CountUp } from "@/components/CountUp";

const LANG_COLORS = ["#7c6cff", "#38bdf8", "#34d399", "#fbbf24", "#f472b6", "#a78bfa"];

function isActive(lastPushedAt: string | null) {
  if (!lastPushedAt) return false;
  const days = (Date.now() - new Date(lastPushedAt).getTime()) / 86_400_000;
  return days <= 90;
}

export function GithubHighlights({
  githubUrl,
  githubBio,
  repos,
  stats,
}: {
  githubUrl: string | null;
  githubBio: string | null;
  repos: GithubRepo[];
  stats: GithubStats | null;
}) {
  const hasAny = githubBio || repos.length > 0 || stats;
  if (!githubUrl && !hasAny) return null;

  const handle = githubUrl
    ? githubUrl.replace(/.*github\.com\//i, "").replace(/\/$/, "")
    : null;
  const active = isActive(stats?.lastPushedAt ?? null);
  const langTotal = stats?.languages.reduce((s, l) => s + l.count, 0) ?? 0;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold">
          <svg viewBox="0 0 16 16" width="15" height="15" fill="currentColor" aria-hidden className="text-muted">
            <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 005.47 7.59c.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
          {active && (
            <span className="flex items-center gap-1 rounded-full bg-[var(--success-soft)] px-1.5 py-0.5 text-[10px] font-medium text-[var(--success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)]" /> active
            </span>
          )}
        </h2>
        {handle && (
          <a href={githubUrl!} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-muted hover:text-fg">
            @{handle}
          </a>
        )}
      </div>

      {stats && (
        <div className="mb-3 flex gap-4 text-xs text-muted">
          <span><span className="font-semibold text-fg">★ <CountUp value={stats.totalStars} /></span> stars</span>
          <span><span className="font-semibold text-fg"><CountUp value={stats.followers} /></span> followers</span>
          <span><span className="font-semibold text-fg"><CountUp value={stats.publicRepos} /></span> repos</span>
        </div>
      )}

      {stats && langTotal > 0 && (
        <div className="mb-3">
          <div className="flex h-2 w-full overflow-hidden rounded-full">
            {stats.languages.map((l, i) => (
              <span
                key={l.name}
                title={`${l.name} · ${l.count}`}
                style={{ width: `${(l.count / langTotal) * 100}%`, background: LANG_COLORS[i % LANG_COLORS.length] }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
            {stats.languages.map((l, i) => (
              <span key={l.name} className="flex items-center gap-1 text-xs text-muted">
                <span className="h-2 w-2 rounded-sm" style={{ background: LANG_COLORS[i % LANG_COLORS.length] }} />
                {l.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {githubBio && <p className="mb-3 text-sm text-muted">{githubBio}</p>}

      {repos.length > 0 && (
        <ul className="flex flex-col gap-2">
          {repos.map((r) => (
            <li key={r.name}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-[10px] border border-border bg-bg-elev p-2.5 transition-colors hover:border-border-strong"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-faint">{r.language ? `${r.language} · ` : ""}★ {r.stars}</span>
                </div>
                {r.description && <p className="mt-0.5 text-xs text-muted">{r.description}</p>}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
