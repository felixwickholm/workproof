"use client";

import { animate, AnimatePresence, useMotionValue, useReducedMotion } from "motion/react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useReducer, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { TOUR_EVENT } from "@/components/shell/demo-actions";
import { api } from "@/lib/client/api";
import { getIdentity, switchToPersona } from "@/lib/client/local";
import type { StoryStage } from "@/lib/domain/types";
import { autoAdvances, isHeld, noHolds, remainingMs, stepDuration, type Holds } from "./autoplay";
import { isOffParam, localStore, markStorySeen, shouldAutoStart, storySeen } from "./first-visit";
import { resolveRoute } from "./resolve-route";
import { bringIntoView, runStep, setStage, stagesSettled } from "./run-step";
import { EXPLORE_STAGE, startIndexOf, storySteps, type EndAction, type TourStep } from "./steps";
import { TourLayer } from "./tour-layer";
import { announcement, closedTour, tourReducer, type TourAction, type TourState } from "./tour-machine";
import { STORY_COMPANY } from "./story-ids";
import { stickyTop } from "./use-geometry";
import { useScrollLock } from "./use-scroll-lock";
import { findShown, waitUntilStill } from "./wait-for-target";
import { runWarmCall, usesTalentKey, warmCalls } from "./warm";

const steps = storySteps;
const reduceTour = (state: TourState, action: TourAction) => tourReducer(state, action, steps.length);
const noop = () => () => {};

/** A first step slower than this shows its card early, so the tap is never ignored. */
const REVEAL_AFTER_MS = 250;

/** Every page the story opens, each once, so they can all be fetched before the first move. */
const STORY_PATHS = [...new Set(steps.flatMap((step) => (step.route ? [resolveRoute(step.route)] : [])).filter((path): path is string => path !== null))];

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
 * Runs the guided story over the real app: Job seeker, Company, City of Espoo, then the end goal. It
 * starts by itself on a first visit to Mikko's home, on the `workproof:tour` event (a Show me button
 * starts at its view's chapter) or on a `?tour=` link. It drives the story stage and the pages itself;
 * the card is drawn once, outside the pages, so it stays in place across every page change. The page
 * underneath is inert while it runs.
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

  const start = useCallback(
    (at = 0) => {
      if (!document.querySelector("[data-tour-kind]")) {
        returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
        stage.current = null;
        // Every page of the story is fetched now, so no move waits for a page to download.
        for (const path of STORY_PATHS) router.prefetch(path);
      }
      // The story is Mikko's: a visitor on their own account follows it as him, so his pages open.
      if (getIdentity() === "me") switchToPersona();
      dispatch({ type: "start", at });
    },
    [router],
  );
  useEffect(() => {
    const onStart = (event: Event) => start(startIndexOf((event as CustomEvent<unknown>).detail));
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [start]);

  // A first visit to Mikko's home plays the story by itself, once per browser.
  useEffect(() => {
    const visit = {
      path: window.location.pathname,
      param: new URLSearchParams(window.location.search).get("tour"),
      seen: storySeen(localStore()),
      automated: navigator.webdriver === true,
    };
    if (shouldAutoStart(visit)) start(0);
    // Only the page the app opened on counts, so this runs once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const onCardHeight = useCallback((height: number) => {
    cardHeight.current = height;
  }, []);

  // Each move prepares its step; a newer move or a close abandons it.
  const pending = state.open ? state.pending : null;
  const run = state.open ? state.run : 0;
  const index = state.open ? state.index : 0;
  const revealed = state.open && state.revealed;
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
  }, [pending, run, index, router, reduce]);

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
  }, [settledIndex, router]);

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
    const duration = stepDuration(steps[settledIndex]);
    const controls = animate(progress, 1, {
      duration: remainingMs(duration, progress.get()) / 1000,
      ease: "linear",
      onComplete: () => dispatch({ type: "next" }),
    });
    return () => controls.stop();
  }, [ticking, settledIndex, run, progress]);

  // A page that is still loading data can push the target down after it was found. Once the step
  // has settled, a target that left the screen is brought back, smoothly.
  useEffect(() => {
    if (!settledTarget) return;
    const check = () => {
      const r = settledTarget.getBoundingClientRect();
      if (r.top < stickyTop() - 1 || r.top > window.innerHeight - 80) bringIntoView(settledTarget, { cardHeight: () => cardHeight.current, reduce, jump: false });
    };
    const timers = [250, 600, 1200, 2000, 3000].map((ms) => window.setTimeout(check, ms));
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [settledTarget, reduce]);

  // A page that polls its data can draw the lit element again; the spotlight follows the new one.
  const settledStep = settledIndex !== null ? steps[settledIndex] : null;
  useEffect(() => {
    if (!settledTarget || !settledStep?.target) return;
    const id = settledStep.target;
    const timer = window.setInterval(() => {
      if (settledTarget.isConnected) return;
      const again = findShown(id, window.location.pathname);
      if (again) setTarget(again);
    }, 300);
    return () => window.clearInterval(timer);
  }, [settledTarget, settledStep]);

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
      // Once closed or finished, the story never starts by itself again in this browser.
      markStorySeen(localStore());
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
  const onEnd = useCallback((action: EndAction) => close(action.href), [close]);

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
  // The chapter strip moves on as soon as the move starts: the hand-over is a caption, not a wait.
  const comingMode = coming && shown && coming.mode !== shown.mode ? coming.mode : null;
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
                  step={shown}
                  index={state.index}
                  stepCount={steps.length}
                  busy={state.pending !== null}
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

/**
 * `?tour=1` on any page starts the story, `?tour=seeker`, `employer` or `city` starts it at that
 * view's chapter, so a link or a QR code can open it. `?tour=0` opens the app without it.
 */
function StartFromLink({ onStart }: { onStart: (at: number) => void }) {
  const params = useSearchParams();
  const path = usePathname();
  const router = useRouter();
  const asked = params.get("tour");
  useEffect(() => {
    if (asked === null) return;
    const rest = new URLSearchParams(params);
    rest.delete("tour");
    const query = rest.toString();
    router.replace(query ? `${path}?${query}` : path, { scroll: false });
    if (isOffParam(asked)) markStorySeen(localStore());
    else onStart(startIndexOf(asked));
  }, [asked, params, path, router, onStart]);
  return null;
}
