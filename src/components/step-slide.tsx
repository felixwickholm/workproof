"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** One screen of a step flow. Enters from the side it comes from: forward from the right, back from the left. */
export function StepSlide({ stepKey, direction, children }: { stepKey: string | number; direction: 1 | -1; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      key={stepKey}
      initial={reduce ? { opacity: 0 } : { opacity: 0, x: 24 * direction }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: reduce ? 0.12 : 0.24, ease: [0.23, 1, 0.32, 1] }}
    >
      {children}
    </motion.div>
  );
}
