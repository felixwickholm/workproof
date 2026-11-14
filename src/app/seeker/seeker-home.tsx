"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { ChallengeFinder } from "@/components/seeker/challenge-finder";
import { greetingLine, inviteNotice } from "@/components/seeker/greeting";
import { IdentityLine } from "@/components/seeker/identity-line";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { ShowMeButton } from "@/components/tour/show-me-button";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import type { SeekerHome } from "@/lib/domain/types";

/**
 * The job seeker's home, like a job board's front page: "Hi Mikko. What work do you want?", the role
 * tiles, then the challenges. A company's invite lives in My work; the home only points to it.
 */
export function SeekerHomeView() {
  const { data, error, loading, retry, refresh } = useSeekerData((talentId) => api.seekerHome(talentId));
  const title = data ? greetingLine(data.greeting.firstName) : undefined;

  return (
    <Screen greeting title={title} subtitle={data ? "Pick one or more roles. Their challenges come first." : undefined} page tone="grey">
      <ShowMeButton view="seeker" className="rise -mt-4 mb-8 min-[900px]:-mt-6" />
      {loading && !data ? (
        <HomeSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} what="your challenges" onRetry={retry} />
      ) : data ? (
        <HomeBody home={data} onSwitch={refresh} />
      ) : null}
    </Screen>
  );
}

function HomeBody({ home, onSwitch }: { home: SeekerHome; onSwitch: () => void }) {
  const notice = inviteNotice(home.invitations);
  return (
    <>
      <div className="rise -mt-3 mb-8 flex flex-col gap-3 min-[900px]:-mt-5" style={riseAt(1)}>
        <IdentityLine onSwitch={onSwitch} />
        {notice ? (
          <Link
            href="/my-work"
            className="press group flex w-full items-center gap-3 rounded-[14px] bg-peach-wash py-2.5 pr-3 pl-4 text-subhead font-medium text-label min-[640px]:w-fit"
          >
            <span className="min-w-0 flex-1">{notice}</span>
            <span className="flex shrink-0 items-center gap-1 text-link">
              Answer
              <ChevronRight aria-hidden className="size-4 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={2} />
            </span>
          </Link>
        ) : null}
      </div>
      <div data-tour="challenge-list" className="rise" style={riseAt(2)}>
        <ChallengeFinder tasks={home.tasks} />
      </div>
    </>
  );
}

function HomeSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-12 w-[min(640px,90%)]" />
      <div className="mt-8 flex flex-wrap gap-2.5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-[60px] w-40 rounded-[14px]" />
        ))}
      </div>
      <Skeleton className="mt-10 h-9 w-[min(560px,100%)] rounded-full" />
      <div className="mt-6 flex flex-col gap-px overflow-hidden rounded-[16px]">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[120px] bg-raised" />
        ))}
      </div>
    </div>
  );
}
