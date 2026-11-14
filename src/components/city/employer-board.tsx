import type { EmployerRecord } from "@/lib/domain/types";
import { Eyebrow } from "../ui/card";
import { cx } from "../ui/cx";
import { formatHours } from "./format";

const columns = ["Live for", "Proofs", "Feedback given", "Feedback owed", "Median reply", "Meetings held"];

/** On a phone: the three facts that say most about how an employer treats people. The table shows all. */
const phoneFacts = ["Proofs", "Feedback owed", "Median reply"];

function facts(r: EmployerRecord) {
  return [
    { label: columns[0], value: `${r.challengeLiveDaysBeforeEvent} ${r.challengeLiveDaysBeforeEvent === 1 ? "day" : "days"} before` },
    { label: columns[1], value: String(r.proofsReceived) },
    { label: columns[2], value: String(r.feedbackGiven) },
    { label: columns[3], value: String(r.feedbackOwed), muted: r.feedbackOwed === 0 },
    { label: columns[4], value: formatHours(r.medianHoursToRespond), muted: r.medianHoursToRespond === null },
    { label: columns[5], value: String(r.meetingsHeld) },
  ];
}

/** Each employer's record at the event. A list on phones, a table on wide screens. */
export function EmployerBoard({ employers }: { employers: EmployerRecord[] }) {
  const sorted = [...employers].sort((a, b) => a.company.name.localeCompare(b.company.name));

  return (
    <div>
      <ul className="overflow-hidden rounded-card bg-surface [--row-inset:20px] min-[900px]:hidden">
        {sorted.map((r) => (
          <li key={r.company.id} className="row relative px-5 py-4">
            <p className="text-headline font-semibold">{r.company.name}</p>
            <dl className="mt-2">
              {facts(r)
                .filter((f) => phoneFacts.includes(f.label))
                .map((f) => (
                  <div key={f.label} className="flex items-baseline justify-between gap-3 py-1">
                    <dt className="text-subhead text-label-2">{f.label}</dt>
                    <dd
                      className={cx(
                        "text-subhead tnum",
                        f.muted ? "text-label-3" : "text-label",
                        f.label === "Feedback owed" && !f.muted && "font-semibold",
                      )}
                    >
                      {f.value}
                    </dd>
                  </div>
                ))}
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-hidden rounded-card bg-surface min-[900px]:block">
        <table className="w-full text-left">
          <thead>
            <tr className="hairline-b">
              <th scope="col" className="px-5 py-3">
                <Eyebrow>Employer</Eyebrow>
              </th>
              {columns.map((c) => (
                <th key={c} scope="col" className="px-3 py-3 text-right last:pr-5">
                  <Eyebrow>{c}</Eyebrow>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((r) => (
              <tr key={r.company.id} className="[&+&]:hairline-t">
                <th scope="row" className="text-body px-5 py-3.5 font-medium whitespace-nowrap">
                  {r.company.name}
                </th>
                {facts(r).map((f) => (
                  <td
                    key={f.label}
                    className={cx(
                      "text-body tnum px-3 py-3.5 text-right whitespace-nowrap last:pr-5",
                      f.label === "Feedback owed" && !f.muted && "font-semibold",
                      f.muted ? "text-label-3" : "text-label",
                    )}
                  >
                    {f.label === "Live for" ? f.value.replace(" before", "") : f.value}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-footnote mt-2 px-5 text-label-2">
        Outcomes come from both sides confirming a meeting. Nobody fills in a survey.
      </p>
    </div>
  );
}
