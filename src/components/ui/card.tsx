import type { ReactNode } from "react";
import { cx } from "./cx";

type Tone = "surface" | "raised" | "panel" | "tint";

const tones: Record<Tone, string> = {
  surface: "bg-surface",
  /** The one raised inner card, for the block that carries a screen's main answer. */
  raised: "bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)]",
  /** Proven's card: white with a 1px edge and a faint wide lift. For the blocks a screen is made of. */
  panel: "bg-raised shadow-card",
  /** A 6% accent wash, for a block a person decided on. */
  tint: "bg-tint",
};

/** A panel at Proven's density: radius 20, padding 20 on a phone and 28 from 900px. */
export function Card({ children, className, tone = "surface", tour }: { children: ReactNode; className?: string; tone?: Tone; tour?: string }) {
  return (
    <div data-tour={tour} className={cx("rounded-card p-5 min-[900px]:p-7", tones[tone], className)}>
      {children}
    </div>
  );
}

/** Small sentence-case label inside a card or a table head. Never uppercase: the content explains itself. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-caption font-semibold text-label-2", className)}>{children}</p>;
}
