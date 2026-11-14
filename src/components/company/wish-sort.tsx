"use client";

import { ArrowRight, X } from "lucide-react";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import { useEffect, useState } from "react";
import type { ChallengeDraft } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { mixedWishes, readsAsSkill, wishHeadline, wishRows, type WishRow } from "./wish-list";

const MIN_SKILLS = 3;
/** The chips rest as the company wrote them for a moment, then sort. */
const HOLD_MS = 600;
const EASE = [0.23, 1, 0.32, 1] as const;

/** A chip holds the company's own words, so it wraps instead of running off a phone screen. */
const chip = "inline-flex min-h-8 max-w-full items-center gap-1 rounded-full px-3 py-1 text-left text-footnote font-medium text-pretty";

interface Props {
  draft: Pick<ChallengeDraft, "coreSkills" | "setAside" | "wishes" | "facts">;
  /** Sort with motion. False once the company has seen this draft sort, so going back and forth does not replay it. */
  play: boolean;
  onPlayed: () => void;
  /** Removes a kept skill while more than three remain. */
  onRemove: (skillId: string) => void;
}

/**
 * The wish trim, made visible: every wish the company wrote sits together, then sorts into the wishes kept
 * as core skills (each with the skill it became), the facts about the job that people are shown, and the
 * wishes set aside, each with its reason.
 * Transform and opacity only, 300 ms, staggered, once.
 */
export function WishSort({ draft, play, onPlayed, onRemove }: Props) {
  const reduce = useReducedMotion();
  const animate = play && !reduce;
  const [sorted, setSorted] = useState(!animate);
  const { kept, facts, aside } = wishRows(draft);
  const canRemove = draft.coreSkills.length > MIN_SKILLS;
  const keptWishes = kept.filter((r) => r.text).length;

  useEffect(() => {
    if (sorted) {
      if (play) onPlayed();
      return;
    }
    const id = window.setTimeout(() => setSorted(true), HOLD_MS);
    return () => window.clearTimeout(id);
  }, [sorted, play, onPlayed]);

  const mixed = mixedWishes(kept, aside, facts);
  const order = new Map(mixed.map((w, i) => [w.key, i]));
  const step = (w: WishRow) => (order.get(w.key) ?? mixed.length) * 0.05;
  const move = (w: WishRow) => ({ duration: 0.3, ease: EASE, delay: animate ? step(w) : 0 });
  const fadeIn = (w: WishRow) => ({
    initial: animate ? { opacity: 0 } : false,
    animate: { opacity: 1 },
    transition: { duration: 0.3, ease: EASE, delay: animate ? 0.3 + step(w) : 0 },
  });

  const skillPill = (w: WishRow) => (
    <>
      {w.skillLabel}
      <button
        type="button"
        onClick={() => w.skillId && onRemove(w.skillId)}
        disabled={!canRemove}
        aria-label={`Remove ${w.skillLabel}`}
        className="grid size-6 flex-none place-items-center rounded-full transition-opacity duration-150 hover:bg-ground/15 disabled:hidden"
      >
        <X aria-hidden className="size-3.5" strokeWidth={2.2} />
      </button>
    </>
  );
  const pill = cx(chip, "bg-label pr-1.5 text-ground");

  return (
    <section aria-label="Wishes and skills">
      <p className="text-title-3 font-semibold text-pretty text-label">{wishHeadline(keptWishes, aside.length, facts.length)}</p>
      <LayoutGroup>
        {sorted ? (
          <div className="mt-5 grid gap-6">
            <div>
              <p className="text-footnote font-medium text-label-2">Kept as core skills · {draft.coreSkills.length}</p>
              <ul className="mt-2 grid gap-3">
                {kept.map((w) =>
                  !w.text ? (
                    <motion.li key={w.key} className="flex flex-col items-start gap-1" {...fadeIn(w)}>
                      <span className="text-footnote px-3 text-label-2">Added for the task</span>
                      <span className="inline-flex max-w-full items-center gap-2 pl-3">
                        <ArrowRight aria-hidden className="size-3.5 flex-none text-label-3" strokeWidth={2} />
                        <span className={pill}>{skillPill(w)}</span>
                      </span>
                    </motion.li>
                  ) : readsAsSkill(w) ? (
                    <li key={w.key} className="flex">
                      <motion.span layoutId={w.key} transition={move(w)} className={pill}>
                        {skillPill(w)}
                      </motion.span>
                    </li>
                  ) : (
                    <li key={w.key} className="flex flex-col items-start gap-1">
                      <motion.span layoutId={w.key} transition={move(w)} className={cx(chip, "bg-fill text-label")}>
                        {w.text}
                      </motion.span>
                      <motion.span className="inline-flex max-w-full items-center gap-2 pl-3" {...fadeIn(w)}>
                        <ArrowRight aria-hidden className="size-3.5 flex-none text-label-3" strokeWidth={2} />
                        <span className="sr-only">became</span>
                        <span className={pill}>{skillPill(w)}</span>
                      </motion.span>
                    </li>
                  ),
                )}
              </ul>
              <p className="text-footnote mt-2 text-label-2">{canRemove ? "Remove one if it is not the job." : "Three is the fewest a task can keep."}</p>
            </div>
            {facts.length > 0 ? (
              <div>
                <p className="text-footnote font-medium text-label-2">Good to know · {facts.length}</p>
                <p className="text-footnote text-pretty text-label-2">Facts about the job, shown to people</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {facts.map((w) => (
                    <li key={w.key} className="flex max-w-full">
                      <motion.span layoutId={w.key} transition={move(w)} className={cx(chip, "bg-fill text-label")}>
                        {w.text}
                      </motion.span>
                    </li>
                  ))}
                </ul>
                {draft.facts?.length ? (
                  <motion.p className="text-footnote mt-2 text-pretty text-label-2" {...fadeIn(facts[0])}>
                    People read: {draft.facts.join(" · ")}
                  </motion.p>
                ) : null}
              </div>
            ) : null}
            {aside.length > 0 ? (
              <div>
                <p className="text-footnote font-medium text-label-2">Set aside · {aside.length}</p>
                <ul className="mt-2 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] items-center gap-x-3 gap-y-2 max-[480px]:grid-cols-1 max-[480px]:gap-y-1">
                  {aside.map((w) => (
                    <li key={w.key} className="contents">
                      <motion.span layoutId={w.key} transition={move(w)} className={cx(chip, "justify-self-start bg-fill text-label-2 line-through decoration-label-2")}>
                        {w.text}
                      </motion.span>
                      <motion.span className="text-footnote text-pretty text-label-2 max-[480px]:mb-2" {...fadeIn(w)}>
                        {w.reason}
                      </motion.span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="text-footnote text-label-2">Nothing set aside. Every wish was part of the job.</p>
            )}
          </div>
        ) : (
          <div className="mt-5">
            <p className="text-footnote font-medium text-label-2">Your wishes</p>
            <ul className="mt-2 flex flex-wrap gap-2">
              {mixed.map((w) => (
                <motion.li key={w.key} layoutId={w.key} className={cx(chip, "bg-fill text-label")}>
                  {w.text}
                </motion.li>
              ))}
            </ul>
          </div>
        )}
      </LayoutGroup>
    </section>
  );
}
