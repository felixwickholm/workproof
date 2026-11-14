"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.23, 1, 0.32, 1] as const;

/**
 * "Proof K7 is Olena Kovalenko": the hidden name crossfades into the real one, once, when the
 * company first sees it after the person accepted. Opacity and a 4px rise only.
 */
export function NameReveal({ label, name, contact }: { label: string; name: string; contact: string }) {
  const reduce = useReducedMotion();
  const out = reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-4px)" };
  const from = reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(4px)" };
  return (
    <div>
      <p className="text-title-3 font-semibold text-balance text-label">
        {label} is{" "}
        <span className="inline-grid align-baseline">
          <motion.span
            aria-hidden
            className="col-start-1 row-start-1 text-label-2"
            initial={{ opacity: 1 }}
            animate={out}
            transition={{ duration: 0.24, delay: 0.3, ease: EASE }}
          >
            name hidden
          </motion.span>
          <motion.span
            className="col-start-1 row-start-1"
            initial={from}
            animate={{ opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.3, delay: 0.42, ease: EASE }}
          >
            {name || "a person who left no name"}
          </motion.span>
        </span>
      </p>
      <p className="text-subhead mt-1 text-label">{contact || "No contact given"}</p>
      <p className="text-footnote mt-1 text-label-2">Name shown because the person accepted.</p>
    </div>
  );
}
