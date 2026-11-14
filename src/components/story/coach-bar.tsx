"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, ChevronDown, ChevronUp, X } from "lucide-react";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/client/api";
import { cx } from "../ui/cx";
import { fillSample } from "./fill-sample";
import { storySteps } from "./steps";
import { useStory } from "./story-provider";
import { useBottomClearance } from "./use-bottom-clearance";

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * The guided story's glass bar. Docked above the page's own bottom bar on phones,
 * bottom right on desktop. It points at the page's action in words and never covers it.
 * It folds to a small pill on request and whenever the visitor starts typing.
 */
export function CoachBar() {
  const { state, next, close, start, setCollapsed } = useStory();
  const pathname = usePathname();
  const router = useRouter();
  const reduce = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const { clearance, hidden } = useBottomClearance(ref, Boolean(state));
  const [resetting, setResetting] = useState(false);

  // Reserve room under the page so its last lines can scroll clear of the bar.
  useEffect(() => {
    const el = ref.current;
    if (!state || !el) return;
    const observer = new ResizeObserver(() => {
      document.body.style.paddingBottom = `${el.offsetHeight + 16}px`;
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
      document.body.style.paddingBottom = "";
    };
  }, [state]);

  const step = state && !state.ended ? storySteps[state.index] : null;
  const here = step ? step.at(pathname) : false;

  async function startAgain() {
    setResetting(true);
    try {
      await api.resetDemo();
    } catch {
      // The story can still restart on the current data.
    }
    setResetting(false);
    start();
    router.push("/");
  }

  // Typing needs the room: fold the bar to its pill when the visitor taps or types in a field.
  // Autofocus and "Fill in her answer" do not count, so the instruction stays in view.
  useEffect(() => {
    if (!state) return;
    const fold = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (!e.isTrusted || !target || ref.current?.contains(target)) return;
      if (target.matches("input:not([type=checkbox]):not([type=radio]), textarea")) setCollapsed(true);
    };
    document.addEventListener("pointerdown", fold);
    document.addEventListener("input", fold);
    return () => {
      document.removeEventListener("pointerdown", fold);
      document.removeEventListener("input", fold);
    };
  }, [state, setCollapsed]);

  const total = storySteps.length;
  const collapsed = Boolean(state?.collapsed);
  const counter = state?.ended ? "The end" : `${(state?.index ?? 0) + 1} of ${total}`;

  const controls = (skip?: () => void) => (
    <Controls onSkip={skip} onCollapse={() => setCollapsed(true)} onClose={close} />
  );

  let body: ReactNode = null;
  if (state?.ended) {
    body = (
      <>
        <Line counter={counter}>
          <span className="font-semibold text-label">That is Tryout.</span>{" "}
          <span className="text-label-2">Real work in. A person decides. The city sees what happened.</span>
        </Line>
        <Actions trailing={controls()}>
          <Pill onClick={startAgain} disabled={resetting}>
            {resetting ? "Resetting" : "Start again"}
          </Pill>
        </Actions>
      </>
    );
  } else if (step && state) {
    const hint = here ? step.hint?.(pathname, { proofLabel: state.proofLabel }) : undefined;
    // Skipping the work itself would leave the later steps without her proof.
    const canSkip = here && !step.next && !step.sampleFill;
    body = (
      <>
        <Line counter={counter}>
          <span className="font-medium text-label">{step.text}</span>
          {hint ? <span className="text-label-2"> {hint}</span> : null}
        </Line>
        <Actions trailing={controls(canSkip ? next : undefined)}>
          {!here ? (
            <Pill href={step.go.href}>{step.go.label}</Pill>
          ) : step.next ? (
            <Pill
              onClick={() => {
                next();
                if (step.next?.href) router.push(step.next.href);
              }}
            >
              {step.next.label}
              <ArrowRight aria-hidden className="size-4" strokeWidth={2.2} />
            </Pill>
          ) : null}
          {here && step.sampleFill ? <Pill onClick={() => fillSample(reduce)}>Fill in her answer</Pill> : null}
        </Actions>
      </>
    );
  }

  return (
    <AnimatePresence>
      {state ? (
        <motion.div
          ref={ref}
          role="region"
          aria-label="Story guide"
          aria-live="polite"
          className={cx(
            "glass highlight fixed z-30",
            collapsed
              ? "right-3 rounded-full min-[900px]:right-6"
              : "inset-x-3 mx-auto max-w-[416px] rounded-card px-4 pb-1.5 min-[900px]:inset-x-auto min-[900px]:right-6 min-[900px]:w-[380px]",
            hidden && "pointer-events-none opacity-0",
          )}
          style={{
            // Denser than bar glass: this card floats over page text.
            background: "rgba(36, 36, 38, 0.96)",
            bottom: clearance > 0 ? `${clearance + 8}px` : "calc(12px + env(safe-area-inset-bottom, 0px))",
          }}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          animate={{ opacity: hidden ? 0 : 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.24, ease }}
        >
          {collapsed ? (
            <button
              type="button"
              onClick={() => setCollapsed(false)}
              aria-expanded={false}
              aria-label={`Story guide, step ${counter}. Show`}
              className="press text-footnote tnum flex h-11 items-center gap-1.5 rounded-full pr-3 pl-4 font-semibold text-label"
            >
              {state.ended ? "The end" : `Step ${counter}`}
              <ChevronUp aria-hidden className="size-4 text-label-2" strokeWidth={2.4} />
            </button>
          ) : (
            <motion.div
              key={state.ended ? "end" : state.index}
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease }}
            >
              {body}
            </motion.div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** The step and its hint in one short paragraph. */
function Line({ counter, children }: { counter: string; children: ReactNode }) {
  return (
    <p className="text-subhead pt-3 pb-1 text-pretty">
      <span className="tnum mr-1.5 font-semibold text-label-2">{counter}</span>
      {children}
    </p>
  );
}

/** Pills on the left, skip, fold and close on the right, all in one row. */
function Actions({ children, trailing }: { children: ReactNode; trailing: ReactNode }) {
  const items = Children.toArray(children);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {items}
      <div className="-mr-2 ml-auto flex shrink-0 items-center">{trailing}</div>
    </div>
  );
}

function Controls({ onSkip, onCollapse, onClose }: { onSkip?: () => void; onCollapse: () => void; onClose: () => void }) {
  return (
    <>
      {onSkip ? (
        <button type="button" onClick={onSkip} className="press text-footnote flex h-11 items-center px-3 font-semibold text-label-2">
          Skip
        </button>
      ) : null}
      <button
        type="button"
        onClick={onCollapse}
        aria-expanded
        aria-label="Fold the story guide"
        className="press flex size-11 items-center justify-center text-label-2"
      >
        <ChevronDown aria-hidden className="size-5" strokeWidth={2.2} />
      </button>
      <button type="button" onClick={onClose} aria-label="Close the story" className="press flex size-11 items-center justify-center text-label-2">
        <X aria-hidden className="size-5" strokeWidth={2.2} />
      </button>
    </>
  );
}

function Pill({
  children,
  href,
  onClick,
  quiet,
  disabled,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  quiet?: boolean;
  disabled?: boolean;
}) {
  const classes = cx(
    "press text-subhead inline-flex h-11 items-center gap-1.5 rounded-full px-5 font-semibold",
    quiet ? "text-label-2" : "bg-fill text-label",
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}
