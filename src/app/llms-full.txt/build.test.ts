import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { EVAL_RESULTS, PRINTED, UNIT_TESTS, VERIFIED_ON } from "@/app/for-judges/evidence";
import { AUDIENCES, CRITERIA, GUARDRAILS, LIMITS, PAINS, ROUTES, SUMMARY } from "@/app/for-judges/facts";
import { buildLlmsFullTxt } from "./build";

const ORIGIN = "https://workproof.example.org/";
const REPO = "https://git.example.org/workproof/";

describe("buildLlmsFullTxt", () => {
  const text = buildLlmsFullTxt(ORIGIN, REPO);
  const lines = text.split("\n");

  it("opens like /llms.txt: H1, then the quoted summary", () => {
    expect(lines[0]).toBe("# WorkProof");
    expect(lines[2]).toBe(`> ${SUMMARY}`);
    expect(text).toContain("- Live demo: https://workproof.example.org\n");
    expect(text).toContain("- Source code: https://git.example.org/workproof (MIT licence)");
  });

  it("has every section in a fixed order, limits last", () => {
    expect(lines.filter((l) => l.startsWith("## "))).toEqual([
      "## Who it is for",
      "## Key facts",
      "## The challenge in the City of Espoo's words",
      "## How WorkProof meets each judging criterion",
      "## How it answers each problem in the brief",
      "## Shaped at the Espoo booth",
      "## What the AI does and never does",
      "## Guardrails",
      "## Architecture",
      "## Data and privacy",
      `## Evidence, checked on ${VERIFIED_ON}`,
      "## How to verify",
      "## Pages",
      "## Limits",
    ]);
  });

  it("carries every criterion with its weight, every pain, guardrail, audience and limit", () => {
    for (const c of CRITERIA) expect(text).toContain(`| ${c.criterion} (${c.weight}) | `);
    for (const p of PAINS) expect(text).toContain(p.pain);
    for (const g of GUARDRAILS) expect(text).toContain(g.rule);
    for (const a of AUDIENCES) expect(text).toContain(a.who);
    for (const limit of LIMITS) expect(text).toContain(`- ${limit}`);
  });

  it("quotes the measured numbers exactly as the evidence file holds them", () => {
    expect(text).toContain(`${UNIT_TESTS.passed} of ${UNIT_TESTS.tests} unit tests pass, in ${UNIT_TESTS.files} files`);
    for (const row of EVAL_RESULTS) expect(text).toContain(row.result.replaceAll("|", "\\|"));
    for (const result of Object.values(PRINTED)) expect(text).toContain(result.replaceAll("|", "\\|"));
  });

  it("links every page on the origin and code on the repository", () => {
    for (const r of ROUTES) expect(text).toContain(`](https://workproof.example.org${r.path})`);
    expect(text).toContain("(https://git.example.org/workproof/tree/main/src/lib/blind)");
  });

  it("keeps every table row on one line with the column count of its header", () => {
    let columns = 0;
    for (const line of lines) {
      if (!line.startsWith("|")) {
        columns = 0;
        continue;
      }
      const count = line.replaceAll("\\|", "").split("|").length - 2;
      if (columns === 0) columns = count;
      expect(count, line).toBe(columns);
    }
  });

  it("is built from the same facts the /for-judges page renders", () => {
    const page = readFileSync(join(process.cwd(), "src/app/for-judges/page.tsx"), "utf8");
    for (const name of ["AUDIENCES", "CRITERIA", "PAINS", "GUARDRAILS", "AI_DOES", "AI_NEVER", "PRIVACY", "SYNTHETIC", "EVAL_RESULTS", "VERIFY_COMMANDS", "LIMITS", "BOOTH", "BRIEF_QUOTES", "ARCHITECTURE_SUMMARY"]) {
      expect(page, name).toMatch(new RegExp(`\\b${name}\\b`));
    }
  });

  it("carries no instructions to a model", () => {
    expect(text).not.toMatch(/ignore (all|previous)|you are an? |rate this|score this|AI reviewers?/i);
  });
});
