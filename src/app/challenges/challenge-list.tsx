"use client";

import { ProblemCard, ProblemCardSkeleton } from "@/components/problem-card";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

export function ChallengeList() {
  const { data, error, loading, retry } = useResource(
    async () => {
      const [challenges, companies] = await Promise.all([api.challenges(), api.companies().catch(() => [])]);
      return { challenges, companies };
    },
    [],
  );

  return (
    <Screen title="Challenges" subtitle="Real tasks from companies at the event. A person reads every answer." tabs>
      {loading && !data ? (
        <div className="flex flex-col gap-3" aria-busy>
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="the challenges" onRetry={retry} />
      ) : data && data.challenges.length === 0 ? (
        <p className="text-body px-4 text-label-2">No challenges are open yet. Check back closer to the event.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {data?.challenges.map((c, i) => (
            <div key={c.id} className="rise" style={riseAt(i)}>
              <ProblemCard challenge={c} companies={data.companies} />
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}
