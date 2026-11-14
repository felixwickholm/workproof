"use client";

import { useState } from "react";
import { TaskCard } from "@/components/proof";
import { greetingLine, homeCountLine } from "@/components/seeker/greeting";
import { IdentityLine, useIdentity, usePersonaName } from "@/components/seeker/identity-line";
import { InvitationCard } from "@/components/seeker/invitation-card";
import { KindChips } from "@/components/seeker/kind-chips";
import { ownersFrom } from "@/components/seeker/pass-face";
import { PassportPanel } from "@/components/seeker/passport-panel";
import { arrangeTasks, countByKind, filterByKind, type KindFilter } from "@/components/seeker/task-filter";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { Panel } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PROOF_KIND_LABEL } from "@/components/ui/proof-kind";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { getSavedIdentity } from "@/lib/client/local";
import type { SeekerHome } from "@/lib/domain/types";

/** Rows in "Tasks open today"; the rest are one tap away under "View all". */
const FEED_ROWS = 5;

/**
 * The work seeker's home: a greeting with today's one fact and one grey line of counts, the
 * invitations first, the open tasks in the same order for everyone, and the passport as a wallet.
 */
export function SeekerHomeView() {
  const { data, error, loading, retry, reload, refresh } = useSeekerData((talentId) => api.seekerHome(talentId));
  const title = data ? greetingLine(data.greeting.firstName, data.greeting.fact, new Date().getHours()) : undefined;

  return (
    <Screen greeting title={title} subtitle={data ? homeCountLine(data.counts) : undefined} page>
      {loading && !data ? (
        <HomeSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} what="your home" onRetry={retry} />
      ) : data ? (
        <HomeBody home={data} onChanged={reload} onSwitch={refresh} />
      ) : null}
    </Screen>
  );
}

function HomeBody({ home, onChanged, onSwitch }: { home: SeekerHome; onChanged: () => Promise<void>; onSwitch: () => void }) {
  const identity = useIdentity();
  const persona = usePersonaName();
  const personName = identity === "persona" ? (persona?.full ?? "Your name") : getSavedIdentity().name || "Your name";
  const { invitations, passport, tasks } = home;

  const ownersOf = ownersFrom(tasks);
  const reviewerOf = (proofId: string, companyName: string) =>
    invitations.find((i) => i.proofId === proofId && i.companyName === companyName)?.reviewer;
  const confirmedByMe = (meetingId: string) =>
    passport.some((e) => e.responses.some((r) => r.meeting?.id === meetingId && r.meeting.talentConfirmedMet));

  return (
    <>
      <IdentityLine onSwitch={onSwitch} className="rise -mt-4 mb-8 min-[900px]:-mt-6 min-[900px]:mb-10" />

      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] min-[900px]:items-start">
        <div className="rise" style={riseAt(1)}>
          <Panel title="Invitations" count={invitations.length}>
            {invitations.length ? (
              <div className="flex flex-col gap-3">
                {invitations.map((inv) => (
                  <InvitationCard
                    key={inv.meetingId}
                    invitation={inv}
                    personName={personName}
                    confirmedByMe={confirmedByMe(inv.meetingId)}
                    onChanged={onChanged}
                    tour="invitation"
                  />
                ))}
              </div>
            ) : (
              <EmptyState>No invitations yet. Every decision comes with a written reason, also a no.</EmptyState>
            )}
          </Panel>
        </div>
        <div className="rise" style={riseAt(2)}>
          <TaskFeed tasks={tasks} />
        </div>
      </div>

      <div className="rise mt-4" style={riseAt(3)}>
        <PassportPanel passport={passport} ownersOf={ownersOf} reviewerOf={reviewerOf} />
      </div>
    </>
  );
}

function TaskFeed({ tasks }: { tasks: SeekerHome["tasks"] }) {
  const [kind, setKind] = useState<KindFilter>("all");
  const { open, full, sent } = arrangeTasks(filterByKind(tasks, kind));
  const shown = [...open, ...full, ...sent].slice(0, FEED_ROWS);
  return (
    <Panel title="Tasks open today" count={tasks.length} href="/challenges" tour="task-feed">
      <KindChips value={kind} onChange={setKind} counts={countByKind(tasks)} />
      <p className="text-footnote mt-2 mb-3 text-pretty text-label-2">
        Newest first. The same list for everyone: no profile, no match score. Each task takes a limited number of answers, so every one can be read.
      </p>
      {shown.length ? (
        <ul className="flex flex-col gap-2">
          {shown.map((t) => (
            <li key={t.challenge.id}>
              <TaskCard
                variant="row"
                challenge={t.challenge}
                companies={t.companies}
                href={`/challenges/${t.challenge.id}`}
                proofsSent={t.proofsSent}
                medianReplyHours={t.medianReplyHours}
                mine={t.mine}
                placesLeft={t.placesLeft}
              />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState>{kind === "all" ? "No task is open today." : `No ${PROOF_KIND_LABEL[kind].toLowerCase()} task is open today. Try another kind.`}</EmptyState>
      )}
    </Panel>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-9 w-[min(640px,90%)] min-[900px]:h-12" />
      <Skeleton className="mt-3 h-9 w-[min(420px,70%)] min-[900px]:hidden" />
      <Skeleton className="mt-4 h-4 w-[min(520px,90%)]" />
      <div className="mt-8 grid grid-cols-1 gap-4 min-[900px]:mt-12 min-[900px]:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div className="h-[340px] rounded-card bg-surface" />
        <div className="h-[460px] rounded-card bg-surface" />
      </div>
    </div>
  );
}
