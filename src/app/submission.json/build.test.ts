import { describe, expect, it } from "vitest";
import { EVAL_RESULTS, EVAL_TESTS, FIGURES, UNIT_TESTS, VERIFIED_ON } from "@/app/for-judges/evidence";
import { AUDIENCES, LIMITS, SUMMARY } from "@/app/for-judges/facts";
import { buildSubmission } from "./build";
import { GET } from "./route";

describe("/submission.json", () => {
  it("parses as JSON and names the entry, the challenge and the three views", async () => {
    const data = await GET().json();
    expect(data.name).toBe("WorkProof");
    expect(data.summary).toBe(SUMMARY);
    expect(data.challenge).toMatchObject({ by: "City of Espoo", title: "Rethinking Recruitment", event: "Junction 2026" });
    expect(data.views.map((v: { view: string }) => v.view)).toEqual(["Job seeker", "Company", "City of Espoo"]);
    expect(data.views.map((v: { route: string }) => v.route)).toEqual(AUDIENCES.map((a) => a.path));
    expect(data.ai.rule).toMatch(/never scores, never ranks and never decides/);
    expect(data.limits).toEqual([...LIMITS]);
  });

  it("carries the same numbers as evidence.ts", async () => {
    const { evidence } = await GET().json();
    expect(evidence.checkedOn).toBe(VERIFIED_ON);
    expect(evidence.unitTests).toEqual({ files: UNIT_TESTS.files, tests: UNIT_TESTS.tests, passed: UNIT_TESTS.passed });
    expect(evidence.evalTests).toEqual({ files: EVAL_TESTS.files, tests: EVAL_TESTS.tests, passed: EVAL_TESTS.passed });
    expect(evidence.figures).toEqual({
      plantedIdentityDetailsReachingAReviewer: FIGURES.plantedReached,
      plantedJudgingPhrasesRejected: FIGURES.judgingRejected,
      guardedAiTextFieldsPassing: FIGURES.guardedTexts,
      automatedDecisions: FIGURES.automatedDecisions,
      identityFormsHiddenHarderSet: FIGURES.secondSetHidden,
    });
    expect(evidence.results).toEqual(EVAL_RESULTS);
  });

  it("links the live site, the code, the explainer and the text maps on the given origin", () => {
    const { links } = buildSubmission("https://workproof.example.org/", "https://git.example.org/workproof/");
    expect(links).toMatchObject({
      live: "https://workproof.example.org",
      code: "https://git.example.org/workproof",
      brief: "https://workproof.example.org/brief",
      briefPdf: "https://workproof.example.org/brief.pdf",
      llmsTxt: "https://workproof.example.org/llms.txt",
      forJudges: "https://workproof.example.org/for-judges",
      submissionJson: "https://workproof.example.org/submission.json",
    });
  });
});
