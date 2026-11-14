"use client";

import { Download, RotateCcw } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import { BarRows, type BarRow } from "@/components/city/bar-rows";
import { ChallengeTable } from "@/components/city/challenge-table";
import { LegendKey, SCORED_TONE, WAITING_TONE } from "@/components/city/chart-tip";
import { companyTimelines, funnelBars, lengthOf, scoredByCompany } from "@/components/city/charts";
import { DemandPanel } from "@/components/city/demand-panel";
import { CitySkeleton } from "@/components/city/city-skeleton";
import { formatEventDate } from "@/components/city/format";
import { HiringNow } from "@/components/city/make-challenge";
import { followUpSentence, greeting, sortTasks, tasksFor } from "@/components/city/impact";
import { Safeguards } from "@/components/city/safeguards";
import { citySource } from "@/components/city/source";
import { TimeChart } from "@/components/city/time-chart";
import { useLive } from "@/components/city/use-live-city";
import { EspooFlowMap } from "@/components/espoo-map";
import { useResetDemo } from "@/components/shell/demo-actions";
import { ShowMeButton } from "@/components/tour/show-me-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import type { CityOverview, TaskFormat } from "@/lib/domain/types";

/** A small quiet label, set once on the page: every figure here is invented. */
function DemoLabel() {
  return <span className="text-footnote shrink-0 whitespace-nowrap rounded-full bg-fill px-2.5 py-0.5 text-label-2">Demo data</span>;
}

/** A chart's card: a title that says what is plotted, one line on how to read it, then the chart. */
function ChartCard({ title, lead, tour, className, children }: { title: string; lead: string; tour?: string; className?: string; children: ReactNode }) {
  return (
    <Card tour={tour} className={className}>
      <h2 className="text-section text-label">{title}</h2>
      <p className="text-subhead mt-1 mb-5 text-pretty text-label-2">{lead}</p>
      {children}
    </Card>
  );
}

/** The funnel from challenges taken to hires, measured against the first step. Hires stand apart: companies report them late. */
function funnelRows(counts: CityOverview["insights"]["impact"]["event"]): BarRow[] {
  return funnelBars(counts).map((b) => ({
    key: b.key,
    label: b.label,
    note: b.ofBefore,
    segments: [{ share: b.share, tone: b.key === "hires" ? "bg-label-3" : SCORED_TONE, tip: { value: String(b.value), label: b.label } }],
    value: b.value,
    total: b.label,
    apart: b.key === "hires",
  }));
}

/**
 * The City of Espoo view leads with graphs: what came of the event, scored against waiting work, work and
 * challenges over time, and the roles in demand. Then the city's job: companies hiring right now, each a
 * challenge away, and the Espoo map. The challenge table and the safeguards close the page.
 */
export function CityView() {
  const { data, error, loading, retry } = useLive(citySource.overview);
  const { data: challenges } = useLive(citySource.challenges);
  const { data: actions } = useLive(citySource.actions);
  const { reset, busy } = useResetDemo();
  const [companyId, setCompanyId] = useState<string | null>(null);

  const formats = useMemo(() => Object.fromEntries((challenges ?? []).map((c) => [c.id, c.format])) as Record<string, TaskFormat>, [challenges]);

  // A reminder names one company's waiting work; with one task in it, its oldest wait is that task's.
  const oldest = useMemo(() => {
    const byTitle = new Map((data?.insights.impact.tasks ?? []).map((t) => [t.title, t.challengeId]));
    const hours: Record<string, number> = {};
    for (const r of actions?.reminders ?? []) {
      const only = r.tasks.length === 1 ? byTitle.get(r.tasks[0].title) : undefined;
      if (only) hours[only] = r.oldestHours;
    }
    return hours;
  }, [actions, data]);

  if (!data) {
    return (
      <Screen page greeting>
        {loading ? <CitySkeleton /> : <ErrorState error={error} what="the event overview" onRetry={retry} />}
      </Screen>
    );
  }

  const { insights } = data;
  const counts = insights.impact.event;
  const company = insights.companies.find((c) => c.id === companyId) ?? null;
  const tasks = tasksFor(sortTasks(insights.impact.tasks), company?.name ?? null);
  const list = challenges ?? [];

  const scoring = scoredByCompany(insights.companies, insights.impact.tasks);
  const scoringMax = Math.max(0, ...scoring.map((c) => c.scored + c.waiting));
  const scoredTotal = counts.scored;
  const waitingTotal = Math.max(0, counts.took - counts.scored);
  const scoringRows: BarRow[] = scoring.map((c) => ({
    key: c.companyId,
    label: c.name,
    segments: [
      { share: lengthOf(c.scored, scoringMax), tone: SCORED_TONE, tip: { value: `${c.scored} scored`, label: c.name } },
      { share: lengthOf(c.waiting, scoringMax), tone: WAITING_TONE, tip: { value: `${c.waiting} waiting`, label: c.name } },
    ].filter((s) => s.share > 0),
    value: `${c.scored}/${c.scored + c.waiting}`,
  }));

  const days = insights.arrivalsByDay;
  const timelines = companyTimelines(insights.companies, list, insights.impact.tasks, days.map((d) => d.day));

  return (
    <Screen page greeting title={greeting(data.event.name, counts)} subtitle={formatEventDate(data.event.date)}>
      <ShowMeButton view="city" className="rise -mt-4 mb-10 min-[900px]:-mt-6" />
      <div className="flex flex-col gap-4">
        <div data-tour="city-charts" className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-12">
          <Card tour="city-funnel" className="min-[1100px]:col-span-7 min-[900px]:p-8">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-section text-label">From challenge to hire</h2>
                <p className="text-subhead mt-1 text-pretty text-label-2">Each piece of work counted once. The small line under a step is its share of the step before.</p>
              </div>
              <DemoLabel />
            </div>
            <div className="mt-5">
              <BarRows label="From challenge to hire" rows={funnelRows(counts)} />
            </div>
            <div data-tour="city-talks" className="mt-5 flex flex-col gap-3 hairline-t pt-4 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
              <p className="text-body text-pretty text-label">{followUpSentence(counts.followUps)}</p>
              <a
                href="/api/city/meetings.csv"
                download
                className="press text-subhead inline-flex h-11 shrink-0 items-center gap-2 self-start rounded-full bg-fill px-4 font-semibold text-label hover:bg-label/10 min-[900px]:self-auto"
              >
                <Download aria-hidden className="size-4" strokeWidth={1.75} />
                Export talks
              </a>
            </div>
          </Card>

          <ChartCard
            title="Scored or waiting"
            lead={`${scoredTotal} pieces of work scored, ${waitingTotal} waiting for a person to read them.`}
            className="min-[1100px]:col-span-5 min-[900px]:p-8"
          >
            <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1">
              <LegendKey tone={SCORED_TONE}>Scored</LegendKey>
              <LegendKey tone={WAITING_TONE}>Waiting</LegendKey>
            </div>
            {scoringRows.length > 0 ? (
              <BarRows label="Scored and waiting work per company" rows={scoringRows} />
            ) : (
              <p className="text-body text-label-2">No work is in yet.</p>
            )}
          </ChartCard>

          <ChartCard
            title="Challenges and work over time"
            lead="Work handed in each day, and when each company published its challenges. The event day is in bold. The number at the end of a row is the work its challenges got."
            className="min-[1100px]:col-span-7 min-[900px]:p-8"
          >
            <TimeChart days={days} eventDay={data.event.date} companies={timelines} />
          </ChartCard>

          <ChartCard title="Roles in demand" lead="Places companies opened per role: how many answers they will read." tour="city-demand" className="min-[1100px]:col-span-5 min-[900px]:p-8">
            <DemandPanel challenges={list} tasks={insights.impact.tasks} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-12">
          <div className="min-[1100px]:col-span-7">
            <HiringNow companies={insights.companies} challenges={list} />
          </div>
          <Card tour="city-map" className="min-[1100px]:col-span-5 min-[900px]:p-8">
            <h2 className="text-section text-label">Where the work goes</h2>
            <p className="text-subhead mt-1 text-label-2">Tap a company to see its challenges below.</p>
            <EspooFlowMap variant="panel" live companies={insights.companies} flows={insights.flows} onSelectCompany={setCompanyId} className="mt-4" />
          </Card>
        </div>

        <Card className="min-[900px]:p-8">
          <h2 className="text-section text-label">Every challenge</h2>
          <p className="text-subhead mt-1 mb-4 text-label-2">Open a challenge to see its best work and offer it to another company.</p>
          {tasks.length > 0 ? (
            <ChallengeTable tasks={tasks} formats={formats} oldest={oldest} company={company?.name ?? null} onClearCompany={() => setCompanyId(null)} />
          ) : (
            <p className="text-body text-label-2">No challenge is live yet. Each one shows here with its numbers.</p>
          )}
        </Card>

        <Safeguards />

        <footer className="mt-4 flex flex-col items-start gap-2 hairline-t pt-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p className="text-footnote text-label-2">All people, companies and job ads are invented. Built for the City of Espoo challenge.</p>
          <Button variant="quiet" size="sm" onClick={reset} loading={busy} className="-ml-4 min-[640px]:ml-0 min-[640px]:-mr-4">
            {busy ? null : <RotateCcw aria-hidden className="size-4" strokeWidth={1.75} />}
            Reset demo
          </Button>
        </footer>
      </div>
    </Screen>
  );
}
