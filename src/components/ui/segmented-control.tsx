"use client";

import { motion, useReducedMotion } from "motion/react";
import { useId, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "./cx";

interface Segment<T extends string> {
  value: T;
  label: ReactNode;
}

interface Props<T extends string> {
  /** The group's name for screen readers, for example "Theme". */
  label: string;
  segments: readonly Segment<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * iOS segmented control: two to four choices of one setting, the chosen one on a raised thumb that
 * springs across. A radio group underneath, so arrow keys move the choice. 32px on a laptop, 44px
 * under a finger.
 */
export function SegmentedControl<T extends string>({ label, segments, value, onChange, className }: Props<T>) {
  const reduce = useReducedMotion();
  const thumbId = useId();

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const at = segments.findIndex((s) => s.value === value);
    const next = segments[(at + step + segments.length) % segments.length];
    onChange(next.value);
    e.currentTarget.querySelector<HTMLElement>(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKey}
      className={cx("grid h-8 rounded-[10px] bg-fill p-0.5 pointer-coarse:h-11", className)}
      style={{ gridTemplateColumns: `repeat(${segments.length}, minmax(0, 1fr))` }}
    >
      {segments.map((segment) => {
        const on = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            role="radio"
            aria-checked={on}
            data-value={segment.value}
            tabIndex={on ? 0 : -1}
            onClick={() => onChange(segment.value)}
            className={cx(
              "text-footnote relative flex items-center justify-center gap-2 rounded-[8px] px-3 font-medium transition-colors duration-150",
              on ? "text-label" : "text-label-2 hover:text-label",
            )}
          >
            {on ? (
              <motion.span
                layoutId={thumbId}
                aria-hidden
                className="absolute inset-0 rounded-[8px] bg-raised shadow-[0_1px_2px_rgba(0,0,0,0.12)]"
                transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 520, damping: 40 }}
              />
            ) : null}
            <span className="relative flex items-center gap-2">{segment.label}</span>
          </button>
        );
      })}
    </div>
  );
}
