"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChallengeRow, ChallengeRowSkeleton, challengeHref } from "@/components/company/challenge-row";
import { useCompanyId, useCompanyKnown } from "@/components/company/company-choice";
import { CompanyLine } from "@/components/company/company-line";
import { EventSteps } from "@/components/company/event-steps";
import { companyErrorText } from "@/components/company/format";
import { currentEventStep, factsLine, greetingLine } from "@/components/company/hiring-words";
import { useOnDemoReset } from "@/components/company/use-demo-reset";
import { ShowMeButton } from "@/components/tour/show-me-button";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import { endSentence } from "@/lib/domain/sentence";
import type { Challenge, CompanyTaskSummary, EmployerHome, ReviewQueue } from "@/lib/domain/types";

/** Keeps the numbers in step with a phone at the same table: new work shows within a few seconds. */
const POLL_MS = 5000;

interface HomeData {
  home: EmployerHome;
  tasks: CompanyTaskSummary[];
  queue: ReviewQueue;
}

async function loadHome(companyId: string): Promise<HomeData> {
  const [home, tasks, queue] = await Promise.all([companyApi.home(companyId), companyApi.tasks(companyId), companyApi.queue(companyId)]);
  return { home, tasks, queue };
}

/**
 * Hiring mode's home: "My challenges". The greeting says what happened, then one row per challenge
 * with its four steps as numbers and the one action that matters now. A challenge the city made for
 * the company comes first until the company opens it.
 */
export function EmployerHomeView() {
  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const known = useCompanyKnown();
  const data = useResource(known ? () => loadHome(companyId) : null, [companyId, known], { pollMs: POLL_MS });
  useOnDemoReset(() => void data.reload());

  const d = data.data;
  const waitingFor = (id: string) => d?.home.tasks.find((t) => t.challenge.id === id)?.waiting ?? 0;
  const took = d ? d.tasks.reduce((sum, t) => sum + t.counts.took, 0) : 0;
  const waiting = d ? d.tasks.reduce((sum, t) => sum + waitingFor(t.challenge.id), 0) : 0;

  return (
    <Screen
      page
      greeting
      title={d ? greetingLine(d.home.company.name, took, waiting) : <GreetingSkeleton />}
      subtitle={<CompanyLine companies={companies.data} value={companyId} onChange={setCompanyId} />}
    >
      <ShowMeButton view="employer" className="rise -mt-4 mb-10 min-[900px]:-mt-6" />
      {data.error && !d ? (
        <ErrorState error={data.error} what="your challenges" onRetry={data.retry} away={{ href: "/", label: "Back to the start" }} />
      ) : (
        <div key={companyId} className="flex min-w-0 flex-col">
          <div className="rise flex items-center justify-between gap-4" style={riseAt(1)}>
            <h2 className="text-title font-semibold text-label">My challenges</h2>
            <Button href="/company" size="sm" className="min-[900px]:h-11 min-[900px]:px-5">
              <Plus aria-hidden className="size-5" strokeWidth={1.75} />
              New challenge
            </Button>
          </div>

          {d ? (
            <div className="rise" style={riseAt(2)}>
              {d.home.unclaimed.map((u) => (
                <CityMadeRow key={u.challenge.id} challenge={u.challenge} proofs={u.proofs} companyId={companyId} />
              ))}
              {d.tasks.length === 0 ? (
                <EmptyState
                  className="mt-6"
                  action={
                    <Button href="/company" variant="secondary" size="sm">
                      Make your first challenge
                    </Button>
                  }
                >
                  You have no challenge yet. Paste your job ad link and we draft one.
                </EmptyState>
              ) : (
                <ul className="mt-2 divide-y divide-separator">
                  {d.tasks.map((t) => (
                    <ChallengeRow
                      key={t.challenge.id}
                      challenge={t.challenge}
                      counts={t.counts}
                      waiting={waitingFor(t.challenge.id)}
                      firstWaiting={d.queue.proofs.find((p) => p.challengeId === t.challenge.id)?.proofId ?? null}
                    />
                  ))}
                </ul>
              )}
              <p className="text-subhead mt-4 border-t border-separator pt-4 text-label-2">{factsLine(d.home.counts.medianHoursToRespond, d.home.counts.feedbackOwed)}</p>
              <EventSteps
                className="mt-16"
                current={currentEventStep({
                  took,
                  scored: d.tasks.reduce((sum, t) => sum + t.counts.scored, 0),
                  invited: d.tasks.reduce((sum, t) => sum + t.counts.invited, 0),
                  met: d.home.pipeline.find((p) => p.stage === "Met")?.count ?? 0,
                })}
              />
            </div>
          ) : (
            <ul aria-busy className="mt-2 divide-y divide-separator">
              <ChallengeRowSkeleton />
              <ChallengeRowSkeleton />
            </ul>
          )}
        </div>
      )}
    </Screen>
  );
}

/**
 * The city made this challenge for the company from its job ad, and people already did it. One
 * button opens it: the company claims it and lands on its top work.
 */
function CityMadeRow({ challenge, proofs, companyId }: { challenge: Challenge; proofs: number; companyId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      await companyApi.claim(challenge.id, companyId);
      router.push(challengeHref(challenge.id));
    } catch (e) {
      setError(companyErrorText(e));
      setBusy(false);
    }
  }

  return (
    <div className="mt-4 flex flex-col gap-4 rounded-card bg-tint p-5 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-8 min-[900px]:p-6">
      <div className="min-w-0 flex-1">
        <p className="text-title-3 font-semibold text-pretty text-label">The City of Espoo made a challenge for you: {endSentence(challenge.title)}</p>
        <p className="text-body mt-1 text-label-2">
          {proofs} {proofs === 1 ? "person" : "people"} already did it.
        </p>
        {error ? (
          <p role="alert" className="text-footnote mt-2 text-label-2">
            {error}
          </p>
        ) : null}
      </div>
      <Button onClick={() => void open()} loading={busy} size="sm" className="min-[900px]:h-11 min-[900px]:px-6">
        See how they did
      </Button>
    </div>
  );
}

/** Two flat lines where the greeting will land, inside the h1, so the title never jumps. */
function GreetingSkeleton() {
  return (
    <span className="flex flex-col gap-3 py-1">
      <span className="sr-only">Loading your challenges</span>
      <Skeleton className="h-7 w-[min(560px,90%)] min-[900px]:h-11" />
      <Skeleton className="h-7 w-[min(380px,60%)] min-[900px]:h-11" />
    </span>
  );
}
