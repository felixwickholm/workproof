import type { EmployerRecord } from "@/lib/domain/types";
import { CompanyMark } from "../ui/avatar";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { sortByOwed } from "./figures";
import { formatDays, formatHours } from "./format";

/** "3 owed" in the warning tone; nothing owed is a quiet zero. */
function Owed({ n }: { n: number }) {
  return n > 0 ? <span className="font-medium text-warning">{n} owed</span> : <span className="text-label-3">0</span>;
}

function Reply({ hours }: { hours: number | null }) {
  return hours === null ? <span className="text-label-3">–</span> : <>{formatHours(hours)}</>;
}

function Employer({ record }: { record: EmployerRecord }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <CompanyMark company={record.company} />
      <span className="min-w-0">
        <span className="text-subhead block truncate font-medium text-label">{record.company.name}</span>
        <span className="text-footnote block truncate text-label-2">{record.company.sector}</span>
      </span>
    </span>
  );
}

const head = "text-footnote px-3 py-2.5 text-right font-normal whitespace-nowrap text-label-2";
const cell = "text-subhead tnum px-3 py-3 text-right whitespace-nowrap text-label";

/**
 * Every employer's record at the event, those who owe the most answers first. Companies are held
 * to account for answering; people are never compared. A table from 760px, row cards below.
 */
export function AnswersOwed({ employers, className }: { employers: EmployerRecord[]; className?: string }) {
  const rows = sortByOwed(employers);
  const owed = rows.reduce((sum, r) => sum + r.proofsOwed, 0);

  return (
    <Panel title="Answers owed" count={owed} className={className}>
      <p className="text-subhead text-pretty text-label-2">Every decision comes with a written reason. The city sees which answers an employer still owes.</p>

      <div className="mt-4 hidden overflow-x-auto @min-[760px]:block">
        <table className="w-full text-left">
          <thead>
            <tr className="hairline-b">
              <th scope="col" className="text-footnote py-2.5 pr-3 font-normal text-label-2">
                Employer
              </th>
              <th scope="col" className={head}>
                Task live for
              </th>
              <th scope="col" className={head}>
                Proofs
              </th>
              <th scope="col" className={head}>
                Answered
              </th>
              <th scope="col" className={head}>
                Owed
              </th>
              <th scope="col" className={head}>
                Median reply
              </th>
              <th scope="col" className={cx(head, "pr-0")}>
                Meetings held
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.company.id} className="hairline-b last:shadow-none">
                <th scope="row" className="py-2.5 pr-3 font-normal">
                  <Employer record={r} />
                </th>
                <td className={cell}>{formatDays(r.challengeLiveDaysBeforeEvent)}</td>
                <td className={cell}>{r.proofsReceived}</td>
                <td className={cell}>{r.proofsAnswered}</td>
                <td className={cell}>
                  <Owed n={r.proofsOwed} />
                </td>
                <td className={cell}>
                  <Reply hours={r.medianHoursToRespond} />
                </td>
                <td className={cx(cell, "pr-0")}>{r.meetingsHeld}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="mt-4 flex flex-col gap-2 @min-[760px]:hidden">
        {rows.map((r) => (
          <li key={r.company.id} className="rounded-[16px] bg-raised px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-separator)]">
            <div className="flex items-center justify-between gap-3">
              <Employer record={r} />
              <span className="text-subhead tnum shrink-0">
                <Owed n={r.proofsOwed} />
              </span>
            </div>
            <dl className="text-footnote tnum mt-3 grid grid-cols-3 gap-2">
              <div>
                <dt className="text-label-2">Answered</dt>
                <dd className="text-label">
                  {r.proofsAnswered} of {r.proofsReceived}
                </dd>
              </div>
              <div>
                <dt className="text-label-2">Median reply</dt>
                <dd className="text-label">
                  <Reply hours={r.medianHoursToRespond} />
                </dd>
              </div>
              <div>
                <dt className="text-label-2">Meetings held</dt>
                <dd className="text-label">{r.meetingsHeld}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
