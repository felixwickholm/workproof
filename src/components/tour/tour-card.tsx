"use client";

import { ArrowRight, Pause, Play, X } from "lucide-react";
import { AnimatePresence, motion, useTransform, type MotionValue } from "motion/react";
import type { FocusEvent, KeyboardEvent, PointerEvent, Ref, RefObject } from "react";
import { cx } from "../ui/cx";
import { Spinner } from "../ui/spinner";
import { modeChip, tours, type TourKind, type TourMode, type TourStep } from "./steps";
import { counterText } from "./tour-machine";

interface Props {
  ref: Ref<HTMLDivElement>;
  kind: TourKind;
  step: TourStep;
  index: number;
  stepCount: number;
  /** The next step is being prepared: Next shows a spinner and waits. */
  busy: boolean;
  /** While the screen changes hands, the line that says so ("Now the employer's side."), else null. */
  handOver: string | null;
  /** The mode of the step being prepared, for the hand-over's dot. */
  comingMode: TourMode | null;
  /** The tallest the card may be on this screen; its text scrolls inside, the buttons stay. */
  maxHeight: number;
  reduce: boolean;
  nextRef: RefObject<HTMLButtonElement | null>;
  onNext: () => void;
  onBack: () => void;
  onClose: () => void;
  onExplore: () => void;
  onTry: () => void;
  /** Opens Olena's story from the last step of the one-minute walkthrough. */
  onStory: () => void;
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
        <motion.span
          className="absolute inset-0 origin-left rounded-full bg-label"
          style={state === "now" ? { scaleX } : { scaleX: 1, opacity: 0.45 }}
        />
      )}
    </span>
  );
}

/** Hover counts only for a mouse: a finger on a phone leaves no hover behind. */
const mouse = (event: PointerEvent) => event.pointerType === "mouse";

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/** Keeps Tab inside the card while the walkthrough is open. */
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

const pill = "press inline-flex h-11 items-center justify-center gap-2 rounded-full px-5 text-[16px] leading-5 font-semibold transition-colors duration-150";

/**
 * The walkthrough's card: whose screen this is, the step in big type, and the way on. Its content
 * crossfades between steps; the card itself is moved by the layer.
 */
export function TourCard({
  ref,
  step,
  index,
  stepCount,
  busy,
  handOver,
  comingMode,
  maxHeight,
  reduce,
  nextRef,
  onNext,
  onBack,
  onClose,
  onExplore,
  onTry,
  onStory,
  kind,
  progress,
  auto,
  paused,
  onTogglePause,
  onHover,
  onFocusHold,
}: Props) {
  const last = index === stepCount - 1;
  const chip = modeChip[handOver && comingMode ? comingMode : step.mode];
  const minute = kind === "minute";
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
      aria-describedby="tour-body"
      data-tour-kind={kind}
      tabIndex={-1}
      onKeyDown={trapTab}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerEnter={(event) => mouse(event) && onHover(true)}
      onPointerLeave={(event) => mouse(event) && onHover(false)}
      style={{ maxHeight }}
      className="flex flex-col rounded-card bg-raised shadow-float outline-none"
    >
      <div className="shrink-0 px-6 pt-5 max-[639px]:px-5 max-[639px]:pt-4">
        <div className="flex h-8 items-center justify-between gap-3">
          <span data-tour-counter className="text-footnote min-w-0 truncate font-medium text-label-2 tabular-nums">
            {tours[kind].name} · {counterText(index, stepCount)}
          </span>
          <button
            type="button"
            aria-label="Close the tour"
            onClick={onClose}
            className="press -mr-2 inline-flex size-9 shrink-0 items-center justify-center rounded-full text-label-2 transition-colors duration-150 hover:bg-fill hover:text-label"
          >
            <X aria-hidden className="size-[18px]" strokeWidth={1.8} />
          </button>
        </div>
        <div aria-hidden data-tour-progress className="mt-2 flex gap-1">
          {Array.from({ length: stepCount }, (_, i) => (
            <Segment key={i} state={i < index ? "done" : i === index ? "now" : "later"} progress={progress} auto={auto} />
          ))}
        </div>
        {chip ? (
          <span data-tour-chip className="text-footnote mt-4 inline-flex h-7 max-w-full min-w-0 items-center gap-2 rounded-full bg-fill pr-3 pl-2.5 font-medium text-label">
            <span aria-hidden className="size-2 shrink-0 rounded-full transition-colors duration-300" style={{ backgroundColor: chip.hue }} />
            <span className="truncate">{chip.label}</span>
          </span>
        ) : null}
      </div>

      <div data-tour-scroll className="relative min-h-0 overflow-y-auto overscroll-contain px-6 max-[639px]:px-5">
        <AnimatePresence initial={false} mode="popLayout">
          {handOver ? (
            <motion.p
              key={`hand-over-${handOver}`}
              role="status"
              initial={{
                opacity: 0,
                transform: reduce ? "none" : "translateY(6px)",
              }}
              animate={{ opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: EASE_OUT }}
              className="mt-4 mb-1 font-serif text-[30px] leading-[36px] tracking-[-0.01em] text-label"
            >
              {handOver}
            </motion.p>
          ) : (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, filter: "blur(2px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(2px)" }}
              transition={{ duration: reduce ? 0.12 : 0.16, ease: EASE_OUT }}
            >
              <h2 id="tour-title" className="mt-4 text-[22px] leading-7 font-semibold tracking-[-0.015em] text-balance text-label">
                {step.title}
              </h2>
              <p id="tour-body" className="mt-2 text-[17px] leading-[26px] text-pretty text-label-2">
                {step.body}
              </p>
              {last && minute ? (
                <div className="mt-5 flex flex-col gap-2">
                  <button type="button" onClick={onTry} className={cx(pill, "bg-accent text-accent-ink")}>
                    Do a 2-minute task
                  </button>
                  <button type="button" onClick={onExplore} className={cx(pill, "bg-fill text-label hover:bg-label/10")}>
                    Explore the demo
                  </button>
                  <button type="button" onClick={onStory} className={cx(pill, "bg-fill text-label hover:bg-label/10")}>
                    Olena&apos;s story · 2 min
                  </button>
                </div>
              ) : last ? (
                <div className="mt-6 flex flex-col gap-2.5 min-[640px]:flex-row">
                  <button type="button" autoFocus onClick={onExplore} className={cx(pill, "bg-accent text-accent-ink")}>
                    Explore on your own
                  </button>
                  <button type="button" onClick={onTry} className={cx(pill, "bg-fill text-label hover:bg-label/10")}>
                    Do a 2-minute task
                  </button>
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 px-6 pt-5 pb-6 max-[639px]:px-5 max-[639px]:pt-4 max-[639px]:pb-5">
        <div className="flex min-w-0 items-center">
          {minute && auto ? (
            <button
              type="button"
              onClick={onTogglePause}
              aria-label={paused ? "Play the walkthrough" : "Pause the walkthrough"}
              aria-pressed={paused}
              data-tour-pause
              className="press -ml-2.5 inline-flex size-11 items-center justify-center rounded-full text-label-2 transition-colors duration-150 hover:bg-fill hover:text-label"
            >
              {paused ? (
                <Play aria-hidden className="size-[18px]" strokeWidth={1.8} fill="currentColor" />
              ) : (
                <Pause aria-hidden className="size-[18px]" strokeWidth={1.8} fill="currentColor" />
              )}
            </button>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onBack}
            aria-disabled={busy || undefined}
            className={cx(pill, "px-3 text-label-2 hover:text-label", index === 0 && "invisible")}
          >
            Back
          </button>
          {last ? null : (
            <button
              ref={nextRef}
              type="button"
              onClick={onNext}
              aria-disabled={busy || undefined}
              className={cx(pill, "bg-accent pr-4 text-accent-ink", busy && "cursor-progress")}
            >
              Next
              {busy ? <Spinner /> : <ArrowRight aria-hidden className="size-[18px]" strokeWidth={2} />}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
