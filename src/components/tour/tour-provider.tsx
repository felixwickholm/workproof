"use client";

import { animate, AnimatePresence, useMotionValue, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TOUR_EVENT } from "@/components/shell/demo-actions";
import { api } from "@/lib/client/api";
import type { StoryStage } from "@/lib/domain/types";
import { autoAdvances, isHeld, noHolds, remainingMs, stepDuration, type Holds } from "./autoplay";
import { offerDemo } from "./demo-offer";
import { glideCompare } from "./glide";
import { resolveRoute } from "./resolve-route";
import { bringIntoView, runStep, setStage, stagesSettled } from "./run-step";
import { EXPLORE_STAGE, TOUR_KINDS, tourKindOf, tours, type EndAction, type TourKind, type TourStep } from "./steps";
import type { Wait } from "./tour-card";
import { TourLayer } from "./tour-layer";
import { announcement, closedTour, tourReducer, type TourAction, type TourState } from "./tour-machine";
import { STORY_COMPANY } from "./story-ids";
import { stickyTop } from "./use-geometry";
import { useScrollLock } from "./use-scroll-lock";
import { findShown, waitUntilStill } from "./wait-for-target";
import { runWarmCall, usesTalentKey, warmCalls } from "./warm";

const STEP_COUNTS = Object.fromEntries(TOUR_KINDS.map((kind) => [kind, tours[kind].steps.length])) as Record<TourKind, number>;
const reduceTour = (state: TourState, action: TourAction) => tourReducer(state, action, STEP_COUNTS);
const noop = () => () => {};

/** A first step slower than this shows its card early, so the tap is never ignored. */
const REVEAL_AFTER_MS = 250;
/** A move shorter than this shows no spinner: most moves are, and a flash of one reads as lag. */
export const SPIN_AFTER_MS = 600;
/** A move longer than this says so in words, so a slow screen never looks like a stall. */
export const LOADING_LINE_AFTER_MS = 4000;

/**
 * Asks for the next step's page and the data it reads while the visitor reads this one, so the move
 * feels instant. Data is only asked for when the next step keeps the story stage: a new stage gives
 * the persona a new key, and an old key would only be refused.
 */
async function warmNext(step: TourStep, next: TourStep | undefined, prefetch: (path: string) => void) {
  if (!next?.route) return;
  const sameStage = !next.stage || next.stage === step.stage;
  try {
    // A stage set behind the current step must land first, or the warm-up would ask for the old persona's proof.
    await stagesSettled();
    const session = await api.demoSession();
    const path = resolveRoute(next.route);
    if (path) prefetch(path);
    const ids = { talentId: session.persona.talentId, companyId: next.company ?? STORY_COMPANY };
    const calls = warmCalls(next.route).filter((call) => sameStage || !usesTalentKey(call));
    await Promise.allSettled(calls.map((call) => runWarmCall(call, ids)));
  } catch {
    // Warming is a courtesy; the step itself still loads what it needs.
  }
}

/**
 * Runs the tours over the real app: the one-minute overview and the demo of each view. A tour starts
 * on the `workproof:tour` event or a `?tour=` link, drives the story stage and the pages itself, and
 * keeps nothing between visits. The page underneath is inert while it runs.
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
    const onStart = (event: Event) => start(tourKindOf((event as CustomEvent<unknown>).detail));
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
    void runStep(steps[pending], {
      stage,
      navigate: (path) => router.push(path),
      refresh: () => router.refresh(),
      cardHeight: () => cardHeight.current,
      // The first step is prepared before the layer shows, so its scroll is never seen.
      jump: pending === index,
      reduce,
      signal: controller.signal,
    }).then((el) => {
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

  // A move says nothing at first, shows a spinner after a moment and a plain line when it is slow.
  const [wait, setWait] = useState<{ run: number; wait: Wait }>({ run: 0, wait: "none" });
  useEffect(() => {
    if (pending === null) return;
    const timers = [
      window.setTimeout(() => setWait({ run, wait: "short" }), SPIN_AFTER_MS),
      window.setTimeout(() => setWait({ run, wait: "long" }), LOADING_LINE_AFTER_MS),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [pending, run]);
  const moveWait: Wait = pending !== null && wait.run === run ? wait.wait : "none";

  // While a step is read, its successor's page and data are asked for.
  const settledIndex = state.open && state.pending === null ? state.index : null;
  useEffect(() => {
    if (settledIndex === null) return;
    void warmNext(steps[settledIndex], steps[settledIndex + 1], (path) => router.prefetch(path));
  }, [settledIndex, router, steps]);

  // A step's time starts only once its target is on screen and has stopped moving.
  const [readyRun, setReadyRun] = useState(0);
  const settledTarget = settledIndex !== null ? target : null;
  useEffect(() => {
    if (settledIndex === null) return;
    const controller = new AbortController();
    void waitUntilStill(settledTarget, controller.signal).then(() => {
      if (!controller.signal.aborted) setReadyRun(run);
    });
    return () => controller.abort();
  }, [settledIndex, settledTarget, run]);
  const ready = settledIndex !== null && readyRun === run;

  // Every tour moves on by itself. Its timer is the progress line: the line fills over the step's
  // time and Next follows when it is full. Anything that holds it stops the line.
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
  const auto = state.open && autoAdvances(state.index, steps.length, reduce);
  const ticking = auto && ready && !isHeld(holds);
  useEffect(() => {
    if (!ticking || settledIndex === null) return;
    const duration = stepDuration(steps[settledIndex], kind);
    const controls = animate(progress, 1, {
      duration: remainingMs(duration, progress.get()) / 1000,
      ease: "linear",
      onComplete: () => dispatch({ type: "next" }),
    });
    return () => controls.stop();
  }, [ticking, settledIndex, run, steps, kind, progress]);

  // A page that is still loading data can push the target down after it was found. Once the step
  // has settled, a target that left the screen is brought back, smoothly.
  useEffect(() => {
    if (!settledTarget) return;
    const check = () => {
      const r = settledTarget.getBoundingClientRect();
      if (r.top < stickyTop() - 1 || r.top > window.innerHeight - 80) bringIntoView(settledTarget, { cardHeight: () => cardHeight.current, reduce, jump: false });
    };
    const timers = [400, 1000, 2000].map((ms) => window.setTimeout(check, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [settledTarget, reduce]);

  // A page that polls its data can draw the lit element again; the spotlight follows the new one.
  const settledStep = settledIndex !== null ? steps[settledIndex] : null;
  useEffect(() => {
    if (!settledTarget || !settledStep?.target) return;
    const { target: id, targetText, selector } = settledStep;
    const timer = window.setInterval(() => {
      if (settledTarget.isConnected) return;
      const again = findShown(id, window.location.pathname, targetText?.() || undefined, selector);
      if (again) setTarget(again);
    }, 300);
    return () => window.clearInterval(timer);
  }, [settledTarget, settledStep]);

  // The compare slider glides once from what she wrote to what the company reads.
  const glideTarget = settledIndex !== null && steps[settledIndex].glide ? target : null;
  useEffect(() => {
    if (!glideTarget || reduce) return;
    const controller = new AbortController();
    void glideCompare(glideTarget, controller.signal);
    return () => controller.abort();
  }, [glideTarget, reduce]);

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
          if (then && then !== window.location.pathname) router.push(then);
          else if (changed) router.refresh();
        });
    },
    [router],
  );
  const onEnd = useCallback(
    (action: EndAction) => {
      if (action.offer) {
        let session: Storage | undefined;
        try {
          session = window.sessionStorage;
        } catch {
          session = undefined;
        }
        offerDemo(action.offer, session);
      }
      close(action.href);
    },
    [close],
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

  // A tour that plays by itself starts with focus on the card, so only a keyboard user on a button
  // holds it. With reduced motion it waits for Next, so focus starts there.
  useEffect(() => {
    if (!revealed) return;
    if (reduce) nextRef.current?.focus({ preventScroll: true });
    else document.querySelector<HTMLElement>("[data-tour-kind]")?.focus({ preventScroll: true });
  }, [revealed, reduce]);

  const shown = state.open ? steps[state.index] : null;
  const coming = state.open && state.pending !== null && state.pending !== state.index ? steps[state.pending] : null;
  // The chip says whose screen comes next as soon as the move starts: the hand-over is a caption, not a wait.
  const comingMode = coming && shown && coming.mode !== shown.mode && coming.mode !== "start" ? coming.mode : null;
  const fallback = Boolean(state.open && state.pending === null && shown?.target && !state.spotlight);
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
                  moveKey={state.index}
                  onCardHeight={onCardHeight}
                  kind={kind}
                  step={shown}
                  index={state.index}
                  stepCount={steps.length}
                  busy={state.pending !== null}
                  wait={moveWait}
                  comingMode={comingMode}
                  fallback={fallback}
                  reduce={reduce}
                  nextRef={nextRef}
                  onNext={next}
                  onBack={back}
                  onSkip={() => close()}
                  onEnd={onEnd}
                  progress={progress}
                  auto={auto}
                  paused={holds.paused}
                  onTogglePause={() => hold("paused", !holds.paused)}
                  onHover={(on) => hold("hover", on)}
                  onFocusHold={(on) => hold("focus", on)}
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

/** The tour a `?tour=` link asks for: `1` (the overview), a tour's own name, or the retired `story`. */
export function kindFromParam(value: string | null): TourKind | null {
  if (value === null || value === "") return null;
  return tourKindOf(value);
}

/** `?tour=1` (or `?tour=seeker`, `employer`, `city`) on any page opens a tour, so a link or a QR code can start it. */
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
