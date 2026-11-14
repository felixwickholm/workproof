"use client";

import { AiLedger } from "@/components/city/ai-ledger";
import { AuditLog } from "@/components/city/audit-log";
import { CityFrame } from "@/components/city/city-frame";
import { EmployerBoard } from "@/components/city/employer-board";
import { formatEventDate } from "@/components/city/format";
import { ResetDemo } from "@/components/city/reset-demo";
import { SummaryTiles, SummaryTilesSkeleton } from "@/components/city/summary-tiles";
import { Section } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

/** The event officer's view. Polls so numbers move while the demo runs. */
export function CityView() {
  const { data, error, loading, retry, reload } = useResource(() => api.city(), [], { pollMs: 5000 });

  if (!data) {
    return (
      <CityFrame>
        {loading ? (
          <div aria-busy>
            <Skeleton className="h-9 w-64" />
            <Skeleton className="mt-3 mb-6 h-4 w-48" />
            <SummaryTilesSkeleton />
          </div>
        ) : (
          <ErrorState error={error} what="the event overview" onRetry={retry} />
        )}
      </CityFrame>
    );
  }

  return (
    <CityFrame>
      <div className="rise mb-6">
        <h1 className="text-large-title font-bold text-balance">{data.event.name}</h1>
        <p className="text-body tnum mt-1 text-label-2">{formatEventDate(data.event.date)}</p>
      </div>

      <div className="rise" style={riseAt(1)}>
        <SummaryTiles totals={data.totals} feedbackOwed={data.employers.reduce((sum, e) => sum + e.feedbackOwed, 0)} />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 min-[900px]:grid-cols-[minmax(0,1fr)_340px] min-[900px]:gap-x-8 min-[900px]:[grid-template-areas:'employers_ai'_'audit_ai']">
        <Section label="Employers" className="rise mt-0 min-[900px]:[grid-area:employers]" >
          <EmployerBoard employers={data.employers} />
        </Section>

        <div className="rise min-[900px]:sticky min-[900px]:top-20 min-[900px]:self-start min-[900px]:[grid-area:ai]" style={riseAt(2)}>
          <AiLedger audit={data.audit} />
        </div>

        <Section label="Audit log" className="rise mt-0 min-[900px]:[grid-area:audit]">
          <AuditLog events={data.audit} />
        </Section>
      </div>

      <div className="mt-12 flex justify-center">
        <ResetDemo onDone={reload} />
      </div>
    </CityFrame>
  );
}
