import type { CSSProperties, ReactNode } from "react";
import { cx } from "../ui/cx";

const ALIGN = {
  start: "left-0",
  center: "left-1/2 -translate-x-1/2",
  end: "right-0",
} as const;

interface Props {
  /** The number, set strong: the reader already knows the series and wants the value. */
  value: string;
  /** What the number is, set quiet under it. */
  label: string;
  children: ReactNode;
  /** Where the tip sits against the mark, so a tip at a chart's edge stays inside the card. */
  align?: keyof typeof ALIGN;
  className?: string;
  style?: CSSProperties;
}

/**
 * The hover and focus layer of one mark. The whole wrapper is the hit target, so it is larger than the
 * painted bar. Every value it shows is also printed on the chart, so the tip adds, never gates.
 */
export function ChartTip({ value, label, children, align = "center", className, style }: Props) {
  return (
    <span
      tabIndex={0}
      role="img"
      aria-label={`${label}: ${value}`}
      style={style}
      className={cx("group/tip relative block rounded-[6px] outline-none focus-visible:ring-2 focus-visible:ring-accent", className)}
    >
      {children}
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute bottom-full z-20 mb-2 flex flex-col whitespace-nowrap rounded-[10px] bg-raised px-3 py-2 text-left opacity-0",
          "shadow-[0_0_0_1px_var(--color-separator),0_8px_24px_-8px_rgba(1,17,53,0.25)] transition-opacity duration-150 ease-out",
          "group-hover/tip:opacity-100 group-focus-visible/tip:opacity-100 motion-reduce:transition-none",
          ALIGN[align],
        )}
      >
        <span className="tnum text-subhead font-semibold text-label">{value}</span>
        <span className="text-caption text-label-2">{label}</span>
      </span>
    </span>
  );
}

/** A legend key that mirrors its mark: a small rounded rect in the series colour, with its words in ink. */
export function LegendKey({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <span className="text-footnote inline-flex items-center gap-2 text-label-2">
      <span aria-hidden className={cx("inline-block h-2.5 w-3.5 rounded-[3px]", tone)} />
      {children}
    </span>
  );
}

/** The two steps of the scored-and-waiting chart: one hue, validated as an ordinal pair on both surfaces. */
export const SCORED_TONE = "bg-accent";
export const WAITING_TONE = "bg-accent/40";
