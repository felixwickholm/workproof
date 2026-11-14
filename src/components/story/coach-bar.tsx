"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, X } from "lucide-react";
import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { api } from "@/lib/client/api";
import { cx } from "../ui/cx";
import { StepProgress } from "../ui/step-progress";
import { fillSample } from "./fill-sample";
import { storySteps } from "./steps";
import { useStory } from "./story-provider";
import { useBottomClearance } from "./use-bottom-clearance";

const ease = [0.23, 1, 0.32, 1] as const;

/**
 * The guided story's glass bar. Docked above the page's own bottom bar on phones,
 * bottom right on desktop. It points at the page's action in words and never covers it.
 */
export function CoachBar() {
  const { state, next, close, start } = useStory();
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

  let body: ReactNode = null;
  if (state?.ended) {
    body = (
      <>
        <p className="text-title-3 font-bold">That is Tryout.</p>
        <p className="text-subhead mt-1 text-label-2">Real work in. A person decides. The city sees what happened.</p>
        <Actions>
          <Pill onClick={startAgain} disabled={resetting}>
            {resetting ? "Resetting" : "Start again"}
          </Pill>
          <Pill quiet onClick={close}>
            Close
          </Pill>
        </Actions>
      </>
    );
  } else if (step && state) {
    const hint = here ? step.hint?.(pathname) : undefined;
    body = (
      <>
        <p className="text-body font-medium text-pretty">{step.text}</p>
        {hint ? <p className="text-subhead mt-1 text-label-2 text-pretty">{hint}</p> : null}
        <Actions>
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

  const total = storySteps.length;
  const canSkip = Boolean(step && here && !step.next);
  const current = state ? (state.ended ? total : state.index) : 0;

  return (
    <AnimatePresence>
      {state ? (
        <motion.div
          ref={ref}
          role="region"
          aria-label="Story guide"
          aria-live="polite"
          className={cx(
            "glass highlight fixed inset-x-3 z-30 mx-auto max-w-[416px] rounded-card px-4 pt-3 pb-4",
            "min-[900px]:inset-x-auto min-[900px]:right-6 min-[900px]:w-[380px]",
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
          <div className="flex items-center gap-3">
            <p className="text-footnote tnum shrink-0 font-semibold text-label-2">
              {state.ended ? "The end" : `Step ${state.index + 1} of ${total}`}
            </p>
            <StepProgress total={total} current={current} className="max-w-none flex-1" />
            {canSkip ? (
              <button type="button" onClick={next} className="press text-footnote -mr-2 flex h-11 items-center px-2 font-semibold text-label-2">
                Skip
              </button>
            ) : null}
            <button
              type="button"
              onClick={close}
              aria-label="Close the story"
              className="press -mr-2 flex size-11 shrink-0 items-center justify-center text-label-2"
            >
              <X aria-hidden className="size-5" strokeWidth={2.2} />
            </button>
          </div>
          <motion.div
            key={state.ended ? "end" : state.index}
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2, ease }}
          >
            {body}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/** A row of pills; renders nothing when every child is empty. */
function Actions({ children }: { children: ReactNode }) {
  const items = Children.toArray(children);
  return items.length ? <div className="mt-3 flex flex-wrap gap-2">{items}</div> : null;
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
