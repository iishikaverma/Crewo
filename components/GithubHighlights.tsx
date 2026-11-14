import type { GithubRepo } from "@/lib/github";

export function GithubHighlights({
  githubUrl,
  githubBio,
  repos,
}: {
  githubUrl: string | null;
  githubBio: string | null;
  repos: GithubRepo[];
}) {
  const hasAny = githubBio || repos.length > 0;
  if (!githubUrl && !hasAny) return null;

  return (
    <section className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold">GitHub</h2>
        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-500 hover:underline"
          >
            @{githubUrl.replace(/.*github\.com\//i, "").replace(/\/$/, "")}
          </a>
        )}
      </div>

      {githubBio && <p className="mb-3 text-sm text-gray-600 dark:text-gray-400">{githubBio}</p>}

      {repos.length > 0 ? (
        <ul className="flex flex-col gap-2">
          {repos.map((r) => (
            <li key={r.name}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-md border border-gray-200 p-2 text-sm hover:border-gray-400 dark:border-gray-800 dark:hover:border-gray-600"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.name}</span>
                  <span className="text-xs text-gray-500">
                    {r.language ? `${r.language} · ` : ""}★ {r.stars}
                  </span>
                </div>
                {r.description && (
                  <p className="text-xs text-gray-500">{r.description}</p>
                )}
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400">No public repos fetched yet.</p>
      )}
    </section>
  );
}
