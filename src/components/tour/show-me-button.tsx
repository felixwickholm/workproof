"use client";

import { Play } from "lucide-react";
import { motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect } from "react";
import { startTour } from "../shell/demo-actions";
import { cx } from "../ui/cx";
import { localStore, takePulse } from "./first-visit";
import type { TourView } from "./steps";

/**
 * "Show me": starts the guided story at the chapter of the view it sits in, and plays on from there.
 * The first time a visitor opens the view in this browser it pulses gently twice, so it is found.
 */
export function ShowMeButton({ view, className }: { view: TourView; className?: string }) {
  const [scope, animate] = useAnimate<HTMLButtonElement>();
  const reduce = useReducedMotion();
  useEffect(() => {
    if (!takePulse(view, localStore()) || reduce) return;
    const controls = animate(scope.current, { scale: [1, 1.04, 1], opacity: [1, 0.85, 1] }, { duration: 0.9, delay: 0.6, repeat: 1, ease: [0.23, 1, 0.32, 1] });
    return () => controls.stop();
  }, [view, reduce, animate, scope]);

  return (
    <motion.button
      ref={scope}
      type="button"
      onClick={() => startTour(view)}
      // Motion owns this button's transform (the pulse), so the press is Motion's too.
      whileTap={reduce ? undefined : { scale: 0.97 }}
      data-show-me={view}
      className={cx(
        "inline-flex min-h-14 items-center gap-3 self-start rounded-[22px] bg-surface py-2 pr-5 pl-2 text-left transition-colors duration-150 hover:bg-fill",
        className,
      )}
    >
      <span aria-hidden className="flex size-10 shrink-0 items-center justify-center rounded-full bg-accent text-accent-ink">
        <Play className="size-[18px] translate-x-px" strokeWidth={1.75} />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-[17px] leading-6 font-semibold text-label">Show me</span>
        <span className="text-[15px] leading-5 text-label-2">The guided story, from here</span>
      </span>
    </motion.button>
  );
}
