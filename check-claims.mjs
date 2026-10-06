/**
 * check-claims.mjs — the test counts this page advertises must be the ones the
 * projects actually produce.
 *
 * Why: this page published "67 offline tests" for colony-kernel and "78 tests"
 * for agent-handoff while the first ran 117 and the second 82. The claims were
 * true once and nothing noticed when they stopped being true. A sales page is
 * the worst place for a number nobody measures — it is the number a buyer
 * trusts, and it is a copy of a fact owned by another repository.
 *
 * So this gate measures the sibling projects the same way the monorepo pattern
 * already does (colony-monitor requires ../colony-kernel; this repo requires
 * ../colony-kernel and ../agent-handoff), and refuses any line that states a
 * count its project does not produce. Missing sibling, unreadable output, or an
 * unmeasurable suite exits 2 — never a silent pass, because a gate that skips
 * is a gate that proves nothing.
 *
 * Exit codes: 0 every count matches · 1 a stated count is wrong ·
 * 2 a count could not be measured.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));

/** Which project owns a count, and how to measure it. */
const PROJECTS = {
  "colony-kernel": {
    dir: join(root, "..", "colony-kernel"),
    measure() {
      const out = join(root, ".claims-vitest.json");
      const run = spawnSync("npx", ["vitest", "run", "--reporter=json", `--outputFile=${out}`], {
        cwd: this.dir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      });
      if (run.status !== 0) {
        process.stderr.write(run.stderr || "");
        return null;
      }
      const n = JSON.parse(readFileSync(out, "utf8")).numTotalTests;
      return Number.isInteger(n) ? n : null;
    }
  },
  "agent-handoff": {
    dir: join(root, "..", "agent-handoff"),
    measure() {
      const run = spawnSync("python3", ["-m", "pytest", "-q", "--collect-only"], {
        cwd: this.dir,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
      });
      const found = `${run.stdout || ""}${run.stderr || ""}`.match(/(\d+)\s+tests? collected/);
      return found ? Number(found[1]) : null;
    }
  }
};

const SURFACES = ["index.html"];

// "117 offline tests", "82 tests" — a count a reader meets as a test count.
// Inline markup may sit between the number and the word.
const ADJECTIVES = ["offline", "deterministic", "passing", "unit"];
const gap = `(?:[\\s]|&[a-z]+;|<\\/?[a-z]+>|[*_—·•,])*(?:\\/\\s*\\d+)?\\s*(?:(?:${ADJECTIVES.join("|")})\\s+){0,3}`;
const CLAIM = new RegExp(`\\b(\\d+)(?=${gap}tests\\b)`, "g");

const measured = {};
for (const [name, project] of Object.entries(PROJECTS)) {
  if (!existsSync(project.dir)) {
    console.error(`check-claims: ${name} not found at ${project.dir} — clone it as a sibling.`);
    process.exit(2);
  }
  const count = project.measure();
  if (count === null) {
    console.error(`check-claims: could not measure ${name}'s test count — refusing to pass.`);
    process.exit(2);
  }
  measured[name] = count;
}

const stale = [];
for (const file of SURFACES) {
  const path = join(root, file);
  if (!existsSync(path)) {
    stale.push(`${file}: missing`);
    continue;
  }
  readFileSync(path, "utf8")
    .split("\n")
    .forEach((line, i) => {
      // A line that names a project must not carry a count that project
      // disagrees with. A line naming none is left to the numbers below.
      const owner = Object.keys(PROJECTS).find((name) => line.includes(name));
      const expected = owner ? measured[owner] : null;
      for (const [, count] of line.matchAll(CLAIM)) {
        if (expected !== null && Number(count) !== expected) {
          stale.push(`${file}:${i + 1} claims ${count} tests for ${owner}, which produces ${expected}`);
        }
      }
    });
}

if (stale.length > 0) {
  console.error(`check-claims: FAILED — ${stale.length} wrong claim(s):`);
  for (const line of stale) console.error(`  ${line}`);
  console.error("Fix the claim or the test; never lower this gate to make it pass.");
  process.exit(1);
}

const summary = Object.entries(measured)
  .map(([name, count]) => `${name} ${count}`)
  .join(", ");
console.log(`claims: OK (${summary})`);