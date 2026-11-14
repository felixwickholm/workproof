/**
 * The guided story: one synthetic person, Leila, from first screen to city view.
 * A step advances by itself when the visitor reaches the right page or the data shows the action happened.
 */

/** Counts read from the visitor's own proofs, used to notice that an action happened. */
export type Signal = "proofs" | "meets" | "accepted";

export interface StoryStep {
  id: string;
  /** What happens and why it matters. One or two short sentences. */
  text: string;
  /** True when the visitor is on the page this step is about. */
  at: (path: string) => boolean;
  /** Where to go when the visitor is somewhere else. */
  go: { label: string; href: string };
  /** What to tap, in words. Never covers the page's own action. */
  hint?: (path: string) => string;
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
    id: "challenge",
    text: "A company posted a real task and what the reviewer will look for.",
    at: (p) => p === "/challenges" || isDetail(p),
    go: { label: "Open the challenges", href: "/challenges" },
    hint: (p) => (isDetail(p) ? "Tap Start below." : "Open the Tuulos Robotics card about a model evaluation."),
    leaveWhen: isWork,
  },
  {
    id: "work",
    text: "She does the work. AI is allowed. The task asks for judgment.",
    at: isWork,
    go: { label: "Open the task", href: "/challenges/ch-tuulos-ml/work" },
    hint: () => "Write an answer or fill in hers, then use the white button below until you submit.",
    signal: "proofs",
    sampleFill: true,
  },
  {
    id: "result",
    text: "This is all the company sees. No name, no school.",
    at: isWork,
    go: { label: "Open the company view", href: "/company/review" },
    next: { label: "Next", href: "/company/review" },
    leaveWhen: (p) => p.startsWith("/company"),
  },
  {
    id: "review",
    text: "Tuulos Robotics reads it blind and passes, with feedback. Another employer with the same skills takes a Second Look and says Meet.",
    at: (p) => p.startsWith("/company/review"),
    go: { label: "Open the company view", href: "/company/review" },
    hint: () => "Open her proof and pass. Switch company, then tap Meet.",
    signal: "meets",
  },
  {
    id: "passport",
    text: "Leila accepts. Only now do they see her name.",
    at: (p) => p.startsWith("/passport"),
    go: { label: "Open her proofs", href: "/passport" },
    hint: () => "Tap Accept on her proof.",
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
