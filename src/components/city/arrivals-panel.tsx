import type { CityInsights } from "@/lib/domain/types";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { BarChart, Column } from "./bars";
import { arrivalsFinding, barShare } from "./figures";
import { formatDayLabel } from "./format";

/** Proofs per day in the week before the event: work spreads out, so there is no start-of-day rush. */
export function ArrivalsPanel({ days, className }: { days: CityInsights["arrivalsByDay"]; className?: string }) {
  const max = Math.max(0, ...days.map((d) => d.proofs));
  const finding = arrivalsFinding(days);
  const last = days.length - 1;

  return (
    <Panel title="Work arrives over days" className={className}>
      <p className="text-subhead text-pretty text-label-2">No login rush at 09:00. People work when it suits them.</p>
      <BarChart label="Proofs per day" className="mt-5">
        {(grown) => (
          <ol className="grid h-[180px] items-end gap-2" style={{ gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))` }}>
            {days.map((d, i) => (
              <li key={d.day} className="flex h-full flex-col items-center justify-end">
                <span className="text-caption tnum mb-1 text-label">{d.proofs}</span>
                <span className="flex h-[104px] w-full max-w-9 items-end">
                  <Column share={barShare(d.proofs, max)} grown={grown} index={i} tone={i === last ? "accent" : "ink"} />
                </span>
                {/* Weekday over date, so eight labels fit side by side on a phone. */}
                <span className={cx("text-caption tnum mt-2 flex flex-col items-center", i === last ? "font-medium text-label" : "text-label-2")}>
                  {formatDayLabel(d.day)
                    .split(" ")
                    .map((part) => (
                      <span key={part}>{part}</span>
                    ))}
                </span>
                <span className="sr-only">{d.proofs === 1 ? "proof" : "proofs"}</span>
              </li>
            ))}
          </ol>
        )}
      </BarChart>
      {finding ? <p className="text-footnote mt-4 text-label-2">{finding}</p> : null}
    </Panel>
  );
}
