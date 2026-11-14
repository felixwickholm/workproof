import { ROLES } from "@/lib/ai/scripted/roles";
import { NO_AUTOMATED_DECISIONS_LINE, REVIEWER_HIDDEN_LINE } from "@/lib/domain/guardrails";
import { DEFAULT_PLACES, MAX_PLACES, MIN_PLACES } from "@/lib/domain/places";
import { countOf, EVAL_TESTS, FIGURES, printed, UNIT_TESTS, VERIFIED_ON } from "./evidence";

/**
 * The one typed source for what /for-judges and /llms.txt say about Workprint. Every route and code
 * path here is checked to exist by facts.test.ts, so the two pages cannot point at something
 * that is not in the repository.
 */

export const NAME = "Workprint";

/** The first paragraph, word for word the same as the submission text and the README. */
export const SUMMARY = `Workprint is for City of Espoo talent events. A professional does a short real task from an Espoo company instead of sending a CV. A named person at the company reads the work without the name, writes a reason, and chooses Meet or Not now. The name appears only after the professional accepts. AI drafts tasks; it never scores or ranks a person. Tested: ${FIGURES.plantedReached} planted identity details reached a reviewer.`;

/** The demo event at its default story stage, as the seed builds it (src/lib/seed). */
export const DEMO_EVENT = { employers: 10, tasks: 14, proofs: 47 } as const;

export const ONE_LINE = "Skip the CV. Do the work. A person reads your work, not your name, and decides.";

export const KEY_FACTS: readonly string[] = [
  'Built during Junction 2026 (13 to 15 November 2026) for the City of Espoo challenge "Rethinking Recruitment".',
  "Three modes in one app: Looking for work, Hiring, City of Espoo.",
  `Places per task: each task takes ${MIN_PLACES} to ${MAX_PLACES} answers (${DEFAULT_PLACES} unless the company chooses), so a person can read every one. The employer home shows the places left on each task and about how many minutes of reading wait.`,
  "Only a registered reviewer decides. A company lists the people who may decide; a name that is not on the list is refused (HTTP 403) until that person adds themselves in one explicit, logged step, and a name that reads as software is refused outright (HTTP 400).",
  `${NO_AUTOMATED_DECISIONS_LINE}`,
  `Every reviewer reads the same line under every proof: "${REVIEWER_HIDDEN_LINE}" No count of hidden details is shown to a reviewer, since a count would hint at a background.`,
  'Facts about the job (the work language, a language level, a licence the law asks for) are neither core skills nor set aside: talent reads them under "Good to know", in fixed forms. A wish for a native speaker is set aside with "Ask for a language level, not a native speaker."',
  "Table mode is a live loop: a visitor scans the QR code and does a 2-minute task; the host invites the proof with a two-sentence reason; the visitor accepts or declines on the phone. The big screen shows labels and tasks, never free text, and a name only after its person accepted.",
  "A person can decline an invitation; the name stays hidden from that company.",
  "A picture is sent only after the person confirms it shows only the work. A reviewer can report a picture as possibly identifying; it is then removed for every reader.",
  "The city can act: it drafts a reminder to an employer that still owes answers (nothing is sent) and exports the meeting list as a CSV file, with a name only where the person accepted.",
  "Each visitor gets a private demo event behind a cookie. A request without that cookie reads the shared demo event and cannot change it. The visitor's private key travels in a request header, never in an address.",
  "No login and no API keys are needed to run the demo. All people and companies are synthetic.",
  "AI drafts tasks and two follow-up questions. People make every decision, and each decision carries a name and a written reason.",
  "A blind layer hides names, contacts, places, schools and employers before any reviewer or AI model reads the work.",
  "Made for Espoo's talent events for highly educated professionals, where a degree from abroad too often goes unread.",
  `Seven kinds of proof: writing, plan, photo, short video, voice answer, design, code. ${ROLES.length} professions have their own task today; any other gets the nearest one or a general planning task.`,
  "No silent rejection: every decision comes with a written reason, and the city sees every answer an employer still owes. Nothing forces an employer to decide.",
  `Checked on ${VERIFIED_ON}: ${UNIT_TESTS.passed} of ${UNIT_TESTS.tests} unit tests pass (${UNIT_TESTS.command}); ${EVAL_TESTS.passed} of ${EVAL_TESTS.tests} eval tests pass (${EVAL_TESTS.command}).`,
];

interface Route {
  path: string;
  name: string;
  what: string;
}

/** Public pages. Each one exists under src/app. */
export const ROUTES: readonly Route[] = [
  { path: "/", name: "Landing page", what: "What Workprint is, Olena's story and the live Espoo map" },
  { path: "/try", name: "2-minute task", what: "Do a short task on a phone and see the blind proof a company would read" },
  { path: "/seeker", name: "Looking for work", what: "Olena's home: invitation, open tasks, proof passport" },
  { path: "/challenges", name: "Tasks", what: "Every open task at the demo event" },
  { path: "/passport", name: "Proof passport", what: "The person's own proofs, what was hidden, and the answers they got" },
  { path: "/employer", name: "Hiring", what: "Kaari Home Care's home: blind queue in arrival order, pipeline, pool by skill" },
  { path: "/company", name: "Post a task", what: "One sentence becomes a task with 3 to 5 core skills; a person approves it" },
  { path: "/company/review", name: "Review", what: "Read a blind proof, write feedback, choose Meet or Not now" },
  { path: "/city", name: "City of Espoo", what: "Outcomes, the Espoo flow map, fairness audit and audit log" },
  { path: "/table", name: "Table mode", what: "Big screen with a QR code: a phone joins the same demo event" },
  { path: "/for-judges", name: "Evidence for judges", what: "Criteria, evidence, evals and limits" },
];

interface CodePath {
  path: string;
  what: string;
}

/** Where the main parts live. Each path exists in the repository. */
export const CODE_MAP: readonly CodePath[] = [
  { path: "src/app", what: "Next.js routes: pages and the JSON API under src/app/api" },
  { path: "src/lib/service", what: "Rules for tasks, submissions, decisions, meetings and Second look; view builders for each mode" },
  { path: "src/lib/blind", what: "The blind layer: removes identity before any reviewer or model reads the work" },
  { path: "src/lib/guard", what: "The no-judgement guard: rejects scores, ranks and protected attributes in AI output" },
  { path: "src/lib/ai", what: "Scripted task designer (default) and Claude and Gemini adapters, all behind the guard" },
  { path: "src/lib/matching/second-look.ts", what: "Second look: compares tasks by shared core skills, never people" },
  { path: "src/lib/voice", what: "Voice input: Web Speech API, ElevenLabs or typed; only the transcript is kept" },
  { path: "src/lib/store", what: "In-memory store and a private demo copy (sandbox) per visitor" },
  { path: "src/lib/seed", what: "The synthetic event: 10 employers, 14 tasks, the proofs and decisions" },
  { path: "evals", what: "Eval suites: task generator, blind review, no automated decisions, privacy, flow, story" },
];

interface CriterionRow {
  criterion: string;
  weight: string;
  built: string;
  routes: readonly string[];
  code: readonly string[];
  evidence: string;
}

/** The three weighted criteria from the brief, each with what answers it and how to check it. */
export const CRITERIA: readonly CriterionRow[] = [
  {
    criterion: "Impact & Relevance",
    weight: "45%",
    built:
      "Companies register with a short real task; people answer with one of seven kinds of work (writing, plan, photo, short video, voice, design, code); a person reviews blind and every decision comes with a written reason; the city sees the answers each employer still owes and meetings both sides confirmed.",
    routes: ["/seeker", "/employer", "/city"],
    code: ["src/lib/service/views", "src/lib/service/decisions.ts", "src/lib/service/meetings.ts"],
    evidence: "Flow eval: every step from task to a meeting both sides confirmed passes (evals/flow.eval.ts).",
  },
  {
    criterion: "Innovation & User Experience",
    weight: "35%",
    built:
      "A task instead of a CV; the blind proof with a slider between what was written and what the company reads; the name shown only after the person accepts; Second look shares a proof with a second employer with the same skills, with consent; a guided two-minute walkthrough; a 2-minute task on a phone.",
    routes: ["/", "/try", "/passport"],
    code: ["src/lib/blind", "src/lib/matching/second-look.ts", "src/components/proof/blind-compare.tsx"],
    evidence: "Story eval: every story stage rebuilds the visitor's own demo event (evals/story.eval.ts); end-to-end run on a 390x844 screen (evals/e2e).",
  },
  {
    criterion: "Responsible & Feasible Execution",
    weight: "20%",
    built:
      "AI never scores or ranks people: a guard checks every AI output; identity is removed before review; every decision needs a named reviewer and written feedback; runs with no keys; request limits; Docker build.",
    routes: ["/city", "/for-judges"],
    code: ["src/lib/guard", "src/lib/blind", "src/app/api/decisions/route.ts", "src/lib/http/limits.ts", "Dockerfile"],
    evidence:
      `Guard: ${FIGURES.judgingRejected} planted judging phrases rejected; ${FIGURES.guardedTexts} text fields of drafted tasks and follow-up questions pass; blind layer: ${FIGURES.plantedReached} planted identity strings reach a reviewer; ${FIGURES.automatedDecisions} automated decisions.`,
  },
];

interface PainRow {
  pain: string;
  built: string;
  code: readonly string[];
  evidence: string;
}

/** Recurring pains named in the brief, with what Workprint does about each. Only rows true in the code. */
export const PAINS: readonly PainRow[] = [
  {
    pain: "Companies struggle to describe their needs clearly and early enough.",
    built: "One sentence becomes a task with 3 to 5 core skills; extra wishes are set aside; a person approves it.",
    code: ["src/app/company/need-step.tsx", "src/app/company/draft-step.tsx", "src/lib/ai/scripted"],
    evidence: `Task generator eval: ${countOf(printed("1 Task generator", "shape (title, brief, 3-5 skills, minutes, guide)"))} drafts have 3 to 5 core skills; ${countOf(printed("1 Task generator", "bias bait set aside"))} planted biased wishes set aside.`,
  },
  {
    pain: "CVs and messages are generated and analysed with AI, so matching rests on synthetic representations.",
    built: "No CV. The person hands in work, then answers two follow-up questions about their own choices; the meeting starts from the work.",
    code: ["src/lib/ai/scripted/follow-ups.ts", "src/lib/service/submissions.ts"],
    evidence: "Flow eval: two follow-ups about the answer; follow-ups read only the redacted answer (privacy eval).",
  },
  {
    pain: "Companies are overwhelmed by large volumes of irrelevant approaches.",
    built: "Each proof is work on the company's own task; the queue is in arrival order and holds blind proofs only.",
    code: ["src/lib/service/views/queue.ts"],
    evidence: "Queues in arrival order: yes (no-automated-decisions eval).",
  },
  {
    pain: "Companies assume there are no suitable candidates in the city's pool.",
    built: "The employer home counts proofs handed in at this event for tasks that ask for the same skills as the company's. Counts only, never a list of people.",
    code: ["src/lib/service/views/employer.ts"],
    evidence: "Unit tests in src/lib/service/views/employer.test.ts.",
  },
  {
    pain: "Matching should not reinforce bias by nationality, language, education or career path.",
    built: "Names, contacts, places, schools, employers and residence status are hidden before review; tasks cannot ask for protected attributes.",
    code: ["src/lib/blind", "src/lib/guard/protected.ts"],
    evidence: `${FIGURES.plantedReached} planted strings reach the reviewer; ${countOf(printed("2 Blind review", "review cases hidden"))} and ${FIGURES.secondSetHidden} identity forms hidden.`,
  },
  {
    pain: "No automated profiling or automated decision-making about individuals.",
    built: "A person decides Meet or Not now with a written reason; a guard blocks scores and ranks in AI output; every decision is in the audit log.",
    code: ["src/lib/guard/no-judgement.ts", "src/app/api/decisions/route.ts", "src/lib/service/decisions.ts"],
    evidence: `${FIGURES.judgingRejected} planted judging phrases rejected; ${FIGURES.automatedDecisions} automated decisions in the audit log.`,
  },
  {
    pain: "Few hires per company, and a company may not answer.",
    built:
      "Nothing forces an answer, so the city sees the answers each employer still owes. After 48 hours without an answer, or after a not now, the proof can go to another employer whose task shares at least 2 core skills, if the person allowed it (Second look).",
    code: ["src/lib/matching/second-look.ts", "src/lib/service/sharing.ts"],
    evidence: "Flow eval: company B sees the proof through Second look; company C without shared skills cannot.",
  },
  {
    pain: "The city cannot measure whether events lead to meetings.",
    built: "Both sides confirm a meeting took place; the city sees answers given, reply time, meetings confirmed and answers owed per employer.",
    code: ["src/lib/service/views/city.ts", "src/lib/service/views/insights.ts", "src/app/api/meetings"],
    evidence: "Flow eval: both sides confirm the meeting; city totals change and show 0 automated decisions.",
  },
  {
    pain: "The event platform may crash when everyone logs in at the start.",
    built: "Work is done over the days before the event, with no login rush; request rate and body size limits.",
    code: ["src/lib/http/limits.ts", "src/lib/service/capacity.ts", "src/lib/service/views/insights.ts"],
    evidence: "Privacy eval: the body cap answers HTTP 413 and the rate limit HTTP 429.",
  },
  {
    pain: "International recruitment adds language, permit and relocation questions.",
    built: "Each task page shows the company's work language, whether Finnish is needed, and whether it helps with a work permit or moving.",
    code: ["src/components/proof/company-facts.tsx", "src/app/challenges/[id]/challenge-detail.tsx"],
    evidence: "Set for all 10 demo employers (src/lib/seed/companies.ts).",
  },
  {
    pain: "Solutions should minimise personal data processing.",
    built:
      "No account and no CV; the person's key stays in the browser; a name is shared with one company only after the person accepts; voice is kept as text only.",
    code: ["src/lib/client/local.ts", "src/lib/service/meetings.ts", "src/lib/voice"],
    evidence: `${countOf(printed("4 Consent and privacy", "talent ids in public responses"))} public responses carry a talent id; identity hidden until accepted.`,
  },
];

/** The three identity forms the harder blind-review case set still misses, in plain words. */
export const BLIND_MISSES: readonly string[] = [
  "another spelling of the author's own name",
  "an employer that is on no list",
  "a third person's name in running text",
];

/** What the City of Espoo staff said at the booth on 13 November, and how the product answers each risk. */
export const BOOTH = {
  intro:
    'On 13 November we asked City of Espoo staff if a work task could replace the CV. They had thought of something similar "on a smaller scale" and named three risks. Our answers:',
  answers: [
    { risk: "A company hires only a few.", answer: "With consent, one proof can reach a second employer with the same core skills (Second look), after 48 hours without an answer or after a Not now." },
    { risk: "Friction must stay low.", answer: "No login, no account, no CV. A task takes 20 minutes, 30 at most." },
    { risk: "AI can do the task.", answer: "AI is allowed. Two follow-up questions ask about the person's own choices, and the meeting starts from the work." },
  ],
} as const;

/** The shortest path through the running app that shows the whole loop. */
export const CHECK_PATH: readonly { path: string; what: string }[] = [
  { path: "/try", what: "Do a 2-minute task on a phone and see the blind proof a company would read." },
  { path: "/table", what: "Invite that proof with a two-sentence reason, then accept on the phone: only now the name shows on the big screen." },
  { path: "/city", what: "See the answers each employer still owes, and 0 automated decisions." },
];

/** What is not built, said plainly. */
export const LIMITS: readonly string[] = [
  "Company and city actions have no sign-in. Any caller can act as any company or as the city in the demo; a pilot needs sign-in and ownership checks.",
  "Pictures are not analysed. The person confirms that the picture shows only the work, and a reviewer can report one; a reported picture is removed for every reader. Nothing checks what a picture shows automatically.",
  "AI-written work is reduced, not solved: two follow-up answers about the person's own choices and a meeting that starts from the work. The product cannot prove who typed an answer.",
  "Impact is not measured yet. Every outcome in the demo is invented data; the first real test is a pilot event.",
  `Reviewing takes employer time. A task takes ${MIN_PLACES} to ${MAX_PLACES} answers, and the employer home shows the reading time owed, but reading still takes a person's time.`,
  "Nothing forces an employer to answer. Every decision needs a written reason, and the city sees the answers each employer still owes.",
  "The blind layer is rules, not a guarantee. It misses a lowercase name with no cue word, a bare name with no introduction, another person's name, another spelling of the author's name, and part of an employer name that is not on the list. It over-hides a one-word capitalised sign-off and a capitalised value after \"name:\" outside a code block.",
  "Video upload is off in the demo; seed proofs carry sample clips, visitors answer in writing, by voice or with a photo.",
  "No ESCO skill ids yet; skills come from the project's own vocabulary.",
  "No Tavata or Brella integration. The meeting list exports as a CSV file; nothing connects to an event tool directly.",
  "The demo store is in memory, one private copy per visitor, reset after 12 hours.",
  "Live AI runs only with an API key; without one the scripted task designer is used.",
];

export const AI_DOES: readonly string[] = [
  "Drafts a task from a company's one-sentence need, with 3 to 5 core skills. A person edits and approves it.",
  "Writes two follow-up questions about the person's own choices in their answer.",
  "Every AI output passes the no-judgement guard; on any failure the scripted designer is used.",
];

export const AI_NEVER: readonly string[] = [
  "Scores, ranks, rates or recommends a person.",
  "Reads a person's name, contact or other identity: it only sees text after the blind layer.",
  "Decides Meet or Not now. Only a named person does, with written feedback.",
  "Analyses a voice or a face. A spoken answer becomes text in the browser or once on the server, and only the text is kept.",
];

/** Short quotes from the City of Espoo brief. */
export const BRIEF_QUOTES: readonly string[] = [
  "How can recruitment and matchmaking events organized by City of Espoo help companies and talent relevantly find and connect with each other, despite AI-generated job search materials and AI-assisted recruitment processes are becoming common?",
  "…solutions that help create stronger signal and less noise throughout the process of registering and attending an event…",
  "…automated profiling or automated decision-making about individuals without human involvement should not be a part of the solution.",
];
