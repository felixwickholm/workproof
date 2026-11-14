import { cx } from "../ui/cx";
import { EVENT_STEPS } from "./impact";

/** The event's five steps in one row, with today's step marked. A vertical list in a narrow space. */
export function EventFlow({ today }: { today: number }) {
  return (
    <div className="@container">
      <ol className="grid grid-cols-1 gap-3 @min-[760px]:grid-cols-5 @min-[760px]:gap-4">
        {EVENT_STEPS.map((step, i) => {
          const current = i === today;
          return (
            <li
              key={step}
              aria-current={current ? "step" : undefined}
              className={cx(
                "flex gap-3 @min-[760px]:flex-col @min-[760px]:gap-2",
                current ? "text-label" : "text-label-2",
              )}
            >
              <span
                className={cx(
                  "tnum text-subhead flex size-8 shrink-0 items-center justify-center rounded-full font-medium",
                  current
                    ? "bg-accent text-accent-ink"
                    : "shadow-[inset_0_0_0_1px_var(--color-control)]",
                )}
              >
                {i + 1}
              </span>
              <span className="text-body text-pretty">
                {step}
                {current ? (
                  <span className="text-footnote mt-0.5 block font-medium text-accent">
                    Today
                  </span>
                ) : null}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
