// Run: npx tsx lib/matchScore.test.ts
import assert from "node:assert";
import { peopleFit, postFit, postMatch, hasActiveFilter, type Candidate, type PeopleFilter } from "./matchScore";

const base = (over: Partial<Candidate> = {}): Candidate => ({
  skills: [],
  role: null,
  yearsExperience: null,
  location: null,
  openTo: [],
  ...over,
});
const filt = (over: Partial<PeopleFilter> = {}): PeopleFilter => ({
  skills: [],
  role: null,
  minYears: null,
  location: null,
  openTo: [],
  ...over,
});

// skill overlap: full > partial > none
const f = filt({ skills: ["react", "typescript"] });
const full = peopleFit(base({ skills: ["react", "typescript"] }), f);
const partial = peopleFit(base({ skills: ["react"] }), f);
const none = peopleFit(base({ skills: ["python"] }), f);
assert.ok(full > partial && partial > none, "skill overlap ordering");
assert.equal(full, 100);
assert.equal(none, 0);

// experience threshold monotonic (more years never scores lower)
const fe = filt({ minYears: 3 });
assert.ok(peopleFit(base({ yearsExperience: 3 }), fe) >= peopleFit(base({ yearsExperience: 1 }), fe));
assert.equal(peopleFit(base({ yearsExperience: 5 }), fe), 100);

// role + location exact
assert.equal(peopleFit(base({ role: "backend" }), filt({ role: "backend" })), 100);
assert.equal(peopleFit(base({ location: "Delhi" }), filt({ location: "delhi" })), 100);

// openTo intersection
assert.equal(peopleFit(base({ openTo: ["hackathon"] }), filt({ openTo: ["hackathon", "project"] })), 100);
assert.equal(peopleFit(base({ openTo: ["project"] }), filt({ openTo: ["internship"] })), 0);

// no active filter → 0 and hasActiveFilter false
assert.equal(hasActiveFilter(filt()), false);
assert.equal(peopleFit(base({ skills: ["react"] }), filt()), 0);

// postFit: fraction of needed skills the viewer covers
assert.equal(postFit(["react", "node"], ["react", "node"]), 100);
assert.equal(postFit(["react"], ["react", "node"]), 50);
assert.equal(postFit(["python"], ["react", "node"]), 0);
assert.equal(postFit(["react"], []), 0);

// postMatch: filling an OPEN gap beats bringing a skill already covered
const pm = (over: Partial<Parameters<typeof postMatch>[0]> = {}) =>
  postMatch({
    viewerSkills: [], viewerOpenTo: [], viewerBranch: null,
    neededSkills: ["react", "node"], postType: "hackathon", authorBranch: "CSE",
    memberSkills: [], ...over,
  });
const fillsGap = pm({ viewerSkills: ["react"] }).fit;          // react is open
const fillsCovered = pm({ viewerSkills: ["react"], memberSkills: ["react"] }).fit; // react already covered
assert.ok(fillsGap > fillsCovered, "filling an open gap scores higher than a covered one");
// availability + campus add
assert.ok(pm({ viewerSkills: ["react"], viewerOpenTo: ["hackathon"] }).fit > fillsGap);
assert.ok(pm({ viewerSkills: ["react"], viewerBranch: "CSE" }).fit > fillsGap);
// reasons mention what you bring
assert.ok(pm({ viewerSkills: ["react"] }).reasons.some((r) => r.includes("react")));

console.log("matchScore.test.ts ✓");
