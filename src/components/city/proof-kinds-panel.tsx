import { PROOF_KINDS } from "@/lib/domain/kinds";
import type { CityInsights, CityOverview } from "@/lib/domain/types";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { PROOF_KIND_LABEL, ProofKindIcon } from "../ui/proof-kind";

/** Every way a task can be answered, with how many tasks ask for it and how many proofs came in. */
export function ProofKindsPanel({
  byKind,
  totals,
  className,
}: {
  byKind: CityInsights["byProofKind"];
  totals: CityOverview["totals"];
  className?: string;
}) {
  const rows = PROOF_KINDS.map((kind) => byKind.find((k) => k.kind === kind) ?? { kind, tasks: 0, proofs: 0 });

  return (
    <Panel title="Seven kinds of work" className={className}>
      <p className="text-subhead text-pretty text-label-2">Not everyone writes code or essays. A task can ask for writing, a plan, a photo, a short video, a voice answer, a design or code.</p>
      <table className="mt-4 w-full text-left">
        <thead>
          <tr className="hairline-b">
            <th scope="col" className="text-footnote py-2 font-normal text-label-2">
              Proof
            </th>
            <th scope="col" className="text-footnote w-20 py-2 text-right font-normal text-label-2">
              Tasks
            </th>
            <th scope="col" className="text-footnote w-20 py-2 text-right font-normal text-label-2">
              Proofs
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const none = row.tasks === 0;
            return (
              <tr key={row.kind} className="hairline-b">
                <th scope="row" className="py-2.5 font-normal">
                  <span className={cx("text-subhead flex items-center gap-2.5", none ? "text-label-2" : "text-label")}>
                    <ProofKindIcon kind={row.kind} className="text-label-2" />
                    {PROOF_KIND_LABEL[row.kind]}
                  </span>
                </th>
                <td className={cx("text-subhead tnum py-2.5 text-right", none ? "text-label-3" : "text-label")}>{row.tasks}</td>
                <td className={cx("text-subhead tnum py-2.5 text-right", none ? "text-label-3" : "text-label")}>{row.proofs}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" className="text-subhead pt-3 font-medium text-label">
              Tasks live
            </th>
            <td data-total="Tasks live" className="text-subhead tnum pt-3 text-right font-medium text-label">
              <span data-value>{totals.challenges}</span>
            </td>
            <td className="text-subhead tnum pt-3 text-right font-medium text-label">{totals.proofs}</td>
          </tr>
        </tfoot>
      </table>
    </Panel>
  );
}
