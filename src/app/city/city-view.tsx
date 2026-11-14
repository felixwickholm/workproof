"use client";

import { Download, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { ChallengeTable } from "@/components/city/challenge-table";
import { CitySkeleton } from "@/components/city/city-skeleton";
import { DemandPanel } from "@/components/city/demand-panel";
import { EventFlow } from "@/components/city/event-flow";
import { formatEventDate } from "@/components/city/format";
import { followUpSentence, greeting, sortTasks, tasksFor, todayStep } from "@/components/city/impact";
import { ImpactFunnel } from "@/components/city/impact-funnel";
import { MakeChallenge } from "@/components/city/make-challenge";
import { Safeguards } from "@/components/city/safeguards";
import { citySource } from "@/components/city/source";
import { useLive } from "@/components/city/use-live-city";
import { EspooFlowMap } from "@/components/espoo-map";
import { useResetDemo } from "@/components/shell/demo-actions";
import { ShowMeButton } from "@/components/tour/show-me-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import type { TaskFormat } from "@/lib/domain/types";

/** A small quiet label, set once on the page: every figure here is invented. */
function DemoLabel() {
  return <span className="text-footnote shrink-0 whitespace-nowrap rounded-full bg-fill px-2.5 py-0.5 text-label-2">Demo data</span>;
}

/**
 * The city's view answers three questions: what came of this event, how each challenge did, and where
 * the demand is. Then the city's own tools: make a challenge for a company, the event's steps, and how
 * people are kept safe.
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

  return (
    <Screen page greeting title={greeting(data.event.name, counts)} subtitle={formatEventDate(data.event.date)}>
      <ShowMeButton view="city" className="rise -mt-4 mb-10 min-[900px]:-mt-6" />
      <div className="flex flex-col gap-4">
        <Card tour="city-funnel" className="min-[900px]:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-section text-label">What came of this event</h2>
            <DemoLabel />
          </div>
          <ImpactFunnel counts={counts} className="mt-6" />
          <div data-tour="city-talks" className="mt-6 flex flex-col gap-3 hairline-t pt-5 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
            <p className="text-title-3 text-pretty text-label">{followUpSentence(counts.followUps)}</p>
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

        <Card className="min-[900px]:p-8">
          <h2 className="text-section text-label">Challenge leaderboard</h2>
          <p className="text-subhead mt-1 mb-4 text-label-2">Open a challenge to see its best work and offer it to another company.</p>
          {tasks.length > 0 ? (
            <ChallengeTable tasks={tasks} formats={formats} oldest={oldest} company={company?.name ?? null} onClearCompany={() => setCompanyId(null)} />
          ) : (
            <p className="text-body text-label-2">No challenge is live yet. Each one shows here with its numbers.</p>
          )}
        </Card>

        <div className="grid grid-cols-1 gap-4 min-[1100px]:grid-cols-12">
          <Card tour="city-map" className="min-[1100px]:col-span-7">
            <h2 className="text-section text-label">Where the work goes</h2>
            <p className="text-subhead mt-1 text-label-2">Tap a company to see its challenges.</p>
            <EspooFlowMap
              variant="panel"
              live
              companies={insights.companies}
              flows={insights.flows}
              onSelectCompany={setCompanyId}
              className="mt-4"
            />
          </Card>
          <Card tour="city-demand" className="min-[1100px]:col-span-5">
            <h2 className="text-section mb-3 text-label">What companies ask for</h2>
            <DemandPanel demand={insights.demandBySkill} />
          </Card>
        </div>

        <MakeChallenge companies={insights.companies} />

        <Card>
          <h2 className="text-section mb-4 text-label">How the event works</h2>
          <EventFlow today={todayStep(data.event.date, new Date(), counts)} />
        </Card>

        <Safeguards />

        <footer className="mt-4 flex flex-col items-start gap-2 hairline-t pt-4 min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between">
          <p className="text-footnote text-label-2">All people and companies are invented. Built for the City of Espoo challenge.</p>
          <Button variant="quiet" size="sm" onClick={reset} loading={busy} className="-ml-4 min-[640px]:ml-0 min-[640px]:-mr-4">
            {busy ? null : <RotateCcw aria-hidden className="size-4" strokeWidth={1.75} />}
            Reset demo
          </Button>
        </footer>
      </div>
    </Screen>
  );
}
