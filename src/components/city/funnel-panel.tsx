import type { CityInsights } from "@/lib/domain/types";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { Bar, BarChart } from "./bars";
import { barShare, shareInWords } from "./figures";

/**
 * Each step of the way from a proof to a meeting, one bar per step on one scale. The tiles above
 * already carry the answered and met counts, so the bars speak in shares of all proofs; only the
 * steps no tile shows (invited, accepted) carry their count.
 */
export function FunnelPanel({ funnel, className }: { funnel: CityInsights["funnel"]; className?: string }) {
  const steps = [
    { label: "Proofs sent", value: funnel.proofs, total: "Proofs sent", counted: false },
    { label: "Answered in writing", value: funnel.answered, counted: false },
    { label: "Invited to meet", value: funnel.invited, counted: true },
    { label: "Accepted", value: funnel.accepted, counted: true },
    { label: "Met", value: funnel.met, counted: false },
  ];
  const max = Math.max(...steps.map((s) => s.value));

  return (
    <Panel title="From proof to meeting" className={cx("flex flex-col", className)}>
      <BarChart label="From proof to meeting" className="mt-2 flex flex-1 flex-col justify-between gap-5">
        {(grown) =>
          steps.map((step, i) => (
            <div key={step.label} data-total={step.total}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-subhead text-label">{step.label}</span>
                <span className="text-subhead tnum text-right text-label-2">
                  {step.counted ? <span className="text-label">{step.value} · </span> : null}
                  {shareInWords(step.value, funnel.proofs)}
                </span>
                <data hidden data-value value={step.value}>
                  {step.value}
                </data>
              </div>
              <Bar className="mt-2 h-2" share={barShare(step.value, max)} grown={grown} index={i} tone={i === steps.length - 1 ? "accent" : "ink"} />
            </div>
          ))
        }
      </BarChart>
      <p className="text-footnote pt-6 text-pretty text-label-2">Shares of all proofs sent. A meeting counts as met when both sides tap We met.</p>
    </Panel>
  );
}
