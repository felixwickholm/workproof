import { ChevronRight } from "lucide-react";
import type { ImpactCounts } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { funnelSteps, HIRED_LABEL } from "./impact";

interface Props {
  counts: ImpactCounts;
  /** "large" is the event's funnel at the top of the city page; "small" is one challenge's funnel. */
  size?: "large" | "small";
  className?: string;
}

/**
 * The event as six steps in one row, each number with its share of the step before, and "Hired"
 * set apart. On a phone, and in a narrow container, the steps become a vertical list.
 * Every number carries `data-total` with its label, so a test reads the figure it means.
 */
export function ImpactFunnel({ counts, size = "large", className }: Props) {
  const steps = funnelSteps(counts);
  const number = size === "large" ? "text-[34px] leading-[40px] @min-[880px]:text-[48px] @min-[880px]:leading-[52px]" : "text-[34px] leading-[40px]";

  return (
    <div className={cx("@container", className)}>
      <ol className="flex flex-col @min-[880px]:grid @min-[880px]:grid-cols-[repeat(6,minmax(0,1fr))_auto]">
        {steps.map((step, i) => (
          <li
            key={step.key}
            className={cx(
              "relative grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-2.5 [&+&]:hairline-t",
              "@min-[880px]:flex @min-[880px]:flex-col @min-[880px]:items-start @min-[880px]:py-0 @min-[880px]:pr-6 @min-[880px]:[&+&]:shadow-none",
            )}
          >
            <span className="text-body self-end text-label @min-[880px]:order-2 @min-[880px]:self-start @min-[880px]:mt-2">
              {step.label}
            </span>
            <span data-total={step.label} className={cx("tnum row-span-2 self-center text-right @min-[880px]:self-start font-normal tracking-[-0.02em] text-label @min-[880px]:order-1 @min-[880px]:text-left", number)}>
              {step.value}
            </span>
            <span className="text-footnote self-start text-label-2 @min-[880px]:order-3 @min-[880px]:mt-1">{step.share ?? " "}</span>
            {i < steps.length - 1 ? (
              <ChevronRight
                aria-hidden
                strokeWidth={1.75}
                className="absolute top-3 right-2 hidden size-5 text-label-3 @min-[880px]:block @min-[880px]:top-3"
              />
            ) : null}
          </li>
        ))}
        <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 py-2.5 hairline-t @min-[880px]:flex @min-[880px]:flex-col @min-[880px]:items-start @min-[880px]:border-l @min-[880px]:border-separator @min-[880px]:py-0 @min-[880px]:pl-6 @min-[880px]:shadow-none">
          <span className="text-body text-label-2 @min-[880px]:order-2 @min-[880px]:mt-2">{HIRED_LABEL}</span>
          <span data-total={HIRED_LABEL} className={cx("tnum text-right font-normal tracking-[-0.02em] text-label-2 @min-[880px]:order-1 @min-[880px]:text-left", number)}>
            {counts.hires}
          </span>
        </li>
      </ol>
    </div>
  );
}
