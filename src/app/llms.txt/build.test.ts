import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VERIFIED_ON } from "@/app/for-judges/evidence";
import { ROUTES, SUMMARY } from "@/app/for-judges/facts";
import { buildLlmsTxt, EVIDENCE_IN_CODE, REPO_DOCS } from "./build";

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt("https://workproof.example.org/");

  it("follows the llms.txt shape: H1, quoted first paragraph, dated numbers, H2 link lists, limits, then the optional list", () => {
    const lines = text.split("\n");
    expect(lines[0]).toBe("# WorkProof");
    expect(lines[2].startsWith("> ")).toBe(true);
    expect(lines[2]).toContain(SUMMARY);
    const headings = lines.filter((l) => l.startsWith("## "));
    expect(headings).toEqual([`## Numbers, checked on ${VERIFIED_ON}`, "## Start here", "## Product", "## Evidence in code", "## Code map", "## Limits", "## Optional"]);
    expect(text).toContain("`npm test`: ");
    expect(text).toContain("`npm run eval`: ");
  });

  it("links every product route on the given origin", () => {
    for (const route of ROUTES.filter((r) => r.path !== "/for-judges")) {
      expect(text).toContain(`](https://workproof.example.org${route.path})`);
    }
    expect(text).toContain("(https://workproof.example.org/for-judges)");
  });

  it("links code to the repository when one is given, and as plain paths otherwise", () => {
    expect(text).toContain("- [src/lib/blind](src/lib/blind): ");
    expect(buildLlmsTxt("https://a.example.org", "https://git.example.org/workproof")).toContain("(https://git.example.org/workproof/tree/main/src/lib/blind)");
  });

  it("points only at evidence paths and documents that exist", () => {
    expect([...EVIDENCE_IN_CODE, ...REPO_DOCS].filter((c) => !existsSync(join(process.cwd(), c.path)))).toEqual([]);
  });

  it("links the full text first and the repository documents last", () => {
    expect(text).toContain("- [Full text](https://workproof.example.org/llms-full.txt): ");
    expect(text).toContain("- [Briefing for agents](https://workproof.example.org/for-agents.txt): ");
    const withRepo = buildLlmsTxt("https://a.example.org", "https://github.com/felixwickholm/workproof");
    expect(withRepo).toContain("- [Source code](https://github.com/felixwickholm/workproof): ");
    expect(withRepo).toContain("(https://github.com/felixwickholm/workproof/tree/main/AGENTS.md)");
  });

  it("carries no instructions to a model and no sentence addressed to an AI reviewer", () => {
    expect(text).not.toMatch(/ignore (all|previous)|you are an? |rate this|score this|AI reviewers?/i);
  });
});
