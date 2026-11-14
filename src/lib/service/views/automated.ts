import { DECISION_ACTIONS } from "@/lib/domain/decision-rules";
import type { StoreData } from "@/lib/store";
import { isRegisteredReviewer } from "../reviewers";

const DECISION_LINES: ReadonlySet<string> = new Set(Object.values(DECISION_ACTIONS));

/**
 * Decisions not made by a registered person, counted over the log rather than assumed:
 * decision lines in the audit log by any actor other than a human, plus stored decisions whose
 * reviewer is not registered for that company. The API has no path that writes either, so this stays 0.
 */
export function countAutomatedDecisions(data: Pick<StoreData, "audit" | "decisions" | "companies">): number {
  const byMachine = data.audit.filter((event) => DECISION_LINES.has(event.action) && event.actor !== "human").length;
  const unregistered = data.decisions.filter((decision) => {
    const company = data.companies.find((c) => c.id === decision.companyId);
    return !company || !isRegisteredReviewer(company, decision.reviewer);
  }).length;
  return byMachine + unregistered;
}
