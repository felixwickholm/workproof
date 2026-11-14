/**
 * The guided story: one synthetic person, Leila, from first screen to city view.
 * A step advances by itself when the visitor reaches the right page or the data shows the action happened.
 */

/** Counts read from the visitor's own proofs, used to notice that an action happened. */
export type Signal = "proofs" | "meets" | "accepted";

/** What the bar can read from the screen right now. */
export interface PageState {
  /** The label of the proof the visitor sent in the story. */
  proofLabel?: string;
  /** The page's enabled main button, by its label. */
  primary?: string;
  /** Empty fields that "Fill in her answer" can type into. */
  fillable: boolean;
  /** A selector or `text:Label` matches something on screen. */
  has: (target: string) => boolean;
  /** A selector matches anywhere, on screen or not. */
  exists: (selector: string) => boolean;
}

/** One instruction, naming something visible, and the one thing to ring. */
export interface Guide {
  hint?: string;
  /** A selector or `text:Label`; the bar rings the first match on screen. */
  target?: string;
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
  /** An informational step moves on with this button. `href` also navigates. */
  next?: { label: string; href?: string };
  /** Move on when the visitor reaches a page that belongs to the next step. */
  leaveWhen?: (path: string) => boolean;
  /** Move on when this count grows. */
  signal?: Signal;
  /** Offer to type Leila's answers into the page. */
  sampleFill?: boolean;
}

const isWork = (p: string) => /^\/challenges\/[^/]+\/work/.test(p);
const isDetail = (p: string) => /^\/challenges\/[^/]+$/.test(p);

const company = (name: string) => `[role="radio"][aria-label="${name}"]`;
const chosen = (name: string) => `${company(name)}[aria-checked="true"]`;
const row = (section: string, label: string) => `[data-section="${section}"] [data-story="${label}"]`;

/** Point at the page's own main button once it can be tapped. */
const tapPrimary = (page: PageState): Guide =>
  page.primary ? { hint: `Now tap ${page.primary}.`, target: "[data-primary]" } : {};

function reviewGuide(page: PageState): Guide {
  const proof = page.proofLabel ?? "her proof";
  const asTuulos = page.exists(chosen("Tuulos Robotics"));
  const asSaarnivo = page.exists(chosen("Saarnivo Grid"));
  // A proof is open with its decision buttons.
  if (page.has("text:Pass")) {
    if (asTuulos) return { hint: "Tap Pass and send a short note.", target: "text:Pass" };
    if (asSaarnivo) return { hint: "Tap Meet and say why.", target: "text:Meet" };
  }
  if (page.proofLabel && asTuulos && page.has(row("To review", proof))) {
    return { hint: `Open ${proof} under To review.`, target: row("To review", proof) };
  }
  if (page.proofLabel && asSaarnivo && page.has(row("Second look", proof))) {
    return { hint: `Open ${proof} under Second look.`, target: row("Second look", proof) };
  }
  if (asTuulos && page.has(company("Saarnivo Grid"))) {
    return { hint: "Tuulos has decided. Switch to Saarnivo at the top.", target: company("Saarnivo Grid") };
  }
  if (page.has(company("Tuulos Robotics"))) return { hint: "Switch to Tuulos at the top.", target: company("Tuulos Robotics") };
  return { hint: "Go back to the queue." };
}

export const storySteps: StoryStep[] = [
  {
    id: "intro",
    text: "Leila is an ML engineer. 140 applications, no interviews. Today she skips the CV.",
    at: (p) => p === "/",
    go: { label: "Back to the start", href: "/" },
    next: { label: "Show me", href: "/challenges" },
    leaveWhen: (p) => p.startsWith("/challenges"),
  },
  {
    id: "task",
    text: "A company posted a real task and what the reviewer will look for.",
    at: (p) => p === "/challenges" || isDetail(p),
    go: { label: "Open the tasks", href: "/challenges" },
    guide: (p) =>
      isDetail(p)
        ? { hint: "Tap Start below.", target: "[data-primary]" }
        : { hint: "Open the Tuulos Robotics task about a model evaluation.", target: '[data-story="task-ch-tuulos-ml"]' },
    leaveWhen: isWork,
  },
  {
    id: "work",
    text: "She does the work. AI is allowed. The task asks for judgment.",
    at: isWork,
    go: { label: "Open the task", href: "/challenges/ch-tuulos-ml/work" },
    guide: (_, page) => (page.fillable ? { hint: "Tap Fill in her answer, or write your own." } : tapPrimary(page)),
    signal: "proofs",
    sampleFill: true,
  },
  {
    id: "result",
    text: "This is all the company sees. No name, no school.",
    at: isWork,
    go: { label: "Open the company view", href: "/company/review" },
    guide: () => ({ hint: "Tap Next here to see the company side." }),
    next: { label: "Next", href: "/company/review" },
    leaveWhen: (p) => p.startsWith("/company"),
  },
  {
    id: "review",
    text: "Tuulos Robotics reads it blind and passes. Saarnivo Grid needs the same skills, takes a Second look and says Meet.",
    at: (p) => p.startsWith("/company/review"),
    go: { label: "Open the company view", href: "/company/review" },
    guide: (_, page) => reviewGuide(page),
    signal: "meets",
  },
  {
    id: "passport",
    text: "Leila accepts. Only now do they see her name.",
    at: (p) => p.startsWith("/passport"),
    go: { label: "Open her proofs", href: "/passport" },
    guide: () => ({ hint: "Tap Accept on her proof.", target: "text:Accept" }),
    signal: "accepted",
    leaveWhen: (p) => p.startsWith("/city"),
  },
  {
    id: "city",
    text: "The city sees real outcomes. Zero automated decisions.",
    at: (p) => p.startsWith("/city"),
    go: { label: "Open the city view", href: "/city" },
    next: { label: "Finish" },
  },
];

/** Synthetic answers for the robotics model-evaluation task. */
export const sampleAnswers = {
  work: "The 97% is not trustworthy yet. Each grasp gives about 30 frames, and the split shuffles frames, so frames from the same grasp land in both train and test. The model is partly tested on what it has already seen. The threshold is also picked on the test set, which makes the number look better again. And with only 4% failed grasps, a model that always says held gets 96%, so accuracy hides what matters. I would split by grasp attempt or by day, choose the threshold on a separate validation set, and report how many dropped grasps it catches. Then decide on Monday.",
  explain:
    "I looked at how the test set was built before looking at the number. A dropped grasp is the costly case, so I care most about catching those, not overall accuracy. If the team needs a quick check, re-running the split by grasp attempt takes an hour and tells us if the 97% holds.",
  name: "Leila Haddad",
  contact: "leila.haddad@example.com",
};
