import { EVAL_RESULTS, EVAL_TESTS, FIGURES, UNIT_TESTS, VERIFIED_ON } from "@/app/for-judges/evidence";
import {
  AI_DOES,
  AI_NEVER,
  AUDIENCES,
  BRIEF_QUOTES,
  CRITERIA,
  DEMO_EVENT,
  ENTRY,
  LIMITS,
  NAME,
  ONE_LINE,
  PAINS,
  RATING,
  SUMMARY,
} from "@/app/for-judges/facts";

/**
 * /submission.json: the hackathon entry as data, for a reader that wants fields, not prose.
 * Built from the same typed facts and measured figures as /for-judges and /llms.txt, so its
 * numbers never drift from the last `npm run evidence` run.
 */
export function buildSubmission(origin: string, repo: string) {
  const site = origin.replace(/\/$/, "");
  const code = repo.replace(/\/$/, "");
  const link = (path: string) => `${site}${path}`;
  return {
    name: NAME,
    tagline: ONE_LINE,
    summary: SUMMARY,
    challenge: {
      event: ENTRY.event,
      dates: { start: ENTRY.eventStart, end: ENTRY.eventEnd },
      title: ENTRY.challenge,
      by: ENTRY.challengeBy,
      byUrl: ENTRY.challengeByUrl,
      briefQuotes: BRIEF_QUOTES,
    },
    problem:
      "AI-written CVs and AI-assisted hiring make it hard for companies and talent at City of Espoo recruitment events to see real capability. The brief asks for a stronger signal, less noise, and no automated decisions about people.",
    problemsInTheBrief: PAINS.map((p) => ({ problem: p.pain, answer: p.built, code: p.code, evidence: p.evidence })),
    solution:
      "A company posts a short real task. A person does it and writes how they think. A named person at the company reads the work with known personal details removed, gives 1 to 5 points per core skill with a written reason, and decides. The name is shown only after the person accepts. The city sees outcomes, from challenge taken to hired.",
    views: AUDIENCES.map((a) => ({ view: a.mode, for: a.who, route: a.path, url: link(a.path), does: a.does })),
    rating: RATING,
    ai: {
      rule: "The AI never scores, never ranks and never decides. A named person decides, with a written reason.",
      does: AI_DOES,
      never: AI_NEVER,
    },
    judgingCriteria: CRITERIA.map((c) => ({
      criterion: c.criterion,
      weight: c.weight,
      built: c.built,
      routes: c.routes,
      code: c.code,
      evidence: c.evidence,
    })),
    evidence: {
      checkedOn: VERIFIED_ON,
      reproduce: [UNIT_TESTS.command, EVAL_TESTS.command],
      unitTests: { files: UNIT_TESTS.files, tests: UNIT_TESTS.tests, passed: UNIT_TESTS.passed },
      evalTests: { files: EVAL_TESTS.files, tests: EVAL_TESTS.tests, passed: EVAL_TESTS.passed },
      figures: {
        plantedIdentityDetailsReachingAReviewer: FIGURES.plantedReached,
        plantedJudgingPhrasesRejected: FIGURES.judgingRejected,
        guardedAiTextFieldsPassing: FIGURES.guardedTexts,
        automatedDecisions: FIGURES.automatedDecisions,
        identityFormsHiddenHarderSet: FIGURES.secondSetHidden,
      },
      results: EVAL_RESULTS,
    },
    demoEvent: { ...DEMO_EVENT, data: "Synthetic: every person and company is invented." },
    links: {
      live: site,
      code,
      brief: link("/brief"),
      briefPdf: link("/brief.pdf"),
      forJudges: link("/for-judges"),
      llmsTxt: link("/llms.txt"),
      llmsFullTxt: link("/llms-full.txt"),
      submissionJson: link("/submission.json"),
      howItWorks: link("/how-it-works"),
      walkthrough: link("/?tour=1"),
      agents: `${code}/blob/main/AGENTS.md`,
    },
    limits: LIMITS,
    license: "MIT",
    firstCommit: ENTRY.firstCommit,
  };
}
