import type { CityInsights } from "@/lib/domain/types";
import { EspooFlowMap } from "../espoo-map";
import { Panel } from "../ui/card";

/**
 * The city's one picture: every proof travelling from the event to the company that reads it.
 * No count beside the title: the totals are in the tiles above, once.
 */
export function FlowMapPanel({ insights, className }: { insights: CityInsights; className?: string }) {
  return (
    <Panel title="Proofs reaching companies" className={className}>
      <EspooFlowMap variant="panel" live companies={insights.companies} flows={insights.flows} />
    </Panel>
  );
}
