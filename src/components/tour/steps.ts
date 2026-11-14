import type { StoryStage } from "@/lib/domain/types";
import { STORY_CHALLENGE, STORY_COMPANY, storyBossFirstName, storyCompanyName } from "./story-ids";

/** Whose screen a step shows. "start" is a card that belongs to nobody (the end card). */
export type TourMode = "seeker" | "employer" | "city" | "start";

/** The three views that each have their own demo. */
export type TourView = Exclude<TourMode, "start">;

/** Which tour runs: the one-minute overview from the landing page, or the demo of one view. */
export type TourKind = "minute" | TourView;

export const TOUR_KINDS: readonly TourKind[] = ["minute", "seeker", "employer", "city"];

/** Stands for the id of Olena's story proof in a route; filled in once the stage is set. */
export const STORY_PROOF = "{storyProof}";


export interface TourStep {
  id: string;
  /** At most 8 words. */
  title: string;
  /** At most one sentence of at most 12 words. The screen itself shows the rest. */
  body?: string;
  /** Where the step happens. May contain STORY_PROOF. Without one the step stays on the page it is on. */
  route?: string;
  /** The story stage the sandbox must be at; the server rebuilds it when it differs. */
  stage?: StoryStage;
  /** The `data-tour` id to spotlight. Without one the card sits in the middle of the screen. */
  target?: string;
  /** A CSS selector to light while no element carries the `data-tour` id yet. */
  selector?: string;
  /**
   * The screen that carries this target is still being built: the step waits only briefly for it,
   * then shows its card in the middle.
   */
  soon?: boolean;
  /** Glide the page's compare slider once from "written" to "company reads" while the step shows. */
  glide?: boolean;
  /**
   * Text the lit element must contain, when a page carries several of one kind (two invitations).
   * Read when the step runs, so it follows the demo world's names.
   */
  targetText?: () => string;
  /** The page reads no story data, so its stage is set while the step already shows. */
  stageInBackground?: boolean;
  mode: TourMode;
  /** The company Hiring mode acts as on this step, whatever company the visitor chose before. */
  company?: string;
}

/**
 * The chip on the card, so a visitor always knows whose screen they are looking at. The boss is
 * named from the demo world, so the chip never names someone the story no longer has.
 */
export function modeChip(mode: TourMode): string | null {
  if (mode === "seeker") return "Olena, looking for work";
  if (mode === "city") return "The City of Espoo";
  if (mode === "employer") {
    const boss = storyBossFirstName();
    return boss ? `${boss}, the boss` : "The boss";
  }
  return null;
}

/** Where a way out of the end card leads. */
export interface EndAction {
  label: string;
  /** The page it opens. */
  href: string;
  /** The view whose own demo the opened page offers (its Show me button gives a pulse). */
  offer?: TourView;
}

const company = STORY_COMPANY;
const myWork = `/my-work/${STORY_PROOF}`;
const review = `/company/review/${STORY_PROOF}`;
const work = `/challenges/${STORY_CHALLENGE}/work`;
const leaderboard = `/employer/challenges/${STORY_CHALLENGE}`;

/** The last card of every tour. */
const END_TITLE = "Now try it yourself.";

/** The overview from the landing page: one person's way from a challenge to a talk, in about a minute. */
export const minuteSteps: readonly TourStep[] = [
  { id: "m-ask", title: "A company needs help.", body: "It posts a short challenge.", route: "/company", stage: "before", stageInBackground: true, target: "job-ad", mode: "employer", company },
  { id: "m-do", title: "Olena does the challenge.", body: "She says what she thinks as she works.", route: work, stage: "before", target: "do-challenge", mode: "seeker" },
  { id: "m-hidden", title: "Her name is hidden.", body: "The company sees her work, not her name.", route: myWork, stage: "sent", target: "blind-work", glide: true, mode: "seeker" },
  { id: "m-score", title: "The boss scores the work.", body: "A person gives the points, not the AI.", route: review, stage: "invited", target: "score", mode: "employer", company },
  { id: "m-yes", title: "She says yes.", body: "Now the company sees her name.", route: "/seeker", stage: "met", target: "invitation", targetText: storyCompanyName, mode: "seeker" },
  { id: "m-city", title: "The city sees what came of it.", body: "Who took part, who met, and who talks again.", route: "/city", stage: "met", target: "city-funnel", mode: "city" },
  { id: "m-end", title: END_TITLE, body: "Pick your side.", mode: "start" },
];

/** Looking for work: pick a challenge, do it, the name hidden, a score and an invite, then yes. */
export const seekerSteps: readonly TourStep[] = [
  { id: "s-pick", title: "Pick a challenge.", body: "Companies in Espoo post short challenges.", route: "/seeker", stage: "before", target: "challenge-list", mode: "seeker" },
  { id: "s-do", title: "Do it and think aloud.", body: "Olena talks as she works, with no camera.", route: work, stage: "before", target: "do-challenge", mode: "seeker" },
  { id: "s-sent", title: "She sends her work.", body: "The company sees it without her name.", route: myWork, stage: "sent", target: "own-work", glide: true, mode: "seeker" },
  { id: "s-score", title: "Her CV got no answer.", body: "Her work got 9 of 10.", route: myWork, stage: "invited", target: "my-score", mode: "seeker" },
  { id: "s-invite", title: "She gets an invite.", body: "The boss wants to meet her.", route: "/seeker", stage: "invited", target: "invitation", targetText: storyCompanyName, mode: "seeker" },
  { id: "s-yes", title: "She says yes.", body: "Only now does the company see her name.", route: "/seeker", stage: "met", target: "invitation", targetText: storyCompanyName, mode: "seeker" },
  { id: "s-end", title: END_TITLE, body: "Pick a challenge and do it.", mode: "start" },
];

/** Hiring: a job ad becomes a challenge, the work is read without names, scored, and the best invited. */
export const employerSteps: readonly TourStep[] = [
  { id: "e-ad", title: "Paste your job ad.", body: "Or say what you need in one sentence.", route: "/company", stage: "invited", target: "job-ad", mode: "employer", company },
  { id: "e-draft", title: "The challenge is written for you.", body: "You read it and say yes.", route: "/company", stage: "invited", target: "draft", soon: true, mode: "employer", company },
  { id: "e-read", title: "Read the work, not the name.", body: "Work waits in the order it came.", route: "/company/review", stage: "sent", target: "queue", mode: "employer", company },
  { id: "e-score", title: "Score the work.", body: "Give points for each skill and say why.", route: review, stage: "sent", target: "score", mode: "employer", company },
  { id: "e-top", title: "See the best work first.", body: "The top scores, still with no names.", route: leaderboard, stage: "invited", target: "top-work", mode: "employer", company },
  { id: "e-invite", title: "Invite the people you want to meet.", body: "Names show only when they say yes.", route: leaderboard, stage: "invited", target: "invite", soon: true, mode: "employer", company },
  { id: "e-end", title: END_TITLE, body: "Paste a job ad or read the work.", mode: "start" },
];

/** City: the map, who took part, what companies need, the talks, and how people are kept safe. */
export const citySteps: readonly TourStep[] = [
  { id: "c-map", title: "See the event on the map.", body: "Where the companies and the work are in Espoo.", route: "/city", stage: "met", target: "city-map", mode: "city" },
  { id: "c-funnel", title: "See who took part.", body: "From challenge to score to a talk.", route: "/city", stage: "met", target: "city-funnel", mode: "city" },
  { id: "c-demand", title: "See what companies need.", body: "The skills they ask for most.", route: "/city", stage: "met", target: "city-demand", mode: "city" },
  { id: "c-talks", title: "Count the talks.", body: "See which talks led to a next meeting.", route: "/city", stage: "met", target: "city-talks", mode: "city" },
  { id: "c-safe", title: "See how people are kept safe.", body: "Names stay hidden, and people make every choice.", route: "/city", stage: "met", target: "city-safeguards", mode: "city" },
  { id: "c-end", title: END_TITLE, body: "Look around the city view.", mode: "start" },
];

/** Where free exploring starts once a tour closes. */
export const EXPLORE_STAGE: StoryStage = "invited";

export interface Tour {
  steps: readonly TourStep[];
  /** The ways out of the end card, the first one filled. */
  end: readonly EndAction[];
}

export const tours: Record<TourKind, Tour> = {
  minute: {
    steps: minuteSteps,
    end: [
      { label: "I'm looking for work", href: "/seeker", offer: "seeker" },
      { label: "I'm hiring", href: "/employer", offer: "employer" },
      { label: "I'm the City of Espoo", href: "/city", offer: "city" },
    ],
  },
  seeker: { steps: seekerSteps, end: [{ label: "Pick a challenge", href: "/challenges" }] },
  employer: {
    steps: employerSteps,
    end: [
      { label: "Paste a job ad", href: "/company" },
      { label: "Read the work", href: "/company/review" },
    ],
  },
  city: { steps: citySteps, end: [{ label: "Look around", href: "/city" }] },
};

/**
 * The tour a request names. Anything unknown, and the retired "story", start the one-minute tour,
 * so an old link or button still works.
 */
export function tourKindOf(value: unknown): TourKind {
  return TOUR_KINDS.includes(value as TourKind) ? (value as TourKind) : "minute";
}
