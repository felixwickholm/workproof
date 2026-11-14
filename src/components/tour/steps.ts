import { DEFAULT_COMPANY_ID } from "@/components/company/company-choice";
import type { StoryStage } from "@/lib/domain/types";

/** Whose screen a step shows. "start" is the landing page and the close, which belong to nobody. */
export type TourMode = "seeker" | "employer" | "city" | "start";

/** Stands for the id of Olena's story proof in a route; filled in once the stage is set. */
export const STORY_PROOF = "{storyProof}";

export interface TourStep {
  id: string;
  title: string;
  body: string;
  /** Where the step happens. May contain STORY_PROOF. */
  route: string;
  /** The story stage the sandbox must be at; the server rebuilds it when it differs. */
  stage?: StoryStage;
  /** The `data-tour` id to spotlight. Without one the card sits in the middle of the screen. */
  target?: string;
  /** A CSS selector to light when no element carries the `data-tour` id (a page another team owns). */
  selector?: string;
  /** Glide the page's compare slider once from "written" to "company reads" while the step shows. */
  glide?: boolean;
  /**
   * Text the lit element must contain, when a page carries several elements of one kind (two
   * invitations): the step means the one with these words.
   */
  targetText?: string;
  /**
   * The page shows the same thing at every story stage (the landing page), so the stage is set
   * while the step already shows, and the first card appears at once.
   */
  stageInBackground?: boolean;
  mode: TourMode;
  /**
   * The company Hiring mode acts as on this step. A visitor may have switched company before
   * the tour; the story still has to open Kaari's queue.
   */
  company?: string;
}

/** Whose screen it is, for the chip and its dot. Each person keeps one hue through the whole tour. */
export interface ModeChip {
  label: string;
  /** The person's hue, as a CSS colour. Identity, not data: it never appears in a chart. */
  hue: string;
}

/** The chip on the card, so a visitor always knows whose screen they are looking at. */
export const modeChip: Record<TourMode, ModeChip | null> = {
  seeker: { label: "Olena, looking for work", hue: "#d97706" },
  employer: { label: "Anna, Kaari Home Care", hue: "#7c3aed" },
  city: { label: "City of Espoo, the organiser", hue: "#2563eb" },
  start: null,
};

/**
 * The line the card shows while the screen changes hands, so the switch is understood. Null when
 * the next step is on the same person's screen or on nobody's.
 */
export function switchLine(from: TourMode, to: TourMode): string | null {
  if (from === to || to === "start") return null;
  if (to === "employer") return "Now the employer's side.";
  if (to === "city") return "Now the city's side.";
  return from === "start" ? "Now Olena's screen." : "Back to Olena.";
}

/** Which walkthrough runs: the one-minute overview (the default) or Olena's whole story. */
export type TourKind = "minute" | "story";

/** "See it in 2 minutes": one person's story from the landing page to the city view, about 12 seconds a step. */
export const storySteps: readonly TourStep[] = [
  {
    id: "meet-olena",
    title: "Meet Olena.",
    body: 'Doctor in Kyiv for 11 years. Now she cleans offices in Espoo. 140 applications, no interview. Her CV says "cleaner".',
    route: "/",
    stage: "before",
    target: "olena-story",
    stageInBackground: true,
    mode: "start",
  },
  {
    id: "skips-the-cv",
    title: "She skips the CV.",
    body: "Espoo companies post short real tasks, not job ads. Kaari Home Care needs a visit coordinator. The task takes 20 minutes.",
    route: "/seeker",
    stage: "before",
    target: "task-feed",
    mode: "seeker",
  },
  {
    id: "does-the-work",
    title: "She does the work.",
    body: "Two carers are off sick. Nine visits, six slots. Olena decides which visits stay. Then she explains one choice by voice.",
    route: `/passport/${STORY_PROOF}`,
    stage: "sent",
    target: "own-work",
    mode: "seeker",
  },
  {
    id: "name-stays",
    title: "Her name stays with her.",
    body: "Before anyone reads it, Workprint hides 7 details, like her name, her city and her university. Her voice is kept as text only.",
    route: `/passport/${STORY_PROOF}`,
    stage: "sent",
    target: "blind-proof",
    mode: "seeker",
  },
  {
    id: "anna-queue",
    title: "Anna opens her queue.",
    body: "Anna hires at Kaari Home Care. She sees work in the order it arrived. No names, no photos, no scores.",
    route: "/employer",
    stage: "sent",
    target: "queue",
    mode: "employer",
    company: DEFAULT_COMPANY_ID,
  },
  {
    id: "person-decides",
    title: "A person decides.",
    body: "Anna reads Proof K7, writes what she saw and asks to meet. No AI ranked anyone. A written answer is required, also for a no.",
    route: `/company/review/${STORY_PROOF}`,
    stage: "invited",
    target: "decision",
    mode: "employer",
    company: DEFAULT_COMPANY_ID,
  },
  {
    id: "olena-says-yes",
    title: "Olena says yes.",
    body: "She reads Anna's answer and accepts. Only now does Kaari see her name. Her earlier plan, which another employer could not use, reached Otso Health through Second look, with her consent.",
    route: "/seeker",
    stage: "met",
    target: "invitation",
    targetText: "Kaari Home Care",
    mode: "seeker",
  },
  {
    id: "espoo-sees",
    title: "Espoo sees what happened.",
    body: "Not sign-ups. Outcomes: written answers, meetings both sides confirmed, and 0 automated decisions.",
    route: "/city",
    stage: "met",
    target: "city-outcomes",
    mode: "city",
  },
  {
    id: "close",
    title: "Work first. Names last. People decide.",
    body: "That is Workprint. Explore it yourself, or do a task on your own phone.",
    route: "/city",
    mode: "start",
  },
];

/** Where "Explore on your own" leaves the sandbox: the default state for free exploring. */
export const EXPLORE_STAGE: StoryStage = "invited";

/**
 * The one-minute walkthrough: what it is, how it works on each side, why it is fair, and how to try
 * it. Steps 1 to 5 move on by themselves; the last one waits for the visitor.
 */
export const minuteSteps: readonly TourStep[] = [
  {
    id: "m-what",
    title: "Skip the CV. Do the work.",
    body: "An Espoo company posts a short real task. A professional does it. A person reads the work without the name and decides who to meet.",
    route: "/",
    // The landing page reads no story data, so the next step's stage is set behind it.
    stage: "sent",
    stageInBackground: true,
    target: "hero",
    selector: "#hero-title",
    mode: "start",
  },
  {
    id: "m-work",
    title: "The work, without the name.",
    body: "Olena was a doctor in Kyiv. Before anyone reads her plan, 7 details are hidden: her name, her city, her university.",
    route: `/passport/${STORY_PROOF}`,
    stage: "sent",
    target: "blind-proof",
    glide: true,
    mode: "seeker",
  },
  {
    id: "m-decide",
    title: "A person decides. In writing.",
    body: "Anna reads Proof K7 in arrival order. No score, no ranking. A written reason is required, also for a no.",
    route: `/company/review/${STORY_PROOF}`,
    stage: "invited",
    target: "decision",
    mode: "employer",
    company: DEFAULT_COMPANY_ID,
  },
  {
    id: "m-consent",
    title: "Names last.",
    body: "Olena reads Anna's words and accepts. Only now does the company see her name.",
    route: "/seeker",
    stage: "met",
    target: "invitation",
    targetText: "Kaari Home Care",
    mode: "seeker",
  },
  {
    id: "m-city",
    title: "Espoo sees outcomes.",
    body: "People who got a written answer, how fast it came, meetings both sides confirmed, and 0 automated decisions.",
    route: "/city",
    stage: "met",
    target: "city-outcomes",
    mode: "city",
  },
  {
    id: "m-try",
    title: "Now try it yourself.",
    body: "Do a 2-minute task on your phone, explore the three sides, or follow Olena's whole story.",
    route: "/city",
    mode: "start",
  },
];

/** The steps of each walkthrough and the name its card shows. */
export const tours: Record<TourKind, { steps: readonly TourStep[]; name: string }> = {
  minute: { steps: minuteSteps, name: "1-minute walkthrough" },
  story: { steps: storySteps, name: "Olena's story" },
};

/** The story's steps under their earlier name. */
export const tourSteps = storySteps;
