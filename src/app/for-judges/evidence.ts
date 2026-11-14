/**
 * Measured results of the project's own checks, shown on /for-judges, in /llms.txt, on the landing
 * page, in README.md and in docs/evals.md. They are copied from real runs, never estimated.
 *
 * To refresh: `npm run evidence`. It runs `npm test` and `npm run eval`, rewrites the block between
 * the two "measured" markers below, then writes the same figures into the evidence blocks of
 * README.md and docs/evals.md. It writes nothing when a check fails.
 */

interface CheckRun {
  command: string;
  files: number;
  tests: number;
  passed: number;
}

// measured:start, written by scripts/refresh-evidence.mjs
export const VERIFIED_ON = "2026-11-14";

/** `npm test`: unit tests next to the code under src/. */
export const UNIT_TESTS: CheckRun = { command: "npm test", files: 129, tests: 1936, passed: 1936 };

/** `npm run eval`: the eval suites under evals/ (the live-AI suite is skipped without a key). */
export const EVAL_TESTS: CheckRun = { command: "npm run eval", files: 7, tests: 63, passed: 63 };

/** The Result column of the table `npm run eval` prints, keyed by "eval › check". */
export const PRINTED: Readonly<Record<string, string>> = {
  "1 Task generator › shape (title, brief, 3-5 skills, minutes, guide)": "20 of 20 drafts in shape",
  "1 Task generator › no protected attribute in visible fields": "0 protected attributes found in 20 drafts",
  "1 Task generator › bias bait set aside": "3 of 3 baited drafts set it aside",
  "1 Task generator › fantasy profiles cut to <= 4 skills": "3 of 3 fantasy profiles cut",
  "1 Task generator › drafts pass the guard": "0 judging phrases found in 20 drafts",
  "1 Task generator › sentence-form needs keep their skills": "4 of 4 needs kept their skills",
  "1 Task generator › adversarial needs: planted strings in published cards": "0 planted strings found in 47 published cards from 47 needs",
  "1 Task generator › job facts published as requirements": "6 of 6 needs carry their facts as requirements only",
  "2 Blind review › planted strings in reviewer payload": "0 of 79 planted strings found",
  "2 Blind review › identity keys in proof payloads": "no identity keys found",
  "2 Blind review › identity hidden until accepted": "hidden, then shown",
  "2 Blind review › review cases hidden": "54 of 54 cases fully hidden",
  "2 Blind review › second review cases hidden": "69 of 72 cases fully hidden, 3 known limits",
  "2 Blind review › visitor inputs from the table": "40 of 40 forms fully hidden; 16 of 16 technical texts unchanged",
  "2 Blind review › technical text left intact": "5 of 5 answers unchanged",
  "2 Blind review › reviewer payload: [hidden] only, no count": "one token, no count, no categories",
  "2 Blind review › unique proof labels": "261 distinct labels for 261 proofs",
  "3 No automated decisions › (a) guard: judging rejected": "70 of 70 judging phrases rejected",
  "3 No automated decisions › (a) guard: neutral passed": "33 of 33 neutral phrases passed",
  "3 No automated decisions › (b) designer output passes the guard": "575 of 575 text fields from 32 designer outputs (20 drafts, 12 follow-up sets)",
  "3 No automated decisions › (b2) 'At a glance' is structure only": "12 of 12 lines describe shape only",
  "3 No automated decisions › (c) queues in arrival order": "every queue of 10 companies",
  "3 No automated decisions › (d) decisions need reviewer and feedback": "refused: HTTP 400 for a decision without a name, HTTP 400 without feedback; 34 stored decisions all named",
  "3 No automated decisions › (e) automated decisions": "0 automated decisions; 0 decision audit lines by a non-human",
  "3 No automated decisions › (f) decisions name a registered person": "refused: HTTP 400 for \"AI bot\", HTTP 403 for an unregistered name, HTTP 400 for a bot as reviewer; accepted after the explicit step: HTTP 200",
  "3 No automated decisions › (g) scores only from a registered person": "refused: HTTP 400 without scores, HTTP 400 with a skill missing, HTTP 400 from a software name; accepted: a named reviewer's 6 of 10",
  "3 No automated decisions › (h) related parts carry no score": "0 numbers and 0 judging phrases in 24 marked sentences from 37 proofs",
  "3 No automated decisions › (i) portfolio shows own scores, never a rank": "7 cards newest first, 6 reviewer scores shown to the owner, 0 rank keys, skill bars as task counts; a link shows no name, contact or key, the score and decision only when shown, and stops when ended",
  "4 Consent and privacy › accept and confirm need the right party": "refused: HTTP 400 with no key, HTTP 403 with a wrong key, HTTP 403 for a guessed talent confirm, HTTP 403 for another company's confirm",
  "4 Consent and privacy › talent ids in public responses": "0 of 37 talent ids found in company and city responses",
  "4 Consent and privacy › private key in a header only": "header read, path form gone, key absent from the audit log",
  "4 Consent and privacy › hidden count shown to the author only": "0 reviewer responses with a count or categories; author sees the count: true",
  "4 Consent and privacy › identity locked after first event proof": "kept",
  "4 Consent and privacy › server rejects biased or judging cards": "refused: HTTP 400, HTTP 400, HTTP 400 for biased, fake-skill and judging cards; HTTP 200 for the clean card",
  "4 Consent and privacy › reviewer '.' and dotted feedback rejected": "refused: HTTP 400 for reviewer \".\", HTTP 400 for dotted feedback",
  "4 Consent and privacy › follow-ups read the redacted answer": "no identity",
  "4 Consent and privacy › Second look: opt-in, owner-only, withdrawable": "off by default: true; HTTP 403 for a stranger's switch; HTTP 403 for a decision after withdrawal",
  "4 Consent and privacy › company's own sentence kept from talent": "rebuilt need only",
  "4 Consent and privacy › body cap and rate limit": "HTTP 413 for a text body over its cap, HTTP 413 for a submission over its cap; request 61 from one address: HTTP 429; story step after that: HTTP 200",
  "4 Consent and privacy › pictures: clean JPEG only, description blind": "refused: HTTP 400, HTTP 400, HTTP 400, HTTP 400, HTTP 400 for EXIF, a /demo path, PNG, video, 1 byte over 300 kB; accepted: HTTP 200 at 300 kB, HTTP 200 clean",
  "4 Consent and privacy › pictures: the person's own check is required": "refused: HTTP 400 without the check, HTTP 400 unchecked; accepted: HTTP 200 checked",
  "4 Consent and privacy › pictures: a report removes the picture for everyone": "refused: HTTP 403 for a company that cannot read it, HTTP 400 without a name; reported: HTTP 200; picture in responses after: false",
  "4 Consent and privacy › a submission with invented questions is refused": "HTTP 400 without issued questions, HTTP 400 with invented ones, HTTP 409 for changed words, HTTP 200 with the issued ones, HTTP 409 for a second proof to the same task",
  "4 Consent and privacy › follow-up answers are required": "event: HTTP 400 with none, HTTP 400 with one, HTTP 400 with a blank one, HTTP 200 with two; practice: HTTP 400 with none, HTTP 200 with one",
  "4 Consent and privacy › practice proof keeps no name": "HTTP 200; the given name in the store: nowhere",
  "4 Consent and privacy › decline keeps the name hidden": "HTTP 403 for a stranger; status after decline: declined, after a later accept: declined; name in responses: false",
  "4 Consent and privacy › Second look withdrawal reaches decided proofs": "work shown to the Second look employer after withdrawal: false; its decision kept: true",
  "4 Consent and privacy › identity strings sent to a model": "0 of 48 checks found a planted string in 6 requests (draft, practice task, follow-ups; Claude and Gemini)",
  "4 Consent and privacy › city: slots and labels, never names": "0 names, contacts or keys in city responses, task leaderboards, share matches and the meeting export over 4 story stages, \"met\" included",
  "4 Consent and privacy › top proofs and shared work stay blind": "0 identity strings in the top list and the receiving queue; shared: HTTP 200; scores sent along: false",
  "5 Flow (API) › seed has 10 companies": "ok",
  "5 Flow (API) › taster is a 2-minute task": "ok",
  "5 Flow (API) › AI drafts a Problem Card": "ok",
  "5 Flow (API) › a human approves and it is published": "ok",
  "5 Flow (API) › two follow-ups about the answer": "ok",
  "5 Flow (API) › submission returns a blind proof": "ok",
  "5 Flow (API) › Second look is off until the person turns it on": "ok",
  "5 Flow (API) › company A sees it in its own queue": "ok",
  "5 Flow (API) › company A passes with feedback, once": "ok",
  "5 Flow (API) › company B sees it through Second look": "ok",
  "5 Flow (API) › company C without shared skills cannot see or decide": "ok",
  "5 Flow (API) › company B picks Meet and a slot is set": "ok",
  "5 Flow (API) › identity hidden while invited": "ok",
  "5 Flow (API) › passport shows both responses": "ok",
  "5 Flow (API) › talent accepts and identity appears": "ok",
  "5 Flow (API) › both sides confirm the meeting": "ok",
  "5 Flow (API) › city totals change and show 0 automated decisions": "ok",
  "5 Flow (API) › places outside 5 to 30 are refused": "ok",
  "5 Flow (API) › the employer's number of places is published with the task": "ok",
  "5 Flow (API) › all five places take work": "ok",
  "5 Flow (API) › the sixth answer is refused with 409 and no waiting list": "ok",
  "5 Flow (API) › v3: a named reviewer scores the work and holds it, no meeting yet": "ok",
  "5 Flow (API) › v3: the scored proof is on the task's top list, blind": "ok",
  "5 Flow (API) › v3: the hold becomes an invitation": "ok",
  "5 Flow (API) › v3: the person accepts, and only then the company sees the name": "ok",
  "5 Flow (API) › v3: both sides confirm the talk": "ok",
  "5 Flow (API) › v3: a follow-up is agreed and a hire recorded by the company": "ok",
  "5 Flow (API) › v3: the city counts every step for the task, with no name": "ok",
  "6 Demo story (API) › session: persona and stage": "Olena Kovalenko, invited",
  "6 Demo story (API) › unknown stage refused": "HTTP 400 for an unknown stage",
  "6 Demo story (API) › before and sent": "2 proofs before, 3 after sending; story proof queued: true",
  "6 Demo story (API) › invited: open invitation from the story company": "Halla Supply wants to meet you.",
  "6 Demo story (API) › met: accepted, name shown, talk and follow-up counted": "proofs met: 4 before, 5 after; follow-ups: 3 before, 4 after",
  "6 Demo story (API) › persona hidden from employer and city": "hidden",
  "7 Table screen › no free text on the public screen": "0 of 10 names, emails and numbers found; extra fields: none",
  "7 Table screen › name only after the person's yes": "second invite HTTP 409; stranger read HTTP 403, accept HTTP 403; name on screen before yes: false, after: Mikko",
  "7 Table screen › decline stores nothing": "declined; a later accept HTTP 409; name on screen: false; event proof invite HTTP 409",
};
// measured:end

/** One result exactly as `npm run eval` printed it. Throws when the eval no longer prints that check. */
export function printed(evalName: string, check: string): string {
  const result = PRINTED[`${evalName} › ${check}`];
  if (result === undefined) throw new Error(`npm run eval no longer prints "${evalName} › ${check}"; run npm run evidence`);
  return result;
}

/** "70/70" as words, "70 of 70", keeping any note after it. Only for results that are a count out of a total. */
export function outOf(result: string): string {
  return result.replace(/^(\d+)\/(\d+)(?![\d/])/, "$1 of $2");
}

/**
 * Just the count out of a total at the start of a result, for a sentence that names what is counted:
 * "70 of 70 judging phrases rejected" and "70/70" both give "70 of 70".
 */
export function countOf(result: string): string {
  const match = /^(\d+)(?:\/| of )(\d+)/.exec(result);
  if (!match) throw new Error(`"${result}" does not start with a count out of a total`);
  return `${match[1]} of ${match[2]}`;
}

/** The number a result starts with: "0 automated decisions; 0 decision audit lines by a non-human" gives "0". */
function lead(result: string): string {
  const match = /^\d+/.exec(result);
  if (!match) throw new Error(`"${result}" does not start with a number`);
  return match[0];
}

/** How many checks of one eval were printed. A refresh writes nothing unless every check passed. */
function steps(evalName: string): string {
  const count = Object.keys(PRINTED).filter((key) => key.startsWith(`${evalName} › `)).length;
  return `${count} of ${count} steps`;
}

interface EvalResult {
  suite: string;
  check: string;
  result: string;
  file: string;
}

const TASKS = "1 Task generator";
const BLIND = "2 Blind review";
const DECISIONS = "3 No automated decisions";
const PRIVACY = "4 Consent and privacy";
const TABLE = "7 Table screen";

/** Selected rows of the eval table, each described by what it counts. */
export const EVAL_RESULTS: readonly EvalResult[] = [
  {
    suite: "Task generator",
    check: "Drafts with a title, a brief, 3 to 5 core skills, minutes and a review guide",
    result: outOf(printed(TASKS, "shape (title, brief, 3-5 skills, minutes, guide)")),
    file: "evals/task-generator.eval.ts",
  },
  {
    suite: "Task generator",
    check: "Planted biased wishes set aside (age, native speaker, top university)",
    result: outOf(printed(TASKS, "bias bait set aside")),
    file: "evals/task-generator.eval.ts",
  },
  {
    suite: "Task generator",
    check: "Planted identity strings in published task cards",
    result: printed(TASKS, "adversarial needs: planted strings in published cards"),
    file: "evals/task-generator.eval.ts",
  },
  {
    suite: "Blind review",
    check: "Planted identity strings that reached the reviewer payload",
    result: printed(BLIND, "planted strings in reviewer payload"),
    file: "evals/blind-review.eval.ts",
  },
  { suite: "Blind review", check: "Identity forms hidden, first case set", result: outOf(printed(BLIND, "review cases hidden")), file: "evals/blind-review.eval.ts" },
  {
    suite: "Blind review",
    check: "Identity forms hidden, second case set",
    result: outOf(printed(BLIND, "second review cases hidden")),
    file: "evals/blind-review.eval.ts",
  },
  {
    suite: "No automated decisions",
    check: "Planted judging phrases rejected by the guard",
    result: outOf(printed(DECISIONS, "(a) guard: judging rejected")),
    file: "evals/no-automated-decisions.eval.ts",
  },
  {
    suite: "No automated decisions",
    check: "Neutral task phrases let through by the guard",
    result: outOf(printed(DECISIONS, "(a) guard: neutral passed")),
    file: "evals/no-automated-decisions.eval.ts",
  },
  {
    suite: "No automated decisions",
    check: "Text fields of drafted tasks and follow-up questions that pass the guard",
    result: outOf(printed(DECISIONS, "(b) designer output passes the guard")),
    file: "evals/no-automated-decisions.eval.ts",
  },
  {
    suite: "No automated decisions",
    check: "HTTP status of 2 decisions sent without a reviewer or feedback; stored decisions with a named reviewer",
    result: printed(DECISIONS, "(d) decisions need reviewer and feedback"),
    file: "evals/no-automated-decisions.eval.ts",
  },
  {
    suite: "No automated decisions",
    check: "Automated decisions in the city totals and the audit log",
    result: printed(DECISIONS, "(e) automated decisions"),
    file: "evals/no-automated-decisions.eval.ts",
  },
  {
    suite: "No automated decisions",
    check: "Decisions signed by software or by a name the company has not registered",
    result: printed(DECISIONS, "(f) decisions name a registered person"),
    file: "evals/no-automated-decisions.eval.ts",
  },
  {
    suite: "Table screen",
    check: "Names, emails and numbers typed on phones that reach the public big screen",
    result: printed(TABLE, "no free text on the public screen"),
    file: "evals/table.eval.ts",
  },
  {
    suite: "Consent and privacy",
    check: "Public responses that carry a talent id",
    result: printed(PRIVACY, "talent ids in public responses"),
    file: "evals/privacy.eval.ts",
  },
  {
    suite: "Consent and privacy",
    check: "HTTP status for 5 bad pictures, then for 2 clean JPEGs; the description runs through the blind layer",
    result: printed(PRIVACY, "pictures: clean JPEG only, description blind"),
    file: "evals/privacy.eval.ts",
  },
  { suite: "Flow", check: "Full API flow from task to a meeting both sides confirmed", result: steps("5 Flow (API)"), file: "evals/flow.eval.ts" },
  { suite: "Demo story", check: "Story stages rebuild the visitor's own demo event", result: steps("6 Demo story (API)"), file: "evals/story.eval.ts" },
];

/** Short figures that other pages quote, from the same run. */
export const FIGURES = {
  judgingRejected: countOf(printed(DECISIONS, "(a) guard: judging rejected")),
  guardedTexts: countOf(printed(DECISIONS, "(b) designer output passes the guard")),
  plantedReached: countOf(printed(BLIND, "planted strings in reviewer payload")),
  automatedDecisions: lead(printed(DECISIONS, "(e) automated decisions")),
  secondSetHidden: countOf(printed(BLIND, "second review cases hidden")),
} as const;

/** The four promises on the landing page, each with its measured number. */
export const PROMISES = [
  { figure: FIGURES.judgingRejected, promise: "No score. No rank. No match percent.", evidence: "planted judging phrases caught by the guard that checks every AI output." },
  { figure: FIGURES.plantedReached, promise: "A person reads your work, not your name.", evidence: "planted identity details reached a reviewer." },
  { figure: "Text only", promise: "Your voice becomes text.", evidence: "WorkProof stores only the text of a voice answer." },
  { figure: FIGURES.automatedDecisions, promise: "Every decision has a name and a written reason.", evidence: "automated decisions in the audit log." },
] as const;
