"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import type { PassportEntry } from "@/lib/domain/types";
import { cx } from "@/components/ui/cx";
import { PASS_PX, PassFace, type PassOwners, STRIP_PX } from "./pass-face";

/** A soft spring with almost no bounce: the pass settles, it does not wobble. */
const SPRING = { type: "spring", duration: 0.45, bounce: 0.12 } as const;

/**
 * The order the passes sit in, back to front: the chosen pass moves to the front and the others
 * keep their order behind it.
 */
export function stackOrder(count: number, front: number): number[] {
  const rest = Array.from({ length: count }, (_, i) => i).filter((i) => i !== front);
  return front >= 0 && front < count ? [...rest, front] : rest;
}

/** Where each pass sits: one 64px strip per pass behind, and the front pass whole. */
export function stackLayout(count: number, front: number): { tops: number[]; height: number } {
  const order = stackOrder(count, front);
  const tops = Array.from({ length: count }, (_, i) => order.indexOf(i) * STRIP_PX);
  return { tops, height: count === 0 ? 0 : (count - 1) * STRIP_PX + PASS_PX };
}

interface Props {
  /** Oldest first, so with nothing chosen the newest pass sits in front. */
  entries: PassportEntry[];
  /** Index into `entries` of the pass in front. */
  front: number;
  onFront: (index: number) => void;
  ownersOf: (entry: PassportEntry) => PassOwners;
  className?: string;
}

/**
 * The passport as a wallet: every proof is a pass, and only the 64px strip of each pass behind
 * shows. Tapping a strip brings that pass to the front with a spring, moving only `transform`;
 * with reduced motion the passes swap places at once. The pass in front opens its own page.
 */
export function PassStack({ entries, front, onFront, ownersOf, className }: Props) {
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : SPRING;
  const { tops, height } = stackLayout(entries.length, front);
  const order = stackOrder(entries.length, front);

  return (
    <ol className={cx("relative w-full", className)} style={{ height }} aria-label="Your proofs">
      {entries.map((entry, i) => {
        const isFront = i === front;
        const face = <PassFace entry={entry} owners={ownersOf(entry)} />;
        return (
          <motion.li
            key={entry.proof.proofId}
            className="absolute inset-x-0 top-0 rounded-card shadow-[0_-1px_0_var(--color-ground),0_-8px_18px_-14px_rgb(0_0_0/0.35)]"
            style={{ zIndex: order.indexOf(i) + 1 }}
            initial={false}
            animate={{ transform: `translateY(${tops[i]}px)` }}
            transition={transition}
          >
            {isFront ? (
              <Link href={`/passport/${entry.proof.proofId}`} className="press group relative block rounded-card" aria-label={`${entry.proof.label}: open this proof`}>
                {face}
                <span className="text-footnote absolute right-5 bottom-4 inline-flex items-center gap-1 font-medium text-label">
                  Open
                  <ArrowRight aria-hidden className="size-3.5 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.9} />
                </span>
              </Link>
            ) : (
              <button type="button" onClick={() => onFront(i)} className="block w-full rounded-card text-left" aria-label={`Bring ${entry.proof.label} to the front`}>
                {face}
              </button>
            )}
          </motion.li>
        );
      })}
    </ol>
  );
}
