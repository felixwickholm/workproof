"use client";

import { ArrowRight, Pause, Play } from "lucide-react";
import { AnimatePresence, motion, useTransform, type MotionValue } from "motion/react";
import type { FocusEvent, KeyboardEvent, PointerEvent, Ref, RefObject } from "react";
import { cx } from "../ui/cx";
import { CHAPTERS, END_ACTIONS, type EndAction, type TourMode, type TourStep } from "./steps";
import { counterText } from "./tour-machine";

interface Props {
  ref: Ref<HTMLDivElement>;
  step: TourStep;
  index: number;
  stepCount: number;
  /** The next step is being prepared: Next waits, quietly. */
  busy: boolean;
  /** The chapter the move goes to while it runs, else null. The strip moves on at once. */
  comingMode: TourMode | null;
  /** The step has a target but none showed up, so the card sits on its own. */
  fallback: boolean;
  /** The tallest the card may be on this screen; its text scrolls inside, the buttons stay. */
  maxHeight: number;
  reduce: boolean;
  nextRef: RefObject<HTMLButtonElement | null>;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onEnd: (action: EndAction) => void;
  /** How far the current step's time has run, 0 to 1. Drawn as the line that fills. */
  progress: MotionValue<number>;
  /** The step moves on by itself: the line fills and Pause shows. */
  auto: boolean;
  /** The visitor pressed Pause. */
  paused: boolean;
  onTogglePause: () => void;
  /** A mouse rests on the card, or a keyboard user is on one of its buttons. */
  onHover: (on: boolean) => void;
  onFocusHold: (on: boolean) => void;
}

/** One segment of the progress line: done, the current one filling, or still to come. */
function Segment({ state, progress, auto }: { state: "done" | "now" | "later"; progress: MotionValue<number>; auto: boolean }) {
  const scaleX = useTransform(progress, (p) => (auto ? p : 1));
  return (
    <span className="relative h-[3px] min-w-0 flex-1 overflow-hidden rounded-full bg-label/15">
      {state === "later" ? null : (
        <motion.span className="absolute inset-0 origin-left rounded-full bg-label" style={state === "now" ? { scaleX } : { scaleX: 1, opacity: 0.45 }} />
      )}
    </span>
  );
}

/**
 * Where the story is: the three views and the goal, the current one lit. It moves on as soon as a
 * move to another view starts, so the hand-over reads as a caption, not a wait.
 */
function Chapters({ mode }: { mode: TourMode }) {
  const at = CHAPTERS.findIndex((chapter) => chapter.mode === mode);
  return (
    <ol data-tour-chapters aria-label="The story" className="flex min-w-0 items-center gap-1 overflow-hidden">
      {CHAPTERS.map((chapter, i) => (
        <li
          key={chapter.mode}
          aria-current={i === at ? "step" : undefined}
          className={cx(
            "shrink-0 rounded-full px-2.5 py-1 text-[13px] leading-[18px] font-semibold whitespace-nowrap transition-colors duration-200 ease-(--ease-out)",
            i === at ? "bg-accent text-accent-ink" : i < at ? "text-label" : "text-label-3",
            // Only the current chapter and its neighbours keep their names, so the strip never runs out of room.
            Math.abs(i - at) > 1 && "hidden",
          )}
        >
          {chapter.label}
        </li>
      ))}
    </ol>
  );
}

/** Hover counts only for a mouse: a finger on a phone leaves no hover behind. */
const mouse = (event: PointerEvent) => event.pointerType === "mouse";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Keeps Tab inside the card while the tour is open. */
function trapTab(event: KeyboardEvent<HTMLDivElement>) {
  if (event.key !== "Tab") return;
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>("button:not([disabled])")].filter((el) => el.offsetParent !== null);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

/** 52px tall on a phone, 44px on a laptop. */
const pill = "press inline-flex h-[52px] min-[640px]:h-11 shrink-0 items-center justify-center gap-2 rounded-full text-[17px] leading-5 font-semibold transition-colors duration-150";
const quiet = "text-label-2 hover:bg-fill hover:text-label";

/**
 * The tour's card: where the story is, one headline, a sentence or two on why, and the way on.
 * Nothing else: the screen behind it shows the rest. Its content crossfades between steps; the layer
 * moves it, and it stays mounted from the first step to the last.
 */
export function TourCard({
  ref,
  step,
  index,
  stepCount,
  busy,
  comingMode,
  fallback,
  maxHeight,
  reduce,
  nextRef,
  onNext,
  onBack,
  onSkip,
  onEnd,
  progress,
  auto,
  paused,
  onTogglePause,
  onHover,
  onFocusHold,
}: Props) {
  const last = index === stepCount - 1;
  // Only a keyboard user on a button holds the timer; a click leaves focus without the ring.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => onFocusHold(event.target instanceof HTMLElement && event.target.matches("button:focus-visible"));
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!(event.relatedTarget instanceof Node) || !event.currentTarget.contains(event.relatedTarget)) onFocusHold(false);
  };
  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby={step.body ? "tour-body" : undefined}
      data-tour-kind="story"
      data-tour-step={step.id}
      data-tour-fallback={fallback || undefined}
      tabIndex={-1}
      onKeyDown={trapTab}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerEnter={(event) => mouse(event) && onHover(true)}
      onPointerLeave={(event) => mouse(event) && onHover(false)}
      style={{ maxHeight }}
      className="flex flex-col rounded-card bg-raised shadow-float outline-none max-[639px]:rounded-b-none"
    >
      <div className="shrink-0 px-6 pt-5 max-[639px]:px-5 max-[639px]:pt-4">
        <div className="flex h-8 items-center justify-between gap-3">
          <Chapters mode={comingMode ?? step.mode} />
          <span data-tour-counter className="shrink-0 text-[14px] leading-5 font-medium text-label-2 tabular-nums">
            {counterText(index, stepCount)}
          </span>
        </div>
        <div aria-hidden data-tour-progress className="mt-3 flex gap-1">
          {Array.from({ length: stepCount }, (_, i) => (
            <Segment key={i} state={i < index ? "done" : i === index ? "now" : "later"} progress={progress} auto={auto} />
          ))}
        </div>
      </div>

      <div data-tour-scroll className="relative min-h-0 overflow-y-auto overscroll-contain px-6 max-[639px]:px-5">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, transform: reduce ? "none" : "translateY(4px)" }}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.12 : 0.2, ease: EASE_OUT }}
          >
            <h2 id="tour-title" className="mt-4 text-[26px] leading-8 font-semibold tracking-[-0.015em] text-balance text-label min-[640px]:text-[28px] min-[640px]:leading-[34px]">
              {step.title}
            </h2>
            {step.body ? (
              <p id="tour-body" className="mt-2 text-[19px] leading-7 text-pretty text-label-2 min-[640px]:text-[20px]">
                {step.body}
              </p>
            ) : null}
            {last ? (
              <div className="mt-5 flex flex-col gap-2">
                {END_ACTIONS.map((action, i) => (
                  <button
                    key={action.href}
                    type="button"
                    autoFocus={i === 0}
                    onClick={() => onEnd(action)}
                    className={cx(pill, "w-full px-5", i === 0 ? "bg-accent text-accent-ink" : "bg-fill text-label hover:bg-label/10")}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-1 px-6 pt-5 pb-6 max-[639px]:px-3 max-[639px]:pt-4 max-[639px]:pb-[calc(12px+env(safe-area-inset-bottom,0px))]">
        <button type="button" onClick={onSkip} data-tour-skip className={cx(pill, quiet, "-ml-3 px-3 max-[639px]:ml-0")}>
          {last ? "Close" : "Skip"}
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <button type="button" onClick={onBack} aria-disabled={busy || undefined} className={cx(pill, quiet, "px-3", index === 0 && "invisible")}>
            Back
          </button>
          {auto ? (
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={paused ? "Play the tour" : "Pause the tour"}
              aria-pressed={paused}
              data-tour-pause
              className={cx(pill, quiet, "w-[52px] min-[640px]:w-11")}
            >
              {paused ? <Play aria-hidden className="size-5" strokeWidth={1.75} /> : <Pause aria-hidden className="size-5" strokeWidth={1.75} />}
            </button>
          ) : null}
          {last ? null : (
            <button
              ref={nextRef}
              type="button"
              onClick={onNext}
              aria-disabled={busy || undefined}
              className={cx(pill, "ml-1 bg-accent pr-4 pl-5 text-accent-ink")}
            >
              Next
              <ArrowRight aria-hidden className="size-5" strokeWidth={1.75} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
