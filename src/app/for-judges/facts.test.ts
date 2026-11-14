import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { ROLES } from "@/lib/ai/scripted/roles";
import { EVAL_RESULTS, EVAL_TESTS, PRINTED, UNIT_TESTS, VERIFIED_ON } from "./evidence";
import { CODE_MAP, CRITERIA, PAINS, ROUTES } from "./facts";

const ROOT = process.cwd();

/** A page route exists when src/app holds a page for it, inside route groups or not. */
function pageExists(route: string): boolean {
  const segments = route.split("/").filter(Boolean);
  const search = (dir: string, rest: string[]): boolean => {
    if (!existsSync(dir)) return false;
    if (rest.length === 0) {
      if (existsSync(join(dir, "page.tsx"))) return true;
    }
    return readdirSync(dir, { withFileTypes: true }).some((entry) => {
      if (!entry.isDirectory()) return false;
      if (/^\(.+\)$/.test(entry.name)) return search(join(dir, entry.name), rest);
      return rest.length > 0 && entry.name === rest[0] && search(join(dir, entry.name), rest.slice(1));
    });
  };
  return search(join(ROOT, "src/app"), segments);
}

describe("for-judges facts", () => {
  it("lists only routes that have a page", () => {
    const routes = new Set([...ROUTES.map((r) => r.path), ...CRITERIA.flatMap((c) => c.routes)]);
    expect([...routes].filter((r) => !pageExists(r))).toEqual([]);
  });

  it("points only at code paths that exist", () => {
    const paths = new Set([
      ...CODE_MAP.map((c) => c.path),
      ...CRITERIA.flatMap((c) => c.code),
      ...PAINS.flatMap((p) => p.code),
      ...EVAL_RESULTS.map((e) => e.file),
    ]);
    expect([...paths].filter((p) => !existsSync(join(ROOT, p)))).toEqual([]);
  });

  it("keeps the test totals consistent", () => {
    for (const run of [UNIT_TESTS, EVAL_TESTS]) {
      expect(run.passed).toBeLessThanOrEqual(run.tests);
      expect(run.files).toBeGreaterThan(0);
    }
  });

  it("is quoted with the same figures in README.md and docs/evals.md", () => {
    for (const file of ["README.md", "docs/evals.md"]) {
      const text = readFileSync(join(ROOT, file), "utf8");
      const block = text.slice(text.indexOf("<!-- evidence:start -->"), text.indexOf("<!-- evidence:end -->"));
      expect(block, file).toContain(`Measured on ${VERIFIED_ON}`);
      expect(block, file).toContain(`${UNIT_TESTS.passed} of ${UNIT_TESTS.tests} unit tests pass, in ${UNIT_TESTS.files} files`);
      expect(block, file).toContain(`${EVAL_TESTS.passed} of ${EVAL_TESTS.tests} eval tests pass, in ${EVAL_TESTS.files} files`);
    }
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    for (const row of EVAL_RESULTS) expect(readme).toContain(row.result.replaceAll("|", "\\|"));
    const evals = readFileSync(join(ROOT, "docs/evals.md"), "utf8");
    for (const result of Object.values(PRINTED)) expect(evals).toContain(result.replaceAll("|", "\\|"));
  });

  it("states the number of job families the task library really has", () => {
    const readme = readFileSync(join(ROOT, "README.md"), "utf8");
    expect(readme).toContain(`${ROLES.length} professions have their own task today`);
  });
});
