import type { CityInsights, Company } from "@/lib/domain/types";
import { CompanyMark } from "../ui/avatar";
import { Panel } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { plural } from "./format";

/** Tasks several small employers share: one piece of work reaches each of them. */
export function PooledPanel({
  pooled,
  companies,
  secondLookMeetings,
  className,
}: {
  pooled: CityInsights["pooled"];
  companies: Company[];
  secondLookMeetings: number;
  className?: string;
}) {
  const byName = new Map(companies.map((c) => [c.name, c]));

  return (
    <Panel title="One task, several employers" count={pooled.length} className={className}>
      <p className="text-subhead text-pretty text-label-2">Small employers share one task, so one piece of work reaches several of them.</p>
      {pooled.length === 0 ? (
        <EmptyState className="mt-4">Shared tasks appear here when two employers ask for the same work.</EmptyState>
      ) : (
        <ul className="mt-4 flex flex-col gap-2">
          {pooled.map((task) => (
            <li key={task.challengeId} className="rounded-[16px] bg-raised px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-separator)]">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-subhead min-w-0 font-medium text-pretty text-label">{task.title}</p>
                <p className="text-footnote tnum shrink-0 text-label-2">{plural(task.proofs, "proof")}</p>
              </div>
              <div className="mt-2 flex min-w-0 items-center gap-2">
                <span className="flex shrink-0">
                  {task.companies.map((name, i) => (
                    <CompanyMark
                      key={name}
                      company={byName.get(name) ?? { id: name, name }}
                      size="sm"
                      className={i > 0 ? "-ml-1.5 shadow-[0_0_0_2px_var(--color-raised)]" : undefined}
                    />
                  ))}
                </span>
                <span className="text-footnote min-w-0 truncate text-label-2">{task.companies.join(" and ")}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p data-total="Second look meetings" className="text-footnote mt-4 text-pretty text-label-2">
        <span data-value className="tnum text-label">
          {secondLookMeetings}
        </span>{" "}
        {secondLookMeetings === 1 ? "meeting" : "meetings"} came through Second look: another employer read a proof that its own employer said not now to or left unanswered, with the person&apos;s consent.
      </p>
    </Panel>
  );
}
