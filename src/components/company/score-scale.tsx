"use client";

import { useRef, type KeyboardEvent } from "react";
import { SCORE_LEVELS } from "@/lib/domain/scoring";
import type { SkillScore } from "@/lib/domain/types";
import { cx } from "../ui/cx";

type Points = SkillScore["points"];

interface Props {
  /** The skill's name, for the group's accessible name. */
  label: string;
  value: Points | undefined;
  onChange: (points: Points) => void;
}

/**
 * The fixed five-step scale as five large segments. Keys 1 to 5 pick a step, arrows move between
 * them. The chosen step's words show under the row, so every reviewer reads the same meaning.
 */
export function ScoreScale({ label, value, onChange }: Props) {
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const level = SCORE_LEVELS.find((l) => l.points === value);

  function pick(points: Points) {
    onChange(points);
    buttons.current[points - 1]?.focus();
  }

  function onKey(e: KeyboardEvent<HTMLDivElement>) {
    const n = Number(e.key);
    if (n >= 1 && n <= 5) {
      e.preventDefault();
      return pick(n as Points);
    }
    const step = e.key === "ArrowRight" || e.key === "ArrowUp" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowDown" ? -1 : 0;
    if (step === 0) return;
    e.preventDefault();
    pick(Math.min(5, Math.max(1, (value ?? (step > 0 ? 0 : 6)) + step)) as Points);
  }

  return (
    <div>
      <div role="radiogroup" aria-label={label} onKeyDown={onKey} className="grid grid-cols-5 gap-1.5">
        {SCORE_LEVELS.map((l) => {
          const on = l.points === value;
          return (
            <button
              key={l.points}
              ref={(el) => {
                buttons.current[l.points - 1] = el;
              }}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${l.points}: ${l.label}`}
              tabIndex={on || (value === undefined && l.points === 1) ? 0 : -1}
              onClick={() => pick(l.points)}
              className={cx(
                "tnum h-12 rounded-[12px] text-[17px] font-semibold transition-[background-color,color,transform] duration-150 ease-(--ease-out) active:scale-[0.97]",
                on ? "bg-label text-ground" : "bg-fill text-label hover:bg-label/12",
              )}
            >
              {l.points}
            </button>
          );
        })}
      </div>
      <p aria-live="polite" className="text-footnote mt-2 min-h-[21px] text-pretty">
        {level ? (
          <>
            <span className="font-semibold text-label">{level.label}.</span> <span className="text-label-2">{level.meaning}</span>
          </>
        ) : (
          <span className="text-label-2">Pick 1 to 5.</span>
        )}
      </p>
    </div>
  );
}
