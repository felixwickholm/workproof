import type { CSSProperties } from "react";
import { cx } from "@/components/ui/cx";
import type { FlowMapHeadline } from "./types";

const FIGURES: readonly { key: keyof FlowMapHeadline; label: string }[] = [
  { key: "took", label: "People who took a challenge" },
  { key: "scored", label: "Work scored by a person" },
  { key: "talks", label: "Talks agreed" },
  { key: "hires", label: "Hires" },
];

/** The event's four figures, set in the sea below the coast, marked plainly as demo data. */
export function MapHeadline({ headline, narrow, className, style }: { headline: FlowMapHeadline; narrow: boolean; className?: string; style?: CSSProperties }) {
  return (
    <div className={cx("flex flex-col gap-2", className)} style={style}>
      <p className="text-[14px] leading-5 text-label-2">Demo data</p>
      <dl className={cx("grid gap-y-3", narrow ? "grid-cols-2 gap-x-4" : "grid-cols-4 gap-x-6")}>
        {FIGURES.map(({ key, label }) => (
          <div key={key} className="flex min-w-0 flex-col-reverse justify-end gap-1">
            <dt className="text-[14px] leading-5 text-pretty text-label-2">{label}</dt>
            <dd className={cx("tnum m-0 leading-none font-normal tracking-[-0.01em] text-label", narrow ? "text-[28px]" : "text-[32px]")}>{headline[key]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
