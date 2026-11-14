// Enrich a profile from GitHub's public REST API. Resilient: returns null on any
// failure (bad URL, 404, rate limit) so profile save never breaks.
// ponytail: unauthenticated = 60 req/hr/IP; set GITHUB_TOKEN env to raise it.

export type GithubRepo = {
  name: string;
  description: string | null;
  stars: number;
  language: string | null;
  url: string;
};

export type GithubStats = {
  totalStars: number;
  followers: number;
  publicRepos: number;
  lastPushedAt: string | null;
  languages: { name: string; count: number }[]; // repo count per language, desc
};

export type GithubProfile = {
  username: string;
  avatar: string | null;
  bio: string | null;
  topRepos: GithubRepo[];
  stats: GithubStats;
};

/** "https://github.com/foo", "github.com/foo/", "@foo" or "foo" -> "foo" (or null) */
export function parseGithubUsername(input: string | null | undefined): string | null {
  if (!input) return null;
  let s = input.trim();
  s = s.replace(/^@/, "");
  const m = s.match(/github\.com\/([^/?#\s]+)/i);
  if (m) s = m[1];
  s = s.replace(/\/+$/, "");
  // valid GitHub usernames: alphanumeric or single hyphens, 1–39 chars
  return /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(s) ? s : null;
}

function headers() {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "crewo-app",
  };
  if (process.env.GITHUB_TOKEN) h.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  return h;
}

export async function fetchGithubProfile(
  urlOrUsername: string | null | undefined
): Promise<GithubProfile | null> {
  const username = parseGithubUsername(urlOrUsername);
  if (!username) return null;

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers: headers() }),
      fetch(
        `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100&type=owner`,
        { headers: headers() }
      ),
    ]);
    if (!userRes.ok) return null;

    const user = await userRes.json();
    const repos = (reposRes.ok ? await reposRes.json() : []) as Record<string, unknown>[];
    const owned = repos.filter((r) => !r.fork);

    const mapped: GithubRepo[] = owned.map((r) => ({
      name: String(r.name),
      description: (r.description as string | null) ?? null,
      stars: Number(r.stargazers_count ?? 0),
      language: (r.language as string | null) ?? null,
      url: String(r.html_url),
    }));

    const topRepos = [...mapped].sort((a, b) => b.stars - a.stars).slice(0, 4);

    const langCounts = new Map<string, number>();
    for (const r of mapped) {
      if (r.language) langCounts.set(r.language, (langCounts.get(r.language) ?? 0) + 1);
    }
    const languages = [...langCounts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    const lastPushedAt = owned
      .map((r) => String(r.pushed_at ?? ""))
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;

    const stats: GithubStats = {
      totalStars: mapped.reduce((s, r) => s + r.stars, 0),
      followers: Number(user.followers ?? 0),
      publicRepos: Number(user.public_repos ?? 0),
      lastPushedAt,
      languages,
    };

    return { username, avatar: user.avatar_url ?? null, bio: user.bio ?? null, topRepos, stats };
  } catch {
    return null;
  }
}
