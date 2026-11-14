// People-directory ranking — the mini-match layer.
// Soft ranking: every candidate gets a 0–100 fit vs the active filters, so the
// board never comes up empty with sparse data — near-matches just rank lower.
// Weights are tunable consts. ponytail: flat weighted-average over ACTIVE filters.

export type PeopleFilter = {
  skills: string[];
  role: string | null;
  minYears: number | null;
  location: string | null;
  openTo: string[];
};

export type Candidate = {
  skills: string[];
  role: string | null;
  yearsExperience: number | null;
  location: string | null;
  openTo: string[];
  bio?: string | null;
  githubRepos?: unknown;
  image?: string | null;
};

export const WEIGHTS = { skills: 50, role: 20, experience: 15, location: 10, openTo: 15 };

export function hasActiveFilter(f: PeopleFilter): boolean {
  return (
    f.skills.length > 0 ||
    !!f.role ||
    f.minYears != null ||
    !!f.location ||
    f.openTo.length > 0
  );
}

export function peopleFit(c: Candidate, f: PeopleFilter): number {
  let weighted = 0;
  let total = 0;

  if (f.skills.length) {
    const cs = new Set(c.skills.map((s) => s.toLowerCase()));
    const hit = f.skills.filter((s) => cs.has(s.toLowerCase())).length;
    weighted += WEIGHTS.skills * (hit / f.skills.length);
    total += WEIGHTS.skills;
  }
  if (f.role) {
    weighted += WEIGHTS.role * (c.role === f.role ? 1 : 0);
    total += WEIGHTS.role;
  }
  if (f.minYears != null) {
    const y = c.yearsExperience ?? 0;
    const s = y >= f.minYears ? 1 : f.minYears > 0 ? Math.max(0, y / f.minYears) : 1;
    weighted += WEIGHTS.experience * s;
    total += WEIGHTS.experience;
  }
  if (f.location) {
    const m = (c.location ?? "").toLowerCase().includes(f.location.toLowerCase()) ? 1 : 0;
    weighted += WEIGHTS.location * m;
    total += WEIGHTS.location;
  }
  if (f.openTo.length) {
    const co = new Set(c.openTo);
    const m = f.openTo.some((o) => co.has(o)) ? 1 : 0;
    weighted += WEIGHTS.openTo * m;
    total += WEIGHTS.openTo;
  }

  if (total === 0) return 0;
  return Math.round((weighted / total) * 100);
}

/** Feed fit: how much of a post's needed skills the viewer covers (0–100). */
export function postFit(viewerSkills: string[], neededSkills: string[]): number {
  if (!neededSkills.length) return 0;
  const vs = new Set(viewerSkills.map((s) => s.toLowerCase()));
  const hit = neededSkills.filter((s) => vs.has(s.toLowerCase())).length;
  return Math.round((hit / neededSkills.length) * 100);
}

// Complementary match: score the viewer against a post by how well they fill the
// skills the team STILL LACKS (not just overlap), plus availability and campus.
// Returns a "why you match" explanation. ponytail: weights as tunable consts.
export const POST_WEIGHTS = { gap: 70, availability: 15, campus: 15 };

export function postMatch(opts: {
  viewerSkills: string[];
  viewerOpenTo: string[];
  viewerBranch: string | null;
  neededSkills: string[];
  postType: string;
  authorBranch: string | null;
  memberSkills: string[]; // author + accepted members
}): { fit: number; reasons: string[] } {
  const lc = (s: string) => s.toLowerCase();
  const covered = new Set(opts.memberSkills.map(lc));
  const open = opts.neededSkills.filter((s) => !covered.has(lc(s))); // remaining gaps
  const vs = new Set(opts.viewerSkills.map(lc));
  const brings = open.filter((s) => vs.has(lc(s)));

  const gapBase = open.length ? brings.length / open.length : 0;
  const avail = opts.viewerOpenTo.map(lc).includes(lc(opts.postType));
  const sameCampus =
    !!opts.authorBranch && !!opts.viewerBranch && lc(opts.authorBranch) === lc(opts.viewerBranch);

  const score =
    POST_WEIGHTS.gap * gapBase +
    (avail ? POST_WEIGHTS.availability : 0) +
    (sameCampus ? POST_WEIGHTS.campus : 0);

  const reasons: string[] = [];
  if (brings.length) reasons.push(`brings ${brings.join(", ")}`);
  if (avail) reasons.push(`open to ${opts.postType}s`);
  if (sameCampus) reasons.push("same campus");

  return { fit: Math.round(Math.min(100, score)), reasons };
}

/** When no filters are active, rank by how complete/useful a profile is. */
export function completeness(c: Candidate): number {
  let n = 0;
  if (c.bio) n++;
  if (c.skills.length) n++;
  if (c.role) n++;
  if (c.location) n++;
  if (c.yearsExperience != null) n++;
  if (c.openTo.length) n++;
  if (Array.isArray(c.githubRepos) && c.githubRepos.length) n += 2;
  if (c.image) n++;
  return n;
}
