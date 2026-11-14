import type { EmployerHome } from "@/lib/domain/types";
import { Card } from "../ui/card";
import { cx } from "../ui/cx";
import { EmptyState } from "../ui/empty-state";
import { eventLine, poolLead, poolShare } from "./employer-format";

/**
 * "Is the talent here?": the company's doubt about the city's pool, answered with counts. For each
 * skill this company asks for, how many proofs at the event were handed in for tasks that carry
 * it, drawn against every proof at the event so a bar is the true share. Beside it, the event's
 * own answer record. Counts of work only: no profiles, no people, nothing to rank.
 */
export function PoolPanel({ pool, event, className }: { pool: EmployerHome["pool"]; event: EmployerHome["event"]; className?: string }) {
  const lead = poolLead(pool);
  return (
    <Card className={cx("grid grid-cols-[minmax(0,1fr)] gap-8 min-[1100px]:grid-cols-12 min-[1100px]:gap-4", className)}>
      <div className="flex flex-col min-[1100px]:col-span-6 min-[1100px]:pr-10">
        <h2 className="text-section text-label">Is the talent here?</h2>
        <p className="text-subhead mt-1 text-pretty text-label-2">Proofs handed in at this event for tasks that ask for the same skills as yours. Counts only, no profiles.</p>
        {lead ? (
          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-kpi text-label">{lead.proofs}</span>
            <span className="text-headline text-pretty text-label">{lead.text}</span>
          </p>
        ) : null}
        <p className="text-subhead mt-4 text-pretty text-label">{eventLine(event)}</p>
        <p className="text-footnote mt-1 text-pretty text-label-2">Each proof is real work on a short task, read by a person. No cold messages, no CV piles.</p>
      </div>
      <div className="min-[1100px]:col-span-6">
        {pool.length === 0 ? (
          <EmptyState>Post a task to see how many proofs here were handed in for tasks with its skills.</EmptyState>
        ) : (
          <ul className="flex flex-col gap-4">
            {pool.map((skill) => (
              <li key={skill.skillId}>
                <p className="text-subhead flex items-baseline justify-between gap-3 text-label">
                  <span className="min-w-0 truncate">{skill.label}</span>
                  <span className="tnum shrink-0">
                    {skill.proofs} <span className="text-footnote text-label-2">{skill.proofs === 1 ? "proof" : "proofs"}</span>
                  </span>
                </p>
                <span aria-hidden className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-fill">
                  <span className="block h-full rounded-full bg-label" style={{ width: `${poolShare(skill.proofs, event.proofs)}%` }} />
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-footnote tnum mt-3 flex justify-between gap-3 text-label-2">
          <span>0</span>
          <span>{event.proofs} proofs at the event</span>
        </p>
      </div>
    </Card>
  );
}
