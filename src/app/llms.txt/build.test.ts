import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { VERIFIED_ON } from "@/app/for-judges/evidence";
import { ROUTES, SUMMARY } from "@/app/for-judges/facts";
import { buildLlmsTxt, EVIDENCE_IN_CODE } from "./build";

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt("https://workprint.example.org/");

  it("follows the llms.txt shape: H1, quoted first paragraph, dated numbers, H2 link lists, limits last", () => {
    const lines = text.split("\n");
    expect(lines[0]).toBe("# Workprint");
    expect(lines[2].startsWith("> ")).toBe(true);
    expect(lines[2]).toContain(SUMMARY);
    const headings = lines.filter((l) => l.startsWith("## "));
    expect(headings).toEqual([`## Numbers, checked on ${VERIFIED_ON}`, "## Start here", "## Product", "## Evidence in code", "## Code map", "## Limits"]);
    expect(text).toContain("`npm test`: ");
    expect(text).toContain("`npm run eval`: ");
  });

  it("links every product route on the given origin", () => {
    for (const route of ROUTES.filter((r) => r.path !== "/for-judges")) {
      expect(text).toContain(`](https://workprint.example.org${route.path})`);
    }
    expect(text).toContain("(https://workprint.example.org/for-judges)");
  });

  it("links code to the repository when one is given, and as plain paths otherwise", () => {
    expect(text).toContain("- [src/lib/blind](src/lib/blind): ");
    expect(buildLlmsTxt("https://a.example.org", "https://git.example.org/workprint")).toContain("(https://git.example.org/workprint/tree/main/src/lib/blind)");
  });

  it("points only at evidence paths that exist", () => {
    expect(EVIDENCE_IN_CODE.filter((c) => !existsSync(join(process.cwd(), c.path)))).toEqual([]);
  });

  it("carries no instructions to a model and no sentence addressed to an AI reviewer", () => {
    expect(text).not.toMatch(/ignore (all|previous)|you are an? |rate this|score this|AI reviewers?/i);
  });
});
