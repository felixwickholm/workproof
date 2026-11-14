/**
 * The words of /how-it-works, in one place, so a test can hold them to the plain-language rules
 * and to the rule that people score the work and the AI never does.
 */

/** What WorkProof sells, in one sentence. */
export const PROMISE = "Companies see how well people do the real work before they meet them.";

/** The product in six steps. Each: a 4 to 8 word headline and one sentence of at most 16 words. */
export const STEPS = [
  { id: "ad", headline: "A company shares its job ad.", sentence: "The AI drafts a short challenge from it, and a person approves it." },
  { id: "work", headline: "A person does the challenge.", sentence: "They think aloud for 5 to 15 minutes, with screen and voice but no camera." },
  { id: "score", headline: "The company scores the work, not the name.", sentence: "A person scores it against 3 to 5 skills and writes why." },
  { id: "invite", headline: "The top people get invited.", sentence: "The name shows only after the person says yes." },
  { id: "talk", headline: "They meet face to face at the event.", sentence: "After the first talk, they agree a follow-up, or not." },
  { id: "city", headline: "The city sees what came of it.", sentence: "Who took a challenge, what was scored, invites, talks, follow-ups and hires." },
] as const;

export type StepId = (typeof STEPS)[number]["id"];

/** Three short points for each side, and where that side starts. */
export const SIDES = [
  {
    id: "seeker",
    title: "For job seekers",
    href: "/",
    cta: "Open the Job seeker view",
    points: ["Do a short real challenge from an Espoo company.", "Your name stays hidden until you say yes.", "Every score comes with a written reason."],
  },
  {
    id: "employer",
    title: "For companies",
    href: "/employer",
    cta: "Open the view for companies",
    points: ["Paste your job ad. The AI drafts the challenge.", "Read real work, without names.", "Score the skills, invite the best, meet them at the event."],
  },
  {
    id: "city",
    title: "For the City of Espoo",
    href: "/city",
    cta: "Open the view for the City of Espoo",
    points: ["Make a challenge for a company from its job ad.", "See who took part, who got invited and who met.", "Count follow-up talks without a survey."],
  },
] as const;

export const AI_DOES = ["Drafts a challenge from a job ad or one sentence.", "Marks which part of the work relates to which skill."] as const;
export const AI_NEVER = ["Never gives a score.", "Never ranks people.", "Never decides who gets invited."] as const;

/** The questions a city asks first, each answered in at most two short sentences. */
export const FAIR_QUESTIONS = [
  {
    question: "Will people do unpaid tasks?",
    answer: "A challenge takes 5 to 15 minutes. One challenge can reach several companies.",
  },
  {
    question: "Will companies read and answer?",
    answer: "The city sees how many answers each company still owes. The city can make answering a rule for its events.",
  },
  {
    question: "Does the reviewer see who did the work?",
    answer: "No. The company scores the work before it knows who did it.",
  },
  {
    question: "Can AI do the task?",
    answer: "People think aloud while they work, so the reviewer reads how they think. WorkProof cannot prove who did the work.",
  },
  {
    question: "How does it fit our event tools?",
    answer: "It runs in the days before the event. The city exports the meeting list as a file: times and tables, never names.",
  },
  {
    question: "Is scoring people fair?",
    answer: "A named person scores the work against the skills in the task, without the name. The person sees the scores and the reason.",
  },
] as const;

/** Most recruiting AI against WorkProof, row by row. */
export const COMPARISON = [
  ["Reads a profile", "Reads real work, 5 to 15 minutes long"],
  ["An algorithm gives a match score", "A person scores the work and signs it"],
  ["AI interviews or ranks people", "AI only drafts challenges and marks skills"],
  ["Silence after you apply", "Every score comes with a written reason"],
  ["The city counts sign-ups", "The city counts talks and follow-ups"],
] as const;

/** Finland's own precedent for judging people by their work. */
export const PRECEDENT = {
  before: "Finland already certifies skills by watching real work. It is called",
  term: "näyttötutkinto",
  after: "WorkProof brings that to hiring.",
} as const;
