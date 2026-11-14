"use client";

import { ChallengeFinder } from "@/components/seeker/challenge-finder";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";

/** Every company challenge: the same role tiles, filters and list as on the home, without the greeting. */
export function ChallengeList() {
  const { data, error, loading, retry } = useSeekerData((talentId) => api.seekerHome(talentId).then((home) => home.tasks));
  return (
    <Screen title="Challenges" subtitle="Real work from Espoo companies, 5 to 30 minutes each." page tone="grey">
      {loading && !data ? (
        <div aria-busy>
          <Skeleton className="h-6 w-56" />
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-[60px] w-40 rounded-[14px]" />
            ))}
          </div>
          <Skeleton className="mt-6 h-9 w-[420px] max-w-full rounded-full" />
          <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-[16px]">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-[120px] bg-raised" />
            ))}
          </div>
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="the challenges" onRetry={retry} />
      ) : data ? (
        <div data-tour="challenge-list">
          <ChallengeFinder tasks={data} />
        </div>
      ) : null}
    </Screen>
  );
}
