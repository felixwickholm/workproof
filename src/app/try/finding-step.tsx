"use client";

import { motion, useReducedMotion } from "motion/react";
import { clipForDisplay, withArticle } from "./try-copy";

/**
 * The short wait while the task is made. A calm bar fills most of the way and waits there,
 * so a slow answer never looks finished before it is.
 */
export function FindingStep({ job }: { job: string }) {
  const reduce = useReducedMotion();
  return (
    <div role="status" className="flex flex-1 flex-col items-center justify-center pb-24 text-center">
      <p className="text-title-3 max-w-[22ch] font-semibold text-balance text-label">Finding a real task for {withArticle(clipForDisplay(job)).replace(/…$/, "")}…</p>
      <div aria-hidden className="mt-6 h-1 w-48 overflow-hidden rounded-full bg-fill">
        <motion.div
          className="h-full origin-left rounded-full bg-label"
          initial={{ transform: "scaleX(0.04)" }}
          animate={{ transform: "scaleX(0.86)" }}
          transition={{ duration: reduce ? 0 : 1.4, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>
      <p className="text-footnote mt-4 text-label-2">A short piece of real work, not a quiz.</p>
    </div>
  );
}
