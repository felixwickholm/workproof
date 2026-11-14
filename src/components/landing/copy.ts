/**
 * Every fixed line on the landing page, in one place, so a test can hold them to the plain-language
 * rules: short sentences, common words, and the v3 truth that people score the work.
 */

export const HEADLINE = "Show your work. Get the interview.";
export const SUB_LINE = "WorkProof is hiring that sees the work, not the name.";

/** The three ways in. Each whole panel opens that view. */
export const DOORS = [
  { id: "seeker", href: "/seeker", label: "I'm looking for work", line: "Do a short challenge. Show how you think." },
  { id: "employer", href: "/employer", label: "I'm hiring", line: "Paste your job ad. See real work." },
  { id: "city", href: "/city", label: "I'm the City of Espoo", line: "See who took part and what came of it." },
] as const;

export type DoorId = (typeof DOORS)[number]["id"];

export const TOUR_LABEL = "Watch the 1-minute tour";
export const TRY_LABEL = "Try a 2-minute challenge";

/** Who the events, and so WorkProof, are for, and what the page's data is. */
export const FOOT_LINE = "Made for Espoo's talent events for business and tech people. Demo data: all people and companies are invented.";

/** The event's order, as the city and the companies see it. */
export const EVENT_STEPS = [
  "The challenge opens before the event.",
  "The company scores the work.",
  "The top people get invited.",
  "A first talk happens at the event.",
  "A follow-up is agreed.",
] as const;

/** The story headline: merit, said with the reviewer's own total when the decision carries one. */
export function storyTitle(total: number | null): [string, string] {
  return ["Her CV got no answer.", total === null ? "Her work got the interview." : `Her work got ${Number(total.toFixed(1))} of 10.`];
}

/** Two short sentences under the story headline. */
export const STORY_LINES = ["The company scored her work before it knew who did it.", "Her name showed only after she said yes."] as const;

/** The rule about scores, said the same way everywhere. */
export const SCORE_RULE = "People score the work. The AI never does.";
export const SCORE_HOW = "A person reads the work without the name, scores it against 3 to 5 skills and writes why.";
export const NAME_RULE = "The name shows only after the person says yes.";

export const CLOSING = ["Work first. Names last.", "People decide."] as const;

export const PARTNER_LINE = "Built for the City of Espoo challenge, Junction 2026.";
export const DEMO_LINE = "Demo data. All people and companies are invented.";
