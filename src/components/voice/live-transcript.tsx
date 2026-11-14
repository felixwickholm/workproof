"use client";

import { motion, useReducedMotion } from "motion/react";
import { Fragment, useState } from "react";
import { words } from "@/lib/voice/copy";
import { cx } from "@/components/ui/cx";

const STAGGER_S = 0.03;
const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * The words as they are heard, in 20px text. Settled words are in full ink; words the engine may
 * still change are muted. Each new word fades and rises 8px, 30ms after the one before it.
 */
export function LiveTranscript({ text, interim, placeholder }: { text: string; interim: string; placeholder: string }) {
  const reduce = useReducedMotion();
  const settled = words(text);
  const all = [...settled, ...words(interim)];

  // New words stagger from the first one that was not on screen in the last render.
  const [shown, setShown] = useState(all.length);
  const [firstNew, setFirstNew] = useState(0);
  if (all.length !== shown) {
    setFirstNew(Math.min(shown, all.length));
    setShown(all.length);
  }

  return (
    <p className="min-h-[84px] text-[20px] leading-[28px] tracking-[-0.01em] text-label">
      {all.length === 0 ? <span className="text-label-2">{placeholder}</span> : null}
      {all.map((word, i) => (
        <Fragment key={i}>
          {i > 0 ? " " : null}
          <motion.span
            className={cx("inline-block transition-colors duration-200", i < settled.length ? "text-label" : "text-label-2")}
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(8px)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" }}
            transition={{ duration: 0.24, ease: EASE_OUT, delay: Math.max(0, i - firstNew) * STAGGER_S }}
          >
            {word}
          </motion.span>
        </Fragment>
      ))}
    </p>
  );
}
