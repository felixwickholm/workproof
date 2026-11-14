"use client";

import { demoReviewer, useCompanyId } from "@/components/company/company-choice";
import { CompanyLine } from "@/components/company/company-line";
import { answerWindowHours, greetingTitle } from "@/components/company/employer-format";
import { EmployerTiles } from "@/components/company/employer-tiles";
import { PipelinePanel } from "@/components/company/pipeline-panel";
import { PoolPanel } from "@/components/company/pool-panel";
import { QueuePreview } from "@/components/company/queue-preview";
import { TasksPanel } from "@/components/company/tasks-panel";
import { useOnDemoReset } from "@/components/company/use-demo-reset";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

/** Keeps the counts in step with a phone at the same table: a new proof shows within a few seconds. */
const POLL_MS = 5000;

/** Rows share the column lines of the four tiles above: 3/3/3/3, then 6/6. */
const HALVES = "grid grid-cols-[minmax(0,1fr)] gap-4 min-[1100px]:grid-cols-2";

/**
 * Hiring mode's home, as the company's reviewer sees it: the greeting with today's one fact, four
 * counts, the queue in arrival order with how long the oldest has waited, what happened after
 * reading, the live tasks, and the event's pool of work for the skills the company asks for.
 */
export function EmployerHomeView() {
  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const home = useResource(() => companyApi.home(companyId), [companyId], { pollMs: POLL_MS });
  useOnDemoReset(() => void home.reload());

  const data = home.data;
  const reviewer = demoReviewer(companyId);

  return (
    <Screen
      page
      greeting
      title={data ? greetingTitle(data.company.name, data.greeting.fact) : <GreetingSkeleton />}
      subtitle={
        <>
          {reviewer ? `You are ${reviewer}, who hires here. ` : "You are this company's reviewer. "}Demo account.
          <CompanyLine companies={companies.data} value={companyId} onChange={setCompanyId} className="mt-2" />
        </>
      }
    >
      {home.error && !data ? (
        <ErrorState error={home.error} what="this company's home" onRetry={home.retry} away={{ href: "/employer", label: "Back to Hiring" }} />
      ) : data ? (
        <div key={data.company.id} className="flex min-w-0 flex-col gap-4">
          <div className="rise" style={riseAt(1)}>
            <EmployerTiles home={data} />
          </div>
          <div className={`rise ${HALVES}`} style={riseAt(2)}>
            <QueuePreview proofs={data.queuePreview} waiting={data.counts.waiting} secondLook={data.secondLookWaiting} windowHours={answerWindowHours(data.event)} readingMinutes={data.readingMinutesOwed} />
            <div className="flex min-w-0 flex-col gap-4">
              <PipelinePanel home={data} />
              <TasksPanel tasks={data.tasks} className="flex-1" />
            </div>
          </div>
          <div className="rise" style={riseAt(3)}>
            <PoolPanel pool={data.pool} event={data.event} />
          </div>
        </div>
      ) : (
        <HomeSkeleton />
      )}
    </Screen>
  );
}

/** Two flat lines where the greeting will land, inside the h1, so the title never jumps. */
function GreetingSkeleton() {
  return (
    <span className="flex flex-col gap-3 py-1">
      <span className="sr-only">Loading this company&rsquo;s home</span>
      <Skeleton className="h-7 w-[min(560px,90%)] min-[900px]:h-11" />
      <Skeleton className="h-7 w-[min(380px,60%)] min-[900px]:h-11" />
    </span>
  );
}

/** The final layout with flat bars where the values will land, so nothing jumps when the data arrives. */
function HomeSkeleton() {
  const panel = "rounded-card bg-surface p-5";
  return (
    <div aria-busy className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4 min-[900px]:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex min-h-[128px] flex-col rounded-card bg-surface p-4 min-[900px]:p-5">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-auto h-8 w-14" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </div>
      <div className={HALVES}>
        <div className={`${panel} h-[420px]`}>
          <Skeleton className="h-3.5 w-40" />
          <Skeleton className="mt-4 h-3.5 w-64" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="mt-3 h-[78px] rounded-[14px] bg-raised" />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          <div className={`${panel} h-[200px]`}>
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="mt-8 h-16 w-full rounded-[14px]" />
          </div>
          <div className={`${panel} h-[204px]`}>
            <Skeleton className="h-3.5 w-28" />
            <div className="mt-4 h-[63px] rounded-[14px] bg-raised" />
          </div>
        </div>
      </div>
      <div className={`${panel} h-[280px]`} />
    </div>
  );
}
