import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AUDIENCES, CHECK_PATH, GUARDRAILS } from "./facts";

const ROOT = process.cwd();

/** A repository path as the documents write it: src/…, evals/…, docs/…, scripts/… or public/…, with [id] segments. */
const PATH = /(?<![\w/.-])((?:src|evals|docs|scripts|public)\/(?:[\w.\-/()]|\[[\w.]+\])+)/g;

/** Every path a document names, without globs and without a full stop that ends a sentence. */
function pathsIn(file: string): string[] {
  const text = readFileSync(join(ROOT, file), "utf8");
  return [...text.matchAll(PATH)].map((m) => m[1].replace(/[.)]+$/, "")).filter((p) => !p.includes("*"));
}

const DOCUMENTS = ["README.md", "AGENTS.md", ...readdirSync(join(ROOT, "docs")).filter((f) => f.endsWith(".md")).map((f) => `docs/${f}`)];

describe("paths named in the documents", () => {
  it.each(DOCUMENTS)("%s names only paths that exist", (file) => {
    expect(pathsIn(file).filter((p) => !existsSync(join(ROOT, p)))).toEqual([]);
  });

  it("finds paths at all, so a broken pattern cannot pass silently", () => {
    expect(pathsIn("README.md").length).toBeGreaterThan(20);
  });

  it("names only guardrail files that exist", () => {
    const paths = GUARDRAILS.flatMap((g) => [...g.enforced, ...g.checked]);
    expect(paths.filter((p) => !existsSync(join(ROOT, p)))).toEqual([]);
  });

  it("names only pages that exist for the check path and the audiences", () => {
    const routes = [...CHECK_PATH, ...AUDIENCES].map((r) => r.path);
    expect(routes.filter((r) => !existsSync(join(ROOT, "src/app", r, "page.tsx")))).toEqual([]);
  });
});
