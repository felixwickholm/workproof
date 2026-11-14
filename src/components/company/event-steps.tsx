import { Check } from "lucide-react";
import { cx } from "../ui/cx";
import { EVENT_STEPS } from "./hiring-words";

/**
 * The event in five small numbered steps, in one row on a laptop and a column on a phone. Steps
 * before `current` are done; `current` is marked from the data.
 */
export function EventSteps({ current, className }: { current: number; className?: string }) {
  return (
    <section aria-label="How the event works" className={className}>
      <h2 className="text-section text-label">How the event works</h2>
      <ol className="mt-4 grid gap-3 min-[900px]:grid-cols-5 min-[900px]:gap-4">
        {EVENT_STEPS.map((words, i) => {
          const n = i + 1;
          const done = n < current;
          const now = n === current;
          return (
            <li key={words} aria-current={now ? "step" : undefined} className="flex items-start gap-3 min-[900px]:flex-col min-[900px]:gap-2">
              <span
                className={cx(
                  "tnum flex size-8 shrink-0 items-center justify-center rounded-full text-[15px] font-semibold",
                  now ? "bg-label text-ground" : done ? "bg-fill text-label" : "text-label-2 shadow-[inset_0_0_0_1px_var(--color-control)]",
                )}
              >
                {done ? <Check aria-hidden className="size-4" strokeWidth={1.75} /> : n}
                {done ? <span className="sr-only">{n}, done</span> : null}
              </span>
              <span className={cx("text-subhead text-pretty", now ? "font-semibold text-label" : "text-label-2")}>
                {words}
                {now ? <span className="sr-only"> (you are here)</span> : null}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
