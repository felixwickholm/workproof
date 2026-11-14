"use client";

import { animate, AnimatePresence, useMotionValue, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { DEFAULT_COMPANY_ID } from "@/components/company/company-choice";
import { TOUR_EVENT } from "@/components/shell/demo-actions";
import { api } from "@/lib/client/api";
import type { StoryStage } from "@/lib/domain/types";
import { fillRoute, resolveRoute } from "./resolve-route";
import { bringIntoView, runStep, setStage, stagesSettled } from "./run-step";
import { stickyTop } from "./use-geometry";
import { autoAdvances, isHeld, noHolds, remainingMs, stepDuration, type Holds } from "./autoplay";
import { glideCompare } from "./glide";
import { EXPLORE_STAGE, minuteSteps, storySteps, switchLine, tours, type TourKind, type TourStep } from "./steps";
import { TourLayer } from "./tour-layer";
import { announcement, closedTour, tourReducer, type TourAction, type TourState } from "./tour-machine";
import { useScrollLock } from "./use-scroll-lock";
import { runWarmCall, usesTalentKey, warmCalls } from "./warm";

const STEP_COUNTS = { minute: minuteSteps.length, story: storySteps.length };
const reduceTour = (state: TourState, action: TourAction) => tourReducer(state, action, STEP_COUNTS);
const noop = () => () => {};

/** A first step slower than this shows its card early, with a busy Next, so the tap is never ignored. */
const REVEAL_AFTER_MS = 250;
/** How long the card says whose side comes next, so the switch of screens is understood. */
export const SWITCH_MS = 600;

const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

/**
 * Asks for the next step's page and the data it reads while the visitor reads this one, so Next
 * feels instant. Data is only asked for when the next step keeps the story stage: a new stage gives
 * the persona a new key, and an old key would only be refused.
 */
async function warmNext(step: TourStep, next: TourStep | undefined, prefetch: (path: string) => void) {
  if (!next) return;
  const sameStage = !next.stage || next.stage === step.stage;
  try {
    // A stage set behind the current step (the landing page) must land first, or the warm-up
    // would ask for the old persona's proof.
    await stagesSettled();
    const session = await api.demoSession();
    const path = sameStage ? await resolveRoute(next.route) : fillRoute(next.route, null);
    if (path) prefetch(path);
    const ids = { talentId: session.persona.talentId, companyId: next.company ?? DEFAULT_COMPANY_ID };
    const calls = warmCalls(next.route).filter((call) => sameStage || !usesTalentKey(call));
    await Promise.allSettled(calls.map((call) => runWarmCall(call, ids)));
  } catch {
    // Warming is a courtesy; the step itself still loads what it needs.
  }
}

/**
 * Runs the walkthrough "See it in 2 minutes" over the real app. It starts on the `workprint:tour`
 * event or a `?tour=1` link, drives the story stage and the pages itself, and keeps nothing
 * between visits. The page underneath is inert while it runs.
 */
export function TourProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reduceTour, closedTour);
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;
  const mounted = useSyncExternalStore(noop, () => true, () => false);
  const stage = useRef<StoryStage | null>(null);
  const cardHeight = useRef(0);
  const nextRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  const start = useCallback((kind: TourKind = "minute") => {
    if (!document.querySelector("[data-tour-kind]")) {
      returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
      stage.current = null;
    }
    dispatch({ type: "start", kind });
  }, []);
  useEffect(() => {
    // The event's detail names the walkthrough; a plain event (the shell's menu) starts the one-minute one.
    const onStart = (event: Event) => start((event as CustomEvent<unknown>).detail === "story" ? "story" : "minute");
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [start]);
  const onCardHeight = useCallback((height: number) => {
    cardHeight.current = height;
  }, []);

  // Each move prepares its step; a newer move or a close abandons it.
  const pending = state.open ? state.pending : null;
  const run = state.open ? state.run : 0;
  const index = state.open ? state.index : 0;
  const revealed = state.open && state.revealed;
  const kind: TourKind = state.open ? state.kind : "minute";
  const steps = tours[kind].steps;
  useEffect(() => {
    if (pending === null) return;
    const controller = new AbortController();
    const step = steps[pending];
    const handOver = pending !== index && switchLine(steps[index].mode, step.mode) !== null;
    void Promise.all([
      runStep(step, {
        stage,
        navigate: (path) => router.push(path),
        refresh: () => router.refresh(),
        cardHeight: () => cardHeight.current,
        // The first step is prepared before the layer shows, so its scroll is never seen.
        jump: pending === index,
        reduce,
        signal: controller.signal,
      }),
      handOver ? wait(SWITCH_MS) : null,
    ]).then(([el]) => {
      if (controller.signal.aborted) return;
      setTarget(el);
      dispatch({ type: "arrived", run, found: el !== null });
    });
    return () => controller.abort();
  }, [pending, run, index, router, reduce, steps]);

  // A first step that takes a while still answers the tap quickly.
  const open = state.open;
  useEffect(() => {
    if (!open || revealed) return;
    const timer = window.setTimeout(() => dispatch({ type: "reveal" }), REVEAL_AFTER_MS);
    return () => window.clearTimeout(timer);
  }, [open, revealed]);

  // While a step is read, its successor's page and data are asked for.
  const settledIndex = state.open && state.pending === null ? state.index : null;
  useEffect(() => {
    if (settledIndex === null) return;
    void warmNext(steps[settledIndex], steps[settledIndex + 1], (path) => router.prefetch(path));
  }, [settledIndex, router, steps]);

  // The one-minute walkthrough moves on by itself. Its timer is the progress line: the line fills
  // over the step's time and Next follows when it is full. Anything that holds it stops the line.
  const progress = useMotionValue(0);
  const [holds, setHolds] = useState<Holds>(noHolds);
  const hold = useCallback((key: keyof Holds, on: boolean) => setHolds((h) => (h[key] === on ? h : { ...h, [key]: on })), []);
  useEffect(() => {
    const onVisible = () => hold("hidden", document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [hold]);
  // Every settled step starts its time from zero, after Next and Back alike.
  // While the next step loads, the line stays full, so the move reads as the line's doing.
  useEffect(() => {
    if (settledIndex !== null) progress.set(0);
  }, [settledIndex, run, progress]);
  const auto = state.open && autoAdvances(kind, state.index, steps.length, reduce);
  const ticking = auto && settledIndex !== null && !isHeld(holds);
  useEffect(() => {
    if (!ticking || settledIndex === null) return;
    const duration = stepDuration(steps[settledIndex]);
    const controls = animate(progress, 1, {
      duration: remainingMs(duration, progress.get()) / 1000,
      ease: "linear",
      onComplete: () => dispatch({ type: "next" }),
    });
    return () => controls.stop();
  }, [ticking, settledIndex, run, steps, progress]);

  // A page that is still loading data can push the target down after it was found. Once the step
  // has settled, a target that left the screen is brought back, smoothly.
  const settledLit = settledIndex !== null ? target : null;
  useEffect(() => {
    if (!settledLit) return;
    const check = () => {
      const r = settledLit.getBoundingClientRect();
      const top = stickyTop();
      if (r.top < top - 1 || r.top > window.innerHeight - 80) bringIntoView(settledLit, { cardHeight: () => cardHeight.current, reduce, jump: false });
    };
    const timers = [400, 1000, 2000].map((ms) => window.setTimeout(check, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [settledLit, reduce]);

  // The compare slider glides once from what she wrote to what the company reads.
  const settledTarget = settledIndex !== null && steps[settledIndex].glide ? target : null;
  useEffect(() => {
    if (!settledTarget || reduce) return;
    const controller = new AbortController();
    void glideCompare(settledTarget, controller.signal);
    return () => controller.abort();
  }, [settledTarget, reduce]);

  // The lit element carries a mark, so a check can tell which of several look-alikes is meant.
  useEffect(() => {
    if (!target) return;
    target.setAttribute("data-tour-lit", "");
    return () => target.removeAttribute("data-tour-lit");
  }, [target]);

  useScrollLock(open);

  /** Leaves the sandbox where free exploring starts, then optionally opens a page. */
  const close = useCallback(
    (then?: string) => {
      dispatch({ type: "close" });
      setTarget(null);
      setHolds(noHolds);
      // The page is inert until this close renders, so focus goes back a frame later.
      requestAnimationFrame(() => returnFocus.current?.focus({ preventScroll: true }));
      void setStage(EXPLORE_STAGE, { stage })
        .catch(() => false)
        .then((changed) => {
          if (then) router.push(then);
          else if (changed) router.refresh();
        });
    },
    [router],
  );

  const next = useCallback(() => dispatch({ type: "next" }), []);
  const back = useCallback(() => dispatch({ type: "back" }), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      const onButton = event.target instanceof HTMLElement && event.target.closest("button") !== null;
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight" || (event.key === "Enter" && !onButton)) next();
      else if (event.key === "ArrowLeft") back();
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, next, back]);

  // Focus starts on Next, so Enter and Space walk the story from the first step. The one-minute
  // walkthrough plays by itself: focus starts on the card, so only a keyboard user on a button holds it.
  useEffect(() => {
    if (!revealed) return;
    if (kind === "minute") document.querySelector<HTMLElement>("[data-tour-kind]")?.focus({ preventScroll: true });
    else nextRef.current?.focus({ preventScroll: true });
  }, [revealed, kind]);

  const shown = state.open ? steps[state.index] : null;
  const coming = state.open && state.pending !== null && state.pending !== state.index ? steps[state.pending] : null;
  const handOver = shown && coming ? switchLine(shown.mode, coming.mode) : null;
  return (
    <>
      <div className="contents" inert={open || undefined}>
        {children}
      </div>
      <Suspense fallback={null}>
        <StartFromLink onStart={start} />
      </Suspense>
      {mounted
        ? createPortal(
            <AnimatePresence>
              {state.open && state.revealed && shown ? (
                <TourLayer
                  key="tour"
                  target={state.spotlight ? target : null}
                  targetId={state.spotlight ? (shown.target ?? "") : ""}
                  handOver={handOver}
                  comingMode={coming?.mode ?? null}
                  moveKey={state.index}
                  onCardHeight={onCardHeight}
                  step={shown}
                  index={state.index}
                  stepCount={steps.length}
                  kind={kind}
                  progress={progress}
                  auto={auto}
                  paused={holds.paused}
                  onTogglePause={() => hold("paused", !holds.paused)}
                  onHover={(on) => hold("hover", on)}
                  onFocusHold={(on) => hold("focus", on)}
                  onStory={() => start("story")}
                  busy={state.pending !== null}
                  reduce={reduce}
                  nextRef={nextRef}
                  onNext={next}
                  onBack={back}
                  onClose={() => close()}
                  onExplore={() => close("/seeker")}
                  onTry={() => close("/try")}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
      <p aria-live="polite" className="sr-only">
        {state.open && state.pending === null && shown ? announcement(state.index, steps.length, shown.title) : ""}
      </p>
    </>
  );
}

/** The walkthrough a `?tour=` link asks for: `1` or `minute` for the one-minute one, `story` for Olena's. */
export function kindFromParam(value: string | null): TourKind | null {
  if (value === "1" || value === "minute") return "minute";
  if (value === "story") return "story";
  return null;
}

/** `?tour=1` (or `?tour=story`) on any page opens a walkthrough, so a link or a QR code can start it directly. */
function StartFromLink({ onStart }: { onStart: (kind: TourKind) => void }) {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const asked = kindFromParam(params.get("tour"));
  useEffect(() => {
    if (!asked) return;
    const rest = new URLSearchParams(params);
    rest.delete("tour");
    const query = rest.toString();
    router.replace(query ? `${path}?${query}` : path, { scroll: false });
    onStart(asked);
  }, [asked, params, path, router, onStart]);
  return null;
}
