"use client";

import { Heart } from "lucide-react";
import { cx } from "../ui/cx";
import { useSaved } from "./use-saved";

interface Props {
  challengeId: string;
  title: string;
  /** "stacked": the heart over a small label, at the end of a list row. "pill": an outlined button beside Start. */
  variant?: "stacked" | "pill";
  className?: string;
}

/** Save a challenge for later, on this device only. The heart fills once it is saved. */
export function SaveButton({ challengeId, title, variant = "stacked", className }: Props) {
  const { saved, toggle } = useSaved();
  const on = saved.includes(challengeId);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={`${on ? "Saved" : "Save"}: ${title}`}
      onClick={() => toggle(challengeId)}
      className={cx(
        "press inline-flex items-center justify-center text-label transition-colors duration-150",
        variant === "stacked"
          ? "min-h-14 min-w-14 flex-col gap-0.5 rounded-[12px] px-2 text-caption hover:bg-fill"
          : "h-12 gap-2 rounded-full bg-raised px-5 text-subhead font-medium shadow-[inset_0_0_0_1px_var(--color-control)] hover:bg-fill",
        className,
      )}
    >
      <Heart aria-hidden className={cx("size-5 transition-colors duration-150", on ? "fill-link text-link" : "text-label")} strokeWidth={1.75} />
      <span className={cx(variant === "stacked" && "text-label-2")}>{on ? "Saved" : "Save"}</span>
    </button>
  );
}
