// Run: npx tsx lib/github.test.ts
import assert from "node:assert";
import { parseGithubUsername } from "./github";

assert.equal(parseGithubUsername("https://github.com/torvalds"), "torvalds");
assert.equal(parseGithubUsername("github.com/torvalds/"), "torvalds");
assert.equal(parseGithubUsername("https://github.com/foo-bar/some-repo"), "foo-bar");
assert.equal(parseGithubUsername("@octocat"), "octocat");
assert.equal(parseGithubUsername("octocat"), "octocat");
assert.equal(parseGithubUsername(""), null);
assert.equal(parseGithubUsername("https://gitlab.com/foo"), null); // not github
assert.equal(parseGithubUsername("-bad"), null); // can't start with hyphen

console.log("github.test.ts ✓");
