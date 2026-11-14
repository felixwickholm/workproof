import type { ReactNode } from "react";
import type { CityOverview } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { StatTile } from "../ui/stat-tile";
import { formatHours } from "./format";

/**
 * Marks a figure for the end-to-end check, which reads `[data-total=label] [data-value]`.
 * It holds the exact value, also while the visible figure is still counting up.
 */
function Total({ label, value, children }: { label: string; value: number; children: ReactNode }) {
  return (
    <div data-total={label} className="min-w-0">
      {children}
      <data hidden data-value value={value}>
        {value}
      </data>
    </div>
  );
}

/** The four outcomes the city answers for: written answers, how fast, meetings that happened, and who decided. */
export function OutcomeTiles({ totals, className }: { totals: CityOverview["totals"]; className?: string }) {
  return (
    <div className={cx("grid grid-cols-2 gap-4 @min-[640px]:grid-cols-4", className)}>
      <StatTile
        label="People with a written answer"
        value={totals.proofsAnswered}
        suffix={` of ${totals.proofs}`}
        caption="Proofs a person answered in writing."
      />
      <StatTile label="Median reply time" value={formatHours(totals.medianHoursToFirstAnswer)} caption="From proof sent to first answer." />
      <Total label="Meetings confirmed by both sides" value={totals.meetingsConfirmedByBoth}>
        <StatTile className="h-full" label="Meetings confirmed by both sides" value={totals.meetingsConfirmedByBoth} caption="Both tapped We met. No survey." />
      </Total>
      <Total label="Automated decisions" value={totals.automatedDecisions}>
        <StatTile className="h-full" label="Automated decisions" value={totals.automatedDecisions} caption="Every decision has a named person." />
      </Total>
    </div>
  );
}
