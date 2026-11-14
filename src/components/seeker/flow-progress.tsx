import { cx } from "@/components/ui/cx";

/** One 4px bar that fills as the person moves on, with the step in words beside it. `step` counts from 1. */
export function FlowProgress({ step, total, className }: { step: number; total: number; className?: string }) {
  const words = `Step ${step} of ${total}`;
  return (
    <div className={cx("flex w-full max-w-[280px] items-center gap-3", className)}>
      <div role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={step} aria-label={words} className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-fill">
        <span
          className="block h-full origin-left rounded-full bg-label transition-transform duration-300 ease-(--ease-out)"
          style={{ transform: `scaleX(${Math.min(1, step / total)})` }}
        />
      </div>
      <span aria-hidden className="text-footnote tnum whitespace-nowrap text-label-2">
        {words}
      </span>
    </div>
  );
}
