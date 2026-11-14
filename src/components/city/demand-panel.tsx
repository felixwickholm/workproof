import type { CityInsights } from "@/lib/domain/types";
import { Panel } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { Bar, BarChart } from "./bars";
import { barShare, demandFinding } from "./figures";
import { plural } from "./format";

/**
 * Tasks that ask for each core skill against the proofs handed in for those tasks. Both bars share
 * one scale and carry their own number, so no legend is needed. Counts only, never a person.
 */
export function DemandPanel({ demand, className }: { demand: CityInsights["demandBySkill"]; className?: string }) {
  const max = Math.max(0, ...demand.flatMap((d) => [d.tasks, d.proofs]));
  const finding = demandFinding(demand);

  return (
    <Panel title="Asked for and answered" className={className}>
      {demand.length === 0 ? (
        <EmptyState>Skills appear here once a company posts a task.</EmptyState>
      ) : (
        <>
          <p className="text-subhead text-pretty text-label">{finding}</p>
          <p className="text-footnote mt-1 text-label-2">Per core skill: tasks that ask for it, and proofs handed in for those tasks. Counts only.</p>
          <BarChart label="Tasks that ask for each skill, and proofs handed in for those tasks" className="mt-4 flex flex-col">
            {(grown) =>
              demand.map((d, i) => (
                <div key={d.skillId} className="grid grid-cols-1 gap-x-4 gap-y-1.5 py-2 [&+&]:hairline-t @min-[440px]:grid-cols-[minmax(0,168px)_minmax(0,1fr)] @min-[440px]:items-center">
                  <p className="text-footnote text-pretty text-label">{d.label}</p>
                  <div className="grid grid-cols-[minmax(0,1fr)_60px] items-center gap-x-3 gap-y-1">
                    <Bar className="h-1.5" share={barShare(d.tasks, max)} grown={grown} index={i} />
                    <span className="text-caption tnum text-label-2">{plural(d.tasks, "task")}</span>
                    <Bar className="h-1.5" share={barShare(d.proofs, max)} grown={grown} index={i} tone="accent" />
                    <span className="text-caption tnum text-label-2">{plural(d.proofs, "proof")}</span>
                  </div>
                </div>
              ))
            }
          </BarChart>
        </>
      )}
    </Panel>
  );
}
