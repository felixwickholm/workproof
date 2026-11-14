"use client";

import { ChallengeRows } from "@/components/seeker/challenge-rows";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";

/** Every challenge, the same list as on the home, without the greeting. */
export function ChallengeList() {
  const { data, error, loading, retry } = useSeekerData((talentId) => api.seekerHome(talentId).then((home) => home.tasks));
  return (
    <Screen title="Challenges" subtitle="Each takes 5 to 15 minutes. Think aloud while you work." page>
      {loading && !data ? (
        <div aria-busy>
          <Skeleton className="h-11 w-[520px] max-w-full" />
          <div className="mt-4 flex flex-col gap-px overflow-hidden rounded-card">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-[104px] bg-surface" />
            ))}
          </div>
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="the challenges" onRetry={retry} />
      ) : data ? (
        <ChallengeRows tasks={data} tour="challenge-list" />
      ) : null}
    </Screen>
  );
}
