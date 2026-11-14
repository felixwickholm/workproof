import { ROLES } from "@/lib/ai/scripted/roles";
import { HIDING_LINE, MODEL_INPUT_LINE, NO_AUTOMATED_DECISIONS_LINE, REVIEWER_HIDDEN_LINE } from "@/lib/domain/guardrails";
import { DEFAULT_PLACES, MAX_PLACES, MIN_PLACES } from "@/lib/domain/places";
import { countOf, EVAL_TESTS, FIGURES, printed, UNIT_TESTS, VERIFIED_ON } from "./evidence";

/**
 * The one typed source for what /for-judges and /llms.txt say about WorkProof. Every route and code
 * path here is checked to exist by facts.test.ts, so the two pages cannot point at something
 * that is not in the repository.
 */

export const NAME = "WorkProof";

/** The first paragraph, word for word the same as the submission text and the README. */
export const SUMMARY = `WorkProof is for City of Espoo talent events. Companies see real work and score it; the AI never scores. A professional does a short real task from an Espoo company. A named person at the company scores the work from 1 to 5 on each of the task's skills, writes a reason, and chooses Meet or Not now. As a safeguard, the name stays hidden until the professional accepts. Tested: ${FIGURES.plantedReached} planted identity details reached a reviewer.`;

/** The demo event at its default story stage, as the seed builds it (src/lib/seed). */
export const DEMO_EVENT = { employers: 10, tasks: 12, proofs: 62 } as const;

export const ONE_LINE = "Show your work. Get the interview. A person at the company scores your real work; the AI never scores.";

export const KEY_FACTS: readonly string[] = [
  'Built during Junction 2026 (13 to 15 November 2026) for the City of Espoo challenge "Rethinking Recruitment".',
  "Three views in one app: Job seeker, Company, City of Espoo.",
  `Places per task: each task takes ${MIN_PLACES} to ${MAX_PLACES} answers (${DEFAULT_PLACES} unless the company chooses), so an employer can read them all. The company sets the number before it approves the challenge, and each challenge page shows the places left.`,
  "A decision names a reviewer registered for the company. A company lists the people who may decide; a name that is not on the list is refused (HTTP 403) until that person adds themselves in one explicit, logged step, and a name that reads as software is refused outright (HTTP 400). This demo has no sign-in, so the name is not verified.",
  `${NO_AUTOMATED_DECISIONS_LINE}`,
  "A named reviewer scores the work from 1 to 5 on each core skill of the task and writes why. The total shows out of 10 (the average points × 2), and a task's top work is sorted by these human totals. Software never gives or suggests a number.",
  `Every reviewer reads the same line under every proof: "${REVIEWER_HIDDEN_LINE}" No count of hidden details is shown to a reviewer, since a count would hint at a background.`,
  'Facts about the job (the work language, a language level, a licence the law asks for) are neither core skills nor set aside: they are kept under "Good to know", in fixed forms. A wish for a native speaker is set aside with "Ask for a language level, not a native speaker."',
  "Table mode is a live loop: a visitor scans the QR code and does a 2-minute task; the host invites the proof with a two-sentence reason; the visitor accepts or declines on the phone. The big screen shows labels and tasks, never free text, and a name only after its person accepted.",
  "A person can decline an invitation; the name stays hidden from that company.",
  "A picture is sent only after the person confirms it shows only the work. A reviewer can report a picture as possibly identifying; it is then removed for every reader.",
  "The city can act: it makes a challenge for a company from its job ad, drafts a reminder to a company with work waiting (nothing is sent) and exports the list of talks as a CSV file. The organiser sees slots and labels, never names.",
  "Each visitor gets a private demo event behind a cookie. A request without that cookie reads the shared demo event and cannot change it. The visitor's private key travels in a request header, never in an address.",
  "No login and no API keys are needed to run the demo. All people and companies are synthetic.",
  "AI drafts tasks and two follow-up questions. WorkProof has no automated decision feature; each decision carries a reviewer's name and a written reason.",
  `${HIDING_LINE} ${MODEL_INPUT_LINE}`,
  "Made for Espoo's talent events for business and tech people.",
  `Four formats: Choose, Make, Fix, Read. The demo event has 30 challenges from 18 companies. Without an AI key the built-in designer still drafts: ${ROLES.length} professions have their own task today; any other gets the nearest one or a general planning task.`,
  "No decision without a reason: every recorded decision carries a written reason, and unanswered work stays visible to the city. Nothing forces an employer to decide.",
  `Checked on ${VERIFIED_ON}: ${UNIT_TESTS.passed} of ${UNIT_TESTS.tests} unit tests pass (${UNIT_TESTS.command}); ${EVAL_TESTS.passed} of ${EVAL_TESTS.tests} eval tests pass (${EVAL_TESTS.command}).`,
];

interface Route {
  path: string;
  name: string;
  what: string;
}

/** Public pages. Each one exists under src/app. */
export const ROUTES: readonly Route[] = [
  { path: "/try", name: "2-minute task", what: "Do a short task on a phone and see the blind proof a company would read" },
  { path: "/", name: "Job seeker", what: "Mikko's home, the first screen: invitation, open challenges, his work" },
  { path: "/challenges", name: "Challenges", what: "Every open challenge at the demo event, in four formats: Choose, Make, Fix, Read" },
  { path: "/my-work", name: "My work", what: "The person's own work, what was hidden, the reviewer's scores and reason, and a portfolio to share" },
  { path: "/employer", name: "Company", what: "Halla Supply's challenges, each with its top work by the reviewers' scores and the work waiting in arrival order" },
  { path: "/company", name: "New challenge", what: "A job-ad link or one sentence becomes a challenge with 3 to 5 core skills; a person approves it" },
  { path: "/company/review", name: "Score work", what: "Read the work without the name, give 1 to 5 points per skill with a written reason, then invite or not now" },
  { path: "/city", name: "City of Espoo", what: "Outcomes, the Espoo flow map, process safeguards and audit log" },
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
  { path: "src/lib/blind", what: "The blind layer: rules remove known personal details before any reviewer or model reads the work; some can remain" },
  { path: "src/lib/guard", what: "The no-judgement guard: rejects scores, ranks and protected attributes in AI output" },
  { path: "src/lib/ai", what: "Scripted task designer (default) and Claude and Gemini adapters, all behind the guard" },
  { path: "src/lib/matching/second-look.ts", what: "Second look: compares tasks by shared core skills, never people" },
  { path: "src/lib/voice", what: "Voice input: Web Speech API, ElevenLabs or typed; WorkProof stores only the transcript" },
  { path: "src/lib/store", what: "In-memory store and a private demo copy (sandbox) per visitor" },
  { path: "src/lib/seed", what: "The synthetic event: 18 employers, 30 challenges, 76 pieces of work from 46 people, the scores and decisions" },
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
      "Companies register with a short real challenge in one of four formats (Choose, Make, Fix, Read); people answer with work and think aloud while working; a person reviews with known personal details removed and every recorded decision carries a written reason; the city sees each step from challenge taken to scored, invited, talked, follow-up agreed and hired, and the work still waiting on each challenge.",
    routes: ["/seeker", "/employer", "/city"],
    code: ["src/lib/service/views", "src/lib/service/decisions.ts", "src/lib/service/meetings.ts"],
    evidence: "Flow eval: every step from task to a meeting both sides confirmed passes (evals/flow.eval.ts).",
  },
  {
    criterion: "Innovation & User Experience",
    weight: "35%",
    built:
      "A short real task to score; the blind proof with a slider between what was written and what the company reads; the name shown only after the person accepts; Second look shares a proof with a second employer with the same skills, with consent; a 1-minute guided tour and a Show me demo in each view; a 2-minute task on a phone.",
    routes: ["/", "/try", "/my-work"],
    code: ["src/lib/blind", "src/lib/matching/second-look.ts", "src/components/proof/blind-compare.tsx"],
    evidence: "Story eval: every story stage rebuilds the visitor's own demo event (evals/story.eval.ts); end-to-end run on a 390x844 screen (evals/e2e).",
  },
  {
    criterion: "Responsible & Feasible Execution",
    weight: "20%",
    built:
      "AI never scores or ranks people: a guard checks every AI output; known personal details are removed by rules before review; every decision needs a registered reviewer name and written feedback (not verified without sign-in); runs with no keys; request limits; Docker build.",
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

/** Recurring pains named in the brief, with what WorkProof does about each. Only rows true in the code. */
export const PAINS: readonly PainRow[] = [
  {
    pain: "Companies struggle to describe their needs clearly and early enough.",
    built: "One sentence becomes a task with 3 to 5 core skills; extra wishes are set aside; a person approves it.",
    code: ["src/app/company/start-step.tsx", "src/app/company/draft-step.tsx", "src/lib/ai/scripted"],
    evidence: `Task generator eval: ${countOf(printed("1 Task generator", "shape (title, brief, 3-5 skills, minutes, guide)"))} drafts have 3 to 5 core skills; ${countOf(printed("1 Task generator", "bias bait set aside"))} planted biased wishes set aside.`,
  },
  {
    pain: "CVs and messages are generated and analysed with AI, so matching rests on synthetic representations.",
    built: "The company scores real work on its own task. The person then answers two follow-up questions about their own choices, and the meeting starts from the work.",
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
    built: "The city makes a challenge from a company's job ad, and people do it before the company opens it. In the demo, Kide Silicon's challenge already has 20 pieces of work. The company's home data also counts proofs handed in for tasks that ask for the same skills. Counts only, never a list of people.",
    code: ["src/lib/service/views/employer.ts", "src/components/city/make-challenge.tsx"],
    evidence: "Unit tests in src/lib/service/views/employer.test.ts.",
  },
  {
    pain: "Matching should not reinforce bias by nationality, language, education or career path.",
    built: "Known names, contacts, places, schools, employers and residence status are removed by rules before review, and some can remain; tasks cannot ask for protected attributes.",
    code: ["src/lib/blind", "src/lib/guard/protected.ts"],
    evidence: `${FIGURES.plantedReached} planted strings reach the reviewer; ${countOf(printed("2 Blind review", "review cases hidden"))} and ${FIGURES.secondSetHidden} identity forms hidden.`,
  },
  {
    pain: "No automated profiling or automated decision-making about individuals.",
    built: "WorkProof has no automated decision feature: a decision is recorded with a registered reviewer's name, the reviewer's own points for each core skill and a written reason; a guard blocks scores and ranks in AI output; every decision is in the audit log.",
    code: ["src/lib/guard/no-judgement.ts", "src/app/api/decisions/route.ts", "src/lib/service/decisions.ts", "src/lib/domain/scoring.ts"],
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
    built: "Facts the company writes about the job (a work language, a language level, a licence) are kept in fixed forms under \"Good to know\" on the draft and on the challenge page. A wish for a native speaker is set aside with \"Ask for a language level, not a native speaker.\"",
    code: ["src/lib/guard/job-facts.ts", "src/app/company/draft-step.tsx", "src/app/challenges/[id]/challenge-detail.tsx"],
    evidence: `Task generator eval: ${countOf(printed("1 Task generator", "job facts published as requirements"))} needs carry their facts as requirements only.`,
  },
  {
    pain: "Solutions should minimise personal data processing.",
    built:
      "No account; the person's key stays in the browser; accepting shows the name to that company only, and the organiser sees slots and labels, never names; WorkProof stores only the text of a spoken answer.",
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
    { risk: "Friction must stay low.", answer: "No login and no account. The demo challenges take 10 or 15 minutes. The stated length is capped at 30." },
    { risk: "AI can do the task.", answer: "AI is allowed. Two follow-up questions ask about the person's own choices, and the meeting starts from the work." },
  ],
} as const;

/** The shortest path through the running app that shows the whole loop. */
export const CHECK_PATH: readonly { path: string; what: string }[] = [
  { path: "/try", what: "Do a 2-minute task on a phone and see the blind proof a company would read." },
  { path: "/table", what: "Invite that proof with a two-sentence reason, then accept on the phone: only now the name shows on the big screen." },
  { path: "/city", what: "See what came of the event, from challenges taken to scores, invitations and talks, and the work still waiting." },
];

/** What is not built, said plainly. */
export const LIMITS: readonly string[] = [
  "Company and city actions have no sign-in. Any caller can act as any company or as the city in the demo; a pilot needs sign-in and ownership checks.",
  "Pictures are not analysed. The person confirms that the picture shows only the work, and a reviewer can report one; a reported picture is removed for every reader. Nothing checks what a picture shows automatically.",
  "AI-written work is not solved. Our untested assumption: follow-up answers about a person's own choices, and a meeting that starts from the work, make AI-only answers easy to notice. This is not measured yet. The product cannot prove who typed an answer.",
  "Impact is not measured yet. Every outcome in the demo is invented data; the first real test is a pilot event.",
  `Reviewing takes employer time. A task takes ${MIN_PLACES} to ${MAX_PLACES} answers, but reading still takes a person's time.`,
  "Nothing forces an employer to answer. Every recorded decision needs a written reason, and unanswered work stays visible to the city.",
  "The blind layer is rules, not a guarantee. It misses a lowercase name with no cue word, a bare name with no introduction, another person's name, another spelling of the author's name, and part of an employer name that is not on the list. It over-hides a one-word capitalised sign-off and a capitalised value after \"name:\" outside a code block.",
  "Video upload is off in the demo; seed proofs carry sample clips, visitors answer in writing, by voice or with a photo.",
  "No ESCO skill ids yet; skills come from the project's own vocabulary.",
  "No Tavata or Brella integration. The meeting list exports as a CSV file; nothing connects to an event tool directly.",
  "The demo store is in memory, one private copy per visitor, reset after 12 hours.",
  "Live AI runs only with an API key; without one the scripted task designer is used.",
];

export const AI_DOES: readonly string[] = [
  "Drafts a task from a company's one-sentence need, with 3 to 5 core skills. A person approves every company task. Practice tasks are generated without approval and go to no company.",
  "Writes two follow-up questions about the person's own choices in their answer.",
  "Every AI output passes the no-judgement guard; on any failure the scripted designer is used.",
];

export const AI_NEVER: readonly string[] = [
  "Scores, ranks, rates or recommends a person.",
  `Receives a person's name or contact field. ${MODEL_INPUT_LINE} Rules can miss some details in free text.`,
  "Decides Meet or Not now. WorkProof has no automated decision feature; a decision carries a registered reviewer's name and written feedback.",
  "Analyses a voice or a face. A spoken answer becomes text in the browser or once on the server, and WorkProof stores only the text.",
];

/** Short quotes from the City of Espoo brief. */
export const BRIEF_QUOTES: readonly string[] = [
  "How can recruitment and matchmaking events organized by City of Espoo help companies and talent relevantly find and connect with each other, despite AI-generated job search materials and AI-assisted recruitment processes are becoming common?",
  "…solutions that help create stronger signal and less noise throughout the process of registering and attending an event…",
  "…automated profiling or automated decision-making about individuals without human involvement should not be a part of the solution.",
];

/** The hackathon entry itself, for the structured data and the text maps. */
export const ENTRY = {
  event: "Junction 2026",
  eventStart: "2026-11-13",
  eventEnd: "2026-11-15",
  challenge: "Rethinking Recruitment",
  challengeBy: "City of Espoo",
  challengeByUrl: "https://www.espoo.fi/",
  firstCommit: "2026-11-14",
} as const;

/** Who uses WorkProof, and what each side does and gets. */
export const AUDIENCES: readonly { who: string; mode: string; path: string; does: string }[] = [
  {
    who: "Professionals looking for work",
    mode: "Job seeker",
    path: "/",
    does: "Pick a challenge from an Espoo company, do it in 10 to 15 minutes while thinking aloud, see what the company will read, answer two follow-up questions, then accept or decline an invitation. A declined company never sees the name.",
  },
  {
    who: "Companies hiring at the event",
    mode: "Company",
    path: "/employer",
    does: "Paste a job-ad link or say the need in one sentence, approve a challenge with 3 to 5 core skills and a number of places, read the work without names in arrival order, score each core skill from 1 to 5 with a written reason, and invite the people to meet.",
  },
  {
    who: "City of Espoo event organisers",
    mode: "City of Espoo",
    path: "/city",
    does: "See outcomes, not sign-ups: challenges taken, scored, invited, talked, follow-ups agreed and hires. Make a challenge for a company from its job ad, draft a reminder to a company with work waiting, and export the list of talks. Slots and labels, never names.",
  },
];

interface Guardrail {
  rule: string;
  enforced: readonly string[];
  checked: readonly string[];
}

/** The rules the code never breaks, where each is enforced and which test checks it. Every path exists. */
export const GUARDRAILS: readonly Guardrail[] = [
  {
    rule: "Software never scores, ranks or rates a person. Only a named reviewer gives points, 1 to 5 per core skill, with a written reason. AI output with a score, rank or verdict is rejected.",
    enforced: ["src/lib/domain/scoring.ts", "src/lib/service/decisions.ts", "src/lib/guard/no-judgement.ts", "src/lib/ai/guarded.ts"],
    checked: ["evals/no-automated-decisions.eval.ts", "src/lib/domain/scoring.test.ts", "src/lib/guard/no-judgement.test.ts"],
  },
  {
    rule: "Every decision carries the name of a reviewer registered for the company and at least 4 words of feedback. Another name is refused with HTTP 403, a name that reads as software with HTTP 400. Without sign-in the name is not verified.",
    enforced: ["src/lib/domain/decision-rules.ts", "src/lib/service/reviewers.ts"],
    checked: ["evals/no-automated-decisions.eval.ts", "src/lib/service/reviewers.test.ts"],
  },
  {
    rule: "Reviewers get a blind proof built by an allow-list that names every field. Identity lives only on the talent record.",
    enforced: ["src/lib/blind/project.ts", "src/lib/domain/types.ts"],
    checked: ["src/lib/blind/project.test.ts", "evals/blind-review.eval.ts", "evals/privacy.eval.ts"],
  },
  {
    rule: "A company sees the name only after the person accepts the invitation.",
    enforced: ["src/lib/service/meetings.ts", "src/lib/service/views/queue.ts"],
    checked: ["evals/blind-review.eval.ts", "evals/flow.eval.ts"],
  },
  {
    rule: "Work waiting to be read is in arrival order. The only other order is a task's top work, by the reviewers' own totals.",
    enforced: ["src/lib/service/views/queue.ts", "src/lib/service/views/leaderboard.ts"],
    checked: ["evals/no-automated-decisions.eval.ts", "src/lib/service/views/leaderboard.test.ts"],
  },
  {
    rule: `Each task takes ${MIN_PLACES} to ${MAX_PLACES} answers, so an employer can read them all.`,
    enforced: ["src/lib/domain/places.ts"],
    checked: ["src/lib/domain/places.test.ts", "evals/flow.eval.ts"],
  },
  {
    rule: "Audio is never stored. Only the transcript is sent with a submission.",
    enforced: ["src/lib/http/schemas.ts", "src/lib/voice/server/elevenlabs.ts"],
    checked: ["src/lib/voice/server/elevenlabs.test.ts"],
  },
  {
    rule: "The person's private key is never in an address. A request without the visitor's sandbox cookie reads the shared demo event and cannot change it.",
    enforced: ["src/lib/http/talent-key.ts", "src/lib/store/index.ts"],
    checked: ["src/lib/http/talent-key.test.ts", "src/lib/store/index.test.ts"],
  },
];

/** Commands that check the claims, from a fresh clone. No keys needed. */
export const VERIFY_COMMANDS: readonly { command: string; what: string }[] = [
  { command: "npm install", what: "Installs dependencies (Node.js 22 or newer)." },
  { command: "npm test", what: "Unit tests next to the code." },
  { command: "npm run eval", what: "The eval suites in evals/; prints one row per check." },
  { command: "npx tsc --noEmit", what: "Type check." },
  { command: "npm run lint", what: "ESLint." },
  { command: "npm run dev", what: "The app on http://localhost:3000." },
  { command: "npm run eval:e2e", what: "Playwright through the real interface at 390x844; needs the app running." },
];

/** One paragraph on how the app is built. */
export const ARCHITECTURE_SUMMARY =
  "One Next.js app. Pages and the JSON API call the service rules. The rules pass work through the blind layer before anyone reads it (rules remove known personal details; some can remain), check every AI output with the guard, and keep each visitor's demo copy in memory.";

/** How personal data is handled in the demo. */
export const PRIVACY: readonly string[] = [
  "No account. The person's private key is kept in their own browser.",
  "Reviewers and AI models read work only after the blind layer: known personal details are removed by rules, and some can remain. Responses to companies and the city carry no talent id.",
  "Accepting shows the name and contact to that company only. The organiser sees slots and labels, never names.",
  "Second look is off until the person turns it on, and can be withdrawn.",
  "Voice is turned into text; WorkProof stores only the text. Pictures are re-encoded in the browser and the server refuses a JPEG that still carries EXIF data.",
  "Each visitor's demo copy lives in memory and is dropped after 12 hours.",
];

export const SYNTHETIC =
  'Every person, company, task, proof and decision in the demo is invented, including Mikko Lahtinen and the ten employers of "Espoo Talent Day". Email addresses use example.org and phone numbers are placeholders. Any likeness to a real person or company is accidental. The seed is in src/lib/seed.';
