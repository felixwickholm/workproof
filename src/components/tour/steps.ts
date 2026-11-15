import type { StoryStage } from "@/lib/domain/types";
import { STORY_CHALLENGE, STORY_COMPANY } from "./story-ids";

/** The three views the story walks through, in order. */
export type TourView = "seeker" | "employer" | "city";

/** The chapter a step belongs to: one of the three views, or the end goal that closes the story. */
export type TourMode = TourView | "goal";

/** Stands for the id of Mikko's story work in a route; filled in when the step runs. */
export const STORY_PROOF = "{storyProof}";

export interface TourStep {
  id: string;
  /** One short sentence: what is happening. */
  title: string;
  /** One or two short sentences: why it matters. The screen shows the rest. */
  body?: string;
  /** Where the step happens. May contain STORY_PROOF. Without one the step stays on the page it is on. */
  route?: string;
  /**
   * Other addresses of the same screen ("/" and "/seeker" both show Mikko's home). When the visitor
   * is on one of them and the target is there, the step stays put instead of opening `route`.
   */
  alsoOn?: readonly string[];
  /** The story stage the sandbox must be at; the server rebuilds it when it differs. */
  stage?: StoryStage;
  /** The `data-tour` id to spotlight, from the target contract in the v4 brief. Without one the card sits in the middle. */
  target?: string;
  /** What the tour does on the page before it looks for the target (it drafts a challenge, as Laura would). */
  act?: TourAct;
  /** The page reads no story data, so its stage is set while the step already shows. */
  stageInBackground?: boolean;
  mode: TourMode;
  /** On the first card of a view: a line that says which view the story is in now. */
  view?: string;
  /** The company the Company view acts as on this step, whatever company the visitor chose before. */
  company?: string;
}

/** An action the tour takes on a page, by name; run-step.ts carries it out. */
export type TourAct = "draftForRole";

/** The chapters as the card names them, in the order the story tells them. */
export const CHAPTERS: readonly { mode: TourMode; label: string }[] = [
  { mode: "seeker", label: "Job seeker" },
  { mode: "employer", label: "Company" },
  { mode: "city", label: "City of Espoo" },
  { mode: "goal", label: "The goal" },
];

/** Where a way out of the end card leads. */
export interface EndAction {
  label: string;
  /** The page it opens. */
  href: string;
}

const company = STORY_COMPANY;
const home = "/";
const homeToo = ["/seeker"] as const;
/** The work screen playing its sample session, so the walkthrough shows a challenge being done. */
const workSession = `/challenges/${STORY_CHALLENGE}/work?demo=1`;
const review = `/company/review/${STORY_PROOF}`;
const leaderboard = `/employer/challenges/${STORY_CHALLENGE}`;
const myWork = `/my-work/${STORY_PROOF}`;

/**
 * The one guided story, after Felix's video script: Mikko does a real challenge, Laura at Halla Supply
 * makes and scores it, the City of Espoo brings in companies hiring now and sees what came of it, and
 * the end goal. The story stage only moves forward, so the sandbox is rebuilt as few times as possible.
 */
export const storySteps: readonly TourStep[] = [
  {
    id: "s-mikko",
    view: "The job seeker view",
    title: "This is Mikko. He is looking for a job.",
    body: "He picks the kind of work he wants.",
    route: home,
    alsoOn: homeToo,
    stage: "before",
    target: "seeker-roles",
    mode: "seeker",
  },
  {
    id: "s-cards",
    title: "Companies in Espoo post real challenges.",
    body: "Each challenge is different for each job.",
    route: home,
    alsoOn: homeToo,
    stage: "before",
    target: "challenge-table",
    mode: "seeker",
  },
  {
    id: "s-pick",
    title: "He picks one from Halla Supply.",
    body: "Real work the new hire would do every day.",
    route: home,
    alsoOn: homeToo,
    stage: "before",
    target: "challenge-row",
    mode: "seeker",
  },
  {
    id: "s-do",
    title: "He does the work.",
    body: "He types it. Voice is coming soon.",
    route: workSession,
    stage: "before",
    target: "do-challenge",
    mode: "seeker",
  },
  {
    id: "s-think",
    title: "He writes down how he thinks.",
    body: "That is hard to fake, even with AI.",
    route: workSession,
    stage: "before",
    target: "think-aloud",
    mode: "seeker",
  },
  {
    id: "c-laura",
    view: "Now: the company view",
    title: "This is Laura at Halla Supply.",
    body: "She tells the AI who she needs.",
    route: "/company",
    stage: "sent",
    stageInBackground: true,
    target: "company-looking-for",
    mode: "employer",
    company,
  },
  {
    id: "c-draft",
    title: "The AI writes the challenge.",
    body: "She checks it, or writes her own.",
    route: "/company",
    stage: "sent",
    stageInBackground: true,
    act: "draftForRole",
    target: "draft",
    mode: "employer",
    company,
  },
  {
    id: "c-score",
    title: "She reads the work without his name.",
    body: "She gives points for each skill, with a reason.",
    route: review,
    stage: "sent",
    target: "score",
    mode: "employer",
    company,
  },
  {
    id: "c-invite",
    title: "She picks who to meet.",
    body: "She sees his name once he says yes.",
    route: review,
    stage: "sent",
    target: "invite",
    mode: "employer",
    company,
  },
  {
    id: "c-top",
    title: "Laura has a scorecard for each person.",
    body: "The best work first, by her own points.",
    route: leaderboard,
    stage: "invited",
    target: "top-work",
    mode: "employer",
    company,
  },
  {
    id: "y-hiring",
    view: "Now: the City of Espoo view",
    title: "The city sees who is hiring now.",
    body: "WorkProof reads public job ads.",
    route: "/city",
    stage: "met",
    target: "city-hiring-now",
    mode: "city",
  },
  {
    id: "y-make",
    title: "WorkProof makes a challenge from the ad.",
    body: "The city invites the company to try it.",
    route: "/city",
    stage: "met",
    target: "city-make-challenge",
    mode: "city",
  },
  {
    id: "y-results",
    title: "The city sees what came of it.",
    body: "Challenges done, people met, jobs found.",
    route: "/city",
    stage: "met",
    target: "city-funnel",
    mode: "city",
  },
  {
    id: "y-map",
    title: "And where in Espoo it happens.",
    body: "Companies and people on one map.",
    route: "/city",
    stage: "met",
    target: "city-map",
    mode: "city",
  },
  {
    id: "g-rules",
    title: "Built to meet the EU AI Act and GDPR.",
    body: "A named person gives every score. The AI never scores, ranks or decides.",
    route: review,
    stage: "met",
    target: "score",
    mode: "goal",
    company,
  },
  {
    id: "g-answer",
    title: "Mikko gets an answer for his work.",
    body: "9 of 10, a reason for each point, and a talk.",
    route: myWork,
    stage: "met",
    target: "my-score",
    mode: "goal",
  },
  {
    id: "g-end",
    title: "People get jobs for the work they can do.",
    body: "The AI helps. A person makes every choice.",
    mode: "goal",
  },
];

/**
 * The same story under its earlier name: `/for-judges` counts its cards. There is one tour now, so
 * the overview and the story are the same list.
 */
export const minuteSteps = storySteps;

/** The end card's ways on, the first one filled. */
export const END_ACTIONS: readonly EndAction[] = [
  { label: "Try it as Mikko", href: "/" },
  { label: "Try it as Laura", href: "/company" },
  { label: "See the city view", href: "/city" },
];

/** Where free exploring starts once the tour closes. */
export const EXPLORE_STAGE: StoryStage = "invited";

/** The first step of a view's chapter, where its Show me button starts the story. */
export function chapterStart(view: TourView): number {
  return storySteps.findIndex((step) => step.mode === view);
}

/**
 * Where a request starts the story. A view's name ("seeker", "employer", "city") starts at that
 * view's chapter; anything else ("1", the retired "minute" and "story") starts at the beginning, so
 * an old link or button still works.
 */
export function startIndexOf(value: unknown): number {
  return value === "seeker" || value === "employer" || value === "city" ? chapterStart(value) : 0;
}

/** The chapter label the card shows for a step. */
export function chapterLabel(mode: TourMode): string {
  return CHAPTERS.find((chapter) => chapter.mode === mode)?.label ?? "";
}
