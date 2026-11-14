"use client";

import { motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";

/**
 * One screen of a step flow. Enters from the side it comes from: forward from the right, back from the left.
 * When the step changes and nothing inside took focus, focus moves to the step's heading,
 * so keyboard and screen reader users start at the top of the new step.
 */
export function StepSlide({ stepKey, direction, children, className }: { stepKey: string | number; direction: 1 | -1; children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const shown = useRef(stepKey);

  useEffect(() => {
    if (shown.current === stepKey) return;
    shown.current = stepKey;
    const box = ref.current;
    if (!box || box.contains(document.activeElement)) return;
    const heading = box.querySelector<HTMLElement>("h1");
    if (!heading) return;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }, [stepKey]);

  return (
    <motion.div
      ref={ref}
      key={stepKey}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
