/**
 * The guided story: one synthetic person, Leila, from the task list to the city view.
 * A step advances by itself when the visitor reaches the right page or the data shows the action happened.
 * Every screen that needs text has a "Fill in" action, so the whole story runs without typing.
 */

/** Counts read from the visitor's own proofs, used to notice that an action happened. */
export type Signal = "proofs" | "passes" | "meets" | "accepted";

export const TUULOS = "co-tuulos";
export const SAARNIVO = "co-saarnivo";
const TASK = "ch-tuulos-ml";

/** One named reviewer per company, so the two decisions are visibly two different people. */
export const storyReviewers: Record<string, string> = {
  [TUULOS]: "Anna Koivisto",
  [SAARNIVO]: "Mira Salo",
};

/** What the bar can read from the screen right now. */
interface PageState {
  /** The proof the visitor sent in the story. */
  proofLabel?: string;
  /** The page's enabled main button, by its label. */
  primary?: string;
  /** The name of the open dialog, if any. */
  dialog?: string;
  /** The first empty story field on screen ("answer", "explain-0", "note-pass"...). */
  fillable?: string;
  /** The first name in the reviewer field, once it holds one. */
  reviewerFirst?: string;
  /** A selector or `text:Label` matches something on screen. */
  has: (target: string) => boolean;
  /** A selector matches anywhere, on screen or not. */
  exists: (selector: string) => boolean;
}

/** What the guide's own button does. The bar supplies navigation and the sample answers. */
export type ActionKind = "fill" | "tuulos" | "saarnivo" | "passport";

/** One instruction, naming something visible, the one thing to ring, or the guide's own button. */
export interface Guide {
  hint?: string;
  /** A selector or `text:Label`; the bar rings the first match on screen. */
  target?: string;
  /** When set, the guide's button is the one main action and the page's button steps back. */
  action?: { label: string; kind: ActionKind };
}

export interface StoryStep {
  id: string;
  /** What happens and why it matters. One or two short sentences. */
  text: string;
  /** True when the visitor is on the page this step is about. */
  at: (path: string) => boolean;
  /** Where to go when the visitor is somewhere else. */
  go: { label: string; href: string };
  /** What to tap, in words, and what to ring. Reads the screen, so it always names what is visible. */
  guide?: (path: string, page: PageState) => Guide;
  /** Move on when the visitor reaches a page that belongs to the next step. */
  leaveWhen?: (path: string) => boolean;
  /** Move on when this count grows. */
  signal?: Signal;
  /** The last step: no further action, only Start again. */
  final?: boolean;
}

const isWork = (p: string) => /^\/challenges\/[^/]+\/work/.test(p);
const isDetail = (p: string) => /^\/challenges\/[^/]+$/.test(p);
const chosen = (name: string) => `[role="radio"][aria-label="${name}"][aria-checked="true"]`;

/** Point at the page's own main button once it can be tapped. The guide then has no button. */
const tapPrimary = (page: PageState): Guide =>
  page.primary ? { hint: `Tap ${page.primary}.`, target: "[data-primary]" } : {};

const fill = (label: string, hint?: string): Guide => ({ hint, action: { label, kind: "fill" } });

function workGuide(page: PageState): Guide {
  if (page.dialog === "Submit your proof") {
    return { hint: "Tap Submit.", target: '[aria-modal="true"] [data-primary]' };
  }
  switch (page.fillable) {
    case "answer":
      return fill("Fill in her answer");
    case "explain-0":
    case "explain-1":
      return fill("Fill in her reply", "Two questions about her own answer show the reviewer how she thinks.");
    case "name":
    case "contact":
      return fill("Fill in her details", "Her name stays hidden. Filling in also turns on Second look, so other employers can see her proof.");
  }
  return tapPrimary(page);
}

function tuulosGuide(page: PageState): Guide {
  const reviewer = page.reviewerFirst ?? storyReviewers[TUULOS].split(" ")[0];
  if (page.dialog?.startsWith("Pass on") && page.fillable) {
    return fill(`Fill in ${reviewer}'s note`, "She explains the pass, so nobody is left without an answer.");
  }
  if (page.dialog === "Feedback sent") return { action: { label: "Open it at Saarnivo", kind: "saarnivo" } };
  if (page.exists(chosen("Tuulos Robotics")) && page.has("text:Pass")) {
    return { hint: "Tuulos filled the role this week. Tap Pass.", target: "text:Pass" };
  }
  return { action: { label: "Open her proof at Tuulos", kind: "tuulos" } };
}

function saarnivoGuide(page: PageState): Guide {
  const reviewer = page.reviewerFirst ?? storyReviewers[SAARNIVO].split(" ")[0];
  if (page.dialog?.startsWith("Meet") && page.fillable) return fill(`Fill in ${reviewer}'s note`);
  if (page.dialog === "Invitation sent") return { action: { label: "Open her proofs", kind: "passport" } };
  if (page.exists(chosen("Saarnivo Grid")) && page.has("text:Meet")) {
    return { hint: "Tap Meet.", target: "text:Meet" };
  }
  return { action: { label: "Open it at Saarnivo", kind: "saarnivo" } };
}

export const storySteps: StoryStep[] = [
  {
    id: "task",
    text: "Leila is an ML engineer. 140 applications, no interviews. Today she skips the CV.",
    at: (p) => p === "/challenges" || isDetail(p),
    go: { label: "Open the tasks", href: "/challenges" },
    guide: (p, page) =>
      page.has(`[data-story="start-${TASK}"]`)
        ? { hint: "Tap Start.", target: `[data-story="start-${TASK}"]` }
        : isDetail(p)
          ? { hint: "Tap Start.", target: "[data-primary]" }
          : { hint: "Open the Tuulos Robotics task.", target: `[data-story="task-${TASK}"]` },
    leaveWhen: isWork,
  },
  {
    id: "work",
    text: "She does the work. AI is allowed.",
    at: isWork,
    go: { label: "Open the task", href: `/challenges/${TASK}/work` },
    guide: (_, page) => workGuide(page),
    signal: "proofs",
  },
  {
    id: "result",
    text: "This is all the company sees. No name, no school.",
    at: isWork,
    go: { label: "Open the company side", href: "/company/review" },
    guide: () => ({ action: { label: "See the company side", kind: "tuulos" } }),
    leaveWhen: (p) => p.startsWith("/company"),
  },
  {
    id: "tuulos",
    text: "Tuulos Robotics reads her work without her name.",
    at: (p) => p.startsWith("/company/review"),
    go: { label: "Open the company side", href: "/company/review" },
    guide: (_, page) => tuulosGuide(page),
    signal: "passes",
  },
  {
    id: "second",
    text: "Leila agreed to a Second look. Saarnivo Grid needs the same skills.",
    at: (p) => p.startsWith("/company/review"),
    go: { label: "Open the company side", href: "/company/review" },
    guide: (_, page) => saarnivoGuide(page),
    signal: "meets",
  },
  {
    id: "passport",
    text: "Saarnivo wants to meet. Leila accepts. Only now do they see her name.",
    at: (p) => p.startsWith("/passport"),
    go: { label: "Open her proofs", href: "/passport" },
    guide: () => ({ hint: "Tap Accept.", target: "text:Accept" }),
    signal: "accepted",
    leaveWhen: (p) => p.startsWith("/city"),
  },
  {
    id: "city",
    text: "The city sees every decision. People made all of them. None were automated.",
    at: (p) => p.startsWith("/city"),
    go: { label: "Open the city view", href: "/city" },
    final: true,
  },
];

/** Synthetic answers for the robotics model-evaluation task, one per field. */
export const sampleAnswers: Record<string, string> = {
  answer:
    "The 97% is not trustworthy yet. Each grasp gives about 30 frames, and the split shuffles frames, so frames from the same grasp land in both train and test. The model is partly tested on what it has already seen. The threshold is also picked on the test set, which makes the number look better again. And with only 4% failed grasps, a model that always says held gets 96%, so accuracy hides what matters. I would split by grasp attempt or by day, choose the threshold on a separate validation set, and report how many dropped grasps it catches. Then decide on Monday.",
  "explain-0":
    "The split decides whether any other number can be trusted. If frames from one grasp sit in both train and test, the 97% measures memory, not grasping. To check, I would re-run the evaluation with a split by grasp attempt and compare the two numbers.",
  "explain-1":
    "I would keep only the split by grasp attempt and report how many dropped grasps the model catches. The threshold and the full write-up can wait. That one check tells the team on Monday if the 97% holds.",
  name: "Leila Haddad",
  contact: "leila.haddad@example.com",
  "note-pass":
    "We filled this role on Thursday. Your point about splitting by grasp attempt was clear and correct, so I am passing it on.",
  "note-meet":
    "You checked how the test set was built before trusting the number. Our heat demand forecasts have the same trap. I would like to hear how you would set up the split for us.",
};
