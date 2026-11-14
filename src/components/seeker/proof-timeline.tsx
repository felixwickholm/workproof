import { Check } from "lucide-react";
import { cx } from "@/components/ui/cx";
import type { TimelineStep } from "./pass-state";

const timeFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short", hour: "2-digit", minute: "2-digit" });

/**
 * The proof's road from sent to met: six steps on one line on a laptop and a list on a phone,
 * or always a list in a narrow column.
 * A step reached is ink with a check; a step not reached yet is a hollow ring and grey words.
 */
export function ProofTimeline({ steps, layout = "auto", className }: { steps: TimelineStep[]; layout?: "auto" | "list"; className?: string }) {
  const row = layout === "auto";
  return (
    <ol className={cx("grid gap-x-2 gap-y-3", row ? "max-[639px]:grid-cols-1 min-[640px]:grid-cols-6" : "grid-cols-1", className)}>
      {steps.map((step) => (
        <li key={step.label} className={cx("flex min-w-0 items-center gap-2.5", row && "min-[640px]:flex-col min-[640px]:items-start min-[640px]:gap-2")}>
          <span
            aria-hidden
            className={cx(
              "grid size-5 shrink-0 place-items-center rounded-full",
              step.done ? "bg-label text-ground" : "shadow-[inset_0_0_0_1.5px_var(--color-control)]",
            )}
          >
            {step.done ? <Check className="size-3" strokeWidth={3} /> : null}
          </span>
          <span className={cx("min-w-0", !row && "flex flex-1 items-baseline justify-between gap-3")}>
            <span className={cx("text-footnote block font-medium", step.done ? "text-label" : "text-label-2")}>
              {step.label}
              <span className="sr-only">{step.done ? ", done" : ", not yet"}</span>
            </span>
            {step.at ? <span className="text-caption tnum block text-label-2">{timeFormat.format(new Date(step.at))}</span> : null}
          </span>
        </li>
      ))}
    </ol>
  );
}
