"use client";

import { RotateCcw } from "lucide-react";
import { AiLedger } from "@/components/city/ai-ledger";
import { AnswersOwed } from "@/components/city/answers-owed";
import { ArrivalsPanel } from "@/components/city/arrivals-panel";
import { AuditLog } from "@/components/city/audit-log";
import { CitySkeleton } from "@/components/city/city-skeleton";
import { DemandPanel } from "@/components/city/demand-panel";
import { EventRulesCard } from "@/components/city/event-rules";
import { FairnessPanel } from "@/components/city/fairness-panel";
import { answeredFact } from "@/components/city/figures";
import { FlowMapPanel } from "@/components/city/flow-map-panel";
import { formatEventDate } from "@/components/city/format";
import { FunnelPanel } from "@/components/city/funnel-panel";
import { OrganiserActions } from "@/components/city/organiser-actions";
import { OutcomeTiles } from "@/components/city/outcome-tiles";
import { OwedReminders } from "@/components/city/owed-reminders";
import { PooledPanel } from "@/components/city/pooled-panel";
import { ProofKindsPanel } from "@/components/city/proof-kinds-panel";
import { RulesPanel } from "@/components/city/rules-panel";
import { useCityActions } from "@/components/city/use-city-actions";
import { useLiveCity } from "@/components/city/use-live-city";
import { useResetDemo } from "@/components/shell/demo-actions";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";

/** Two panels side by side from a wide column, one above the other on a phone. */
const row = "grid grid-cols-1 gap-4 @min-[960px]:grid-cols-12";

/**
 * The city's home: did people get an answer, did meetings happen, and did a person make every
 * decision. Then how the work moved, who still owes an answer, and the audit trail behind it all.
 */
export function CityView() {
  const { data, error, loading, retry } = useLiveCity();
  const { reset, busy } = useResetDemo();
  const { data: actions } = useCityActions();

  if (!data) {
    return (
      <Screen page greeting>
        {loading ? <CitySkeleton /> : <ErrorState error={error} what="the event overview" onRetry={retry} />}
      </Screen>
    );
  }

  const { insights, totals } = data;
  return (
    <Screen
      page
      greeting
      title={`${data.event.name}. ${answeredFact(totals.proofsAnswered)}`}
      subtitle={`${formatEventDate(data.event.date)}. The city's two jobs in one view: people find work, companies find people.`}
    >
      <div className="@container flex flex-col gap-4">
        <OrganiserActions employersOwing={actions?.reminders.length ?? 0} className="-mt-2 mb-4 min-[900px]:-mt-4 min-[900px]:mb-6" />
        {/* The walkthrough's city step lights the outcomes and the event's rules: one screen tall. */}
        <div data-tour="city-outcomes" className="grid grid-cols-1 gap-4 @min-[1000px]:grid-cols-12">
          <OutcomeTiles totals={totals} className="@min-[1000px]:col-span-9" />
          <EventRulesCard rules={actions?.rules ?? null} className="@min-[1000px]:col-span-3" />
        </div>
        <div className={row}>
          <FlowMapPanel insights={insights} className="@container @min-[960px]:col-span-8" />
          <FunnelPanel funnel={insights.funnel} className="@min-[960px]:col-span-4" />
        </div>

        <div className={row}>
          <DemandPanel demand={insights.demandBySkill} className="@container @min-[960px]:col-span-6" />
          <ProofKindsPanel byKind={insights.byProofKind} totals={totals} className="@min-[960px]:col-span-6" />
        </div>

        <div className={row}>
          <PooledPanel
            pooled={insights.pooled}
            companies={insights.companies}
            secondLookMeetings={totals.secondLookMeetings}
            className="@min-[960px]:col-span-6"
          />
          <ArrivalsPanel days={insights.arrivalsByDay} className="@min-[960px]:col-span-6" />
        </div>

        <AnswersOwed employers={data.employers} className="@container" />
        <OwedReminders actions={actions} className="@container" />

        <div className={row}>
          <FairnessPanel fairness={insights.fairness} totals={totals} className="@min-[960px]:col-span-6" />
          <RulesPanel className="@min-[960px]:col-span-6" />
        </div>

        <div className={row}>
          <AiLedger audit={data.audit} className="@min-[960px]:col-span-4" />
          <AuditLog events={data.audit} className="@container @min-[960px]:col-span-8" />
        </div>

        <footer className="mt-8 flex flex-col items-start gap-2 hairline-t pt-4 @min-[640px]:flex-row @min-[640px]:items-center @min-[640px]:justify-between">
          <p className="text-footnote text-label-2">Demo data. All people and companies are invented. Built for the City of Espoo challenge, Junction 2026.</p>
          <Button variant="quiet" size="sm" onClick={reset} loading={busy} className="-ml-4 @min-[640px]:ml-0 @min-[640px]:-mr-4">
            {busy ? null : <RotateCcw aria-hidden className="size-4" strokeWidth={1.7} />}
            Reset demo
          </Button>
        </footer>
      </div>
    </Screen>
  );
}
