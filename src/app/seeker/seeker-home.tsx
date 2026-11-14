"use client";

import { ChallengeRows } from "@/components/seeker/challenge-rows";
import { greetingLine, homeFact } from "@/components/seeker/greeting";
import { IdentityLine } from "@/components/seeker/identity-line";
import { InvitationFocus } from "@/components/seeker/invitation-focus";
import { arrangeTasks } from "@/components/seeker/task-filter";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { ShowMeButton } from "@/components/tour/show-me-button";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import type { SeekerHome } from "@/lib/domain/types";

/**
 * "Challenges for you": a greeting with today's one fact, an open invitation as the one focal
 * thing, then every challenge as a large row, the same list for everyone.
 */
export function SeekerHomeView() {
  const { data, error, loading, retry, reload, refresh } = useSeekerData((talentId) => api.seekerHome(talentId));
  const title = data ? greetingLine(data.greeting.firstName, homeFact(data.invitations, arrangeTasks(data.tasks).open.length), new Date().getHours()) : undefined;

  return (
    <Screen greeting title={title} page>
      {loading && !data ? (
        <HomeSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} what="your challenges" onRetry={retry} />
      ) : data ? (
        <HomeBody home={data} onChanged={reload} onSwitch={refresh} />
      ) : null}
    </Screen>
  );
}

function HomeBody({ home, onChanged, onSwitch }: { home: SeekerHome; onChanged: () => Promise<void>; onSwitch: () => void }) {
  const { invitations, passport, tasks } = home;
  // The newest invitation that still needs an answer is the focus; otherwise the newest one at all.
  const focus = invitations.find((i) => i.status === "invited") ?? invitations[0];
  const response = focus ? passport.find((e) => e.proof.proofId === focus.proofId)?.responses.find((r) => r.companyName === focus.companyName) : undefined;
  const confirmedByMe = (meetingId: string) => passport.some((e) => e.responses.some((r) => r.meeting?.id === meetingId && r.meeting.talentConfirmedMet));

  return (
    <>
      <div className="rise -mt-4 mb-10 flex flex-col gap-4 min-[900px]:-mt-6" style={riseAt(1)}>
        <ShowMeButton view="seeker" />
        <IdentityLine onSwitch={onSwitch} />
      </div>

      {focus ? (
        <div className="rise mb-12" style={riseAt(2)}>
          <InvitationFocus invitation={focus} response={response} confirmedByMe={confirmedByMe(focus.meetingId)} onChanged={onChanged} tour="invitation" />
        </div>
      ) : null}

      <h2 className="text-[28px] leading-[34px] font-semibold tracking-[-0.02em] text-label">Challenges for you</h2>
      <p className="text-body mt-1 mb-6 text-label-2">Each takes 5 to 15 minutes. Think aloud while you work.</p>
      <ChallengeRows tasks={tasks} tour="challenge-list" />
    </>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-12 w-[min(640px,90%)]" />
      <Skeleton className="mt-6 h-14 w-56" />
      <div className="mt-10 h-[280px] rounded-card bg-surface" />
      <Skeleton className="mt-12 h-8 w-64" />
      <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-card">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[104px] bg-surface" />
        ))}
      </div>
    </div>
  );
}
