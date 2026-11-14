import { cx } from "./cx";

/** Thin segmented progress bar. `current` is zero-based; segments before it are full. */
export function StepProgress({ total, current, className }: { total: number; current: number; className?: string }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(current + 1, total)}
      aria-label={`Step ${Math.min(current + 1, total)} of ${total}`}
      className={cx("flex w-full max-w-[200px] gap-1", className)}
    >
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-fill">
          <span
            className="block h-full origin-left rounded-full bg-white transition-transform duration-300 ease-(--ease-out)"
            style={{ transform: `scaleX(${i <= current ? 1 : 0})` }}
          />
        </span>
      ))}
    </div>
  );
}
