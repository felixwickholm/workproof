import type { CityInsights } from "@/lib/domain/types";
import { Bar, BarChart } from "./bars";
import { barShare, demandFinding, sortDemand } from "./impact";

/**
 * What companies ask for: the skills most asked for, as bars by the challenges that ask for each,
 * with the work handed in for those challenges beside it. One finding in a sentence above.
 */
export function DemandPanel({ demand }: { demand: CityInsights["demandBySkill"] }) {
  const sorted = sortDemand(demand).filter((d) => d.tasks > 0);
  const max = Math.max(0, ...sorted.map((d) => d.tasks));
  const finding = demandFinding(sorted);

  if (sorted.length === 0) {
    return <p className="text-body text-label-2">No company has a challenge yet. The skills they ask for show here.</p>;
  }

  return (
    <div>
      {finding ? <p className="text-body text-pretty text-label">{finding}</p> : null}
      <div className="text-footnote mt-5 grid grid-cols-[minmax(0,1fr)_40px] gap-x-4 text-label-2">
        <span>Challenges that ask for it</span>
        <span className="text-right">Work</span>
      </div>
      <BarChart label="Skills companies ask for" className="mt-2">
        {(grown) => (
          <ol>
            {sorted.map((d, i) => (
              <li key={d.skillId} className="py-2">
                <span className="text-subhead grid grid-cols-[minmax(0,1fr)_auto_40px] items-baseline gap-x-4 text-label">
                  <span className="truncate">{d.label}</span>
                  <span className="tnum">{d.tasks}</span>
                  <span className="tnum text-right text-label-2">{d.proofs}</span>
                </span>
                <span className="mt-1.5 mr-14 block h-2">
                  <Bar share={barShare(d.tasks, max)} grown={grown} index={i} tone="ink" className="h-2" />
                </span>
              </li>
            ))}
          </ol>
        )}
      </BarChart>
    </div>
  );
}
