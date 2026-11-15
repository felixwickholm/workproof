import { setCompanyChoice } from "@/components/company/company-choice";
import { RESET_EVENT } from "@/components/shell/demo-actions";
import { api } from "@/lib/client/api";
import type { StoryStage } from "@/lib/domain/types";
import { CARD_HEIGHT_GUESS, PHONE_MAX, scrollFor, type Box } from "./placement";
import { resolveRoute } from "./resolve-route";
import type { TourAct, TourStep } from "./steps";
import { stickyTop, visibleSize } from "./use-geometry";
import { findShown, TARGET_TIMEOUT_MS, waitForTarget, waitUntilStill } from "./wait-for-target";

interface StepContext {
  /** The stage the sandbox is at, as far as the tour knows. Null before the tour set one. */
  stage: { current: StoryStage | null };
  navigate: (path: string) => void;
  refresh: () => void;
  /** The card's height now, so the scroll leaves room for it. Zero before the card is drawn. */
  cardHeight: () => number;
  /**
   * Scroll in one jump: before the layer is first shown, and when the page changed under the
   * card. Only a move within one page scrolls smoothly, so the visitor sees where it went.
   */
  jump: boolean;
  reduce: boolean;
  signal: AbortSignal;
}

/** Stage changes run one after another, so a close never lands before the step it interrupted. */
let stageQueue: Promise<unknown> = Promise.resolve();

/** Resolves once every stage change asked for so far has landed (or failed). */
export const stagesSettled = () => stageQueue;

/** Moves the sandbox to a stage and tells the pages to fetch again. True when it changed. */
export function setStage(stage: StoryStage, ctx: Pick<StepContext, "stage">): Promise<boolean> {
  const change = stageQueue.then(async () => {
    if (ctx.stage.current === stage) return false;
    await api.storyStage(stage);
    ctx.stage.current = stage;
    window.dispatchEvent(new Event(RESET_EVENT));
    return true;
  });
  stageQueue = change.catch(() => false);
  return change;
}

/** Scrolls the page so the target and the card both fit on screen. */
export function bringIntoView(el: HTMLElement, ctx: Pick<StepContext, "cardHeight" | "reduce" | "jump">) {
  const r = el.getBoundingClientRect();
  const { width, height } = visibleSize();
  const view = { width, height, top: stickyTop(), bottom: 0 };
  const target: Box = { x: r.left, y: r.top + window.scrollY, width: r.width, height: r.height };
  const max = document.documentElement.scrollHeight - height;
  // On a phone the card docks over the lower part of the screen; budget its height there too.
  const measured = ctx.cardHeight() || CARD_HEIGHT_GUESS;
  const card = view.width < PHONE_MAX ? measured : Math.min(measured, view.height / 2);
  const top = scrollFor(view, target, card, max);
  if (Math.abs(top - window.scrollY) > 1) window.scrollTo({ top, behavior: ctx.reduce || ctx.jump ? "instant" : "smooth" });
}

/** What the story company tells the assistant, as its starter chip on the new challenge screen says it. */
const STORY_START = /^\s*A designer to make our order form easier to use/i;
/** The answer to the assistant's size question. */
const STORY_SIZE = /^\s*10 to 30 minutes\s*$/i;

const nextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

/** The button inside `root` whose words match, if it is there and can be pressed. */
function buttonSaying(root: HTMLElement, words: RegExp): HTMLButtonElement | null {
  return [...root.querySelectorAll<HTMLButtonElement>("button")].find((b) => words.test(b.textContent ?? "") && !b.disabled && b.getAttribute("aria-disabled") !== "true") ?? null;
}

/**
 * What the tour does on a page, as the person in the story would: Laura tells the assistant what she needs
 * and answers its question. Each one only presses buttons a person could press; when the page does not have them,
 * it does nothing and the card shows in the middle.
 */
const ACTS: Record<TourAct, (path: string, signal: AbortSignal) => Promise<void>> = {
  async draftForRole(path, signal) {
    const box = await waitForTarget("company-looking-for", path, signal);
    if (!box || signal.aborted) return;
    buttonSaying(box, STORY_START)?.click();
    // The assistant asks how big the challenge should be; Laura picks the short one, and the draft follows.
    for (let i = 0; i < 600 && !signal.aborted; i++) {
      const size = buttonSaying(box, STORY_SIZE);
      if (size) return size.click();
      await nextFrame();
    }
  },
};

/** The visitor is on one of the step's other addresses ("/seeker" for "/"), and its target is there. */
function onSameScreen(step: TourStep): boolean {
  const here = window.location.pathname;
  if (!step.alsoOn?.includes(here)) return false;
  return !step.target || findShown(step.target, here) !== null;
}

/**
 * Prepares one step: sets its story stage, opens its page, waits for its target and scrolls to it.
 * Resolves with the target, or null when the step has none or it did not show up in time; the
 * card then sits in the middle, so a missing piece never stops the walkthrough.
 */
export async function runStep(step: TourStep, ctx: StepContext): Promise<HTMLElement | null> {
  try {
    const staging = step.stage ? setStage(step.stage, ctx) : Promise.resolve(false);
    // A page that reads no story data shows at once; its stage is set behind it.
    if (step.stageInBackground) void staging.catch(() => false);
    const changed = step.stageInBackground ? false : await staging;
    if (ctx.signal.aborted) return null;
    if (step.company) setCompanyChoice(step.company);
    // A step without a route (the end card) stays on the page it is on, and so does a step whose
    // screen is already open under another of its addresses.
    const here = window.location.pathname + window.location.search;
    const url = step.route && !onSameScreen(step) ? resolveRoute(step.route) : here;
    if (ctx.signal.aborted || !url) return null;
    const path = url.split("?")[0];
    const moved = url !== here;
    if (moved) ctx.navigate(url);
    else if (changed) ctx.refresh();
    if (step.act) await ACTS[step.act](path, ctx.signal);
    if (!step.target || ctx.signal.aborted) return null;
    const el = await waitForTarget(step.target, path, ctx.signal, TARGET_TIMEOUT_MS);
    if (el && !ctx.signal.aborted) {
      bringIntoView(el, { ...ctx, jump: ctx.jump || moved });
      // The card moves only once the page has stopped scrolling, so it never lands twice.
      await waitUntilStill(el, ctx.signal, 0);
    }
    return el;
  } catch {
    return null;
  }
}
