import { ChevronRight } from "lucide-react";
import { Fragment } from "react";
import type { TaskCounts } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { funnelLine, funnelSteps } from "./hiring-words";

/**
 * "9 did it → 4 scored → 2 invited → 1 said yes" as four numbers in a row, so it reads as a small
 * funnel. Screen readers get the same line as one sentence.
 */
export function FunnelNumbers({ counts, className }: { counts: TaskCounts; className?: string }) {
  return (
    <p className={cx("flex items-start gap-1.5 min-[600px]:gap-3", className)}>
      <span className="sr-only">{funnelLine(counts)}</span>
      {funnelSteps(counts).map((step, i) => (
        <Fragment key={step.words}>
          {i > 0 ? <ChevronRight aria-hidden className="mt-2 size-4 shrink-0 text-label-3" strokeWidth={1.75} /> : null}
          <span aria-hidden className="flex min-w-[52px] flex-col">
            <span className={cx("tnum text-[28px] leading-[34px] font-normal", step.count === 0 ? "text-label-3" : "text-label")}>{step.count}</span>
            <span className="text-footnote whitespace-nowrap text-label-2">{step.words}</span>
          </span>
        </Fragment>
      ))}
    </p>
  );
}
