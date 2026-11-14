import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { CityInsights, CityOverview } from "@/lib/domain/types";
import { Panel } from "../ui/card";
import { plural } from "./format";

interface Line {
  figure: ReactNode;
  text: string;
  /** The end-to-end check reads this figure by label. */
  total?: { label: string; value: number };
}

/** Each guardrail with the count that proves it held, built from the event's own records. */
function lines(f: CityInsights["fairness"], humanDecisions: number): Line[] {
  return [
    { figure: f.automatedDecisions, text: "automated decisions" },
    {
      figure: humanDecisions,
      text: `${humanDecisions === 1 ? "decision" : "decisions"}, each signed by a named person`,
      total: { label: "Human decisions", value: humanDecisions },
    },
    { figure: `${f.decisionsWithFeedback} of ${f.decisionsWithNamedHuman}`, text: "decisions came with a written reason" },
    { figure: f.detailsHidden, text: `personal ${f.detailsHidden === 1 ? "detail" : "details"} hidden before anyone read the work` },
    { figure: f.namesShownAfterAccept, text: `${f.namesShownAfterAccept === 1 ? "name" : "names"} shown, each only after the person said yes` },
    { figure: f.secondLookConsents, text: `${f.secondLookConsents === 1 ? "proof" : "proofs"} opened to Second look, each by the person who sent it` },
    { figure: f.wishesSetAside, text: `employer ${f.wishesSetAside === 1 ? "wish" : "wishes"} set aside before a task went live, so each task tests 3 to 5 core skills` },
  ];
}

/** The fairness audit: what the rules promise, and the count from this event that shows they held. */
export function FairnessPanel({
  fairness,
  totals,
  className,
}: {
  fairness: CityInsights["fairness"];
  totals: CityOverview["totals"];
  className?: string;
}) {
  return (
    <Panel title="Fairness audit" className={className}>
      <p className="text-subhead text-pretty text-label-2">Counted from the audit log of this event, {plural(totals.proofs, "proof")} so far.</p>
      <ul className="mt-3">
        {lines(fairness, totals.humanDecisions).map((line) => (
          <li key={line.text} data-total={line.total?.label} className="text-subhead flex items-start gap-3 py-2.5 text-pretty [&+&]:hairline-t">
            <Check aria-hidden className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.2} />
            <span className="text-label">
              <span data-value={line.total ? "" : undefined} className="tnum font-medium">
                {line.figure}
              </span>{" "}
              {line.text}
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
