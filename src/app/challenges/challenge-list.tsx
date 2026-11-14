"use client";

import { useState, useSyncExternalStore } from "react";
import { ProblemCard, ProblemCardSkeleton } from "@/components/problem-card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import { ChallengeBody } from "./[id]/challenge-detail";

const WIDE = "(min-width: 900px)";

function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** Phone: a list that opens each task. Laptop: the list on the left, the chosen task on the right. */
export function ChallengeList() {
  const wide = useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { data, error, loading, retry } = useResource(
    async () => {
      const [challenges, companies] = await Promise.all([api.challenges(), api.companies().catch(() => [])]);
      return { challenges, companies };
    },
    [],
  );

  const selected = data?.challenges.find((c) => c.id === selectedId) ?? data?.challenges[0];

  return (
    <Screen title="Tasks" subtitle="Real work from companies at the event. A person reads every answer." tabs page>
      {loading && !data ? (
        <div className="flex flex-col gap-3 min-[900px]:max-w-[400px]" aria-busy>
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
          <ProblemCardSkeleton />
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="the tasks" onRetry={retry} />
      ) : data && data.challenges.length === 0 ? (
        <p className="text-body px-4 text-label-2">No tasks are open yet. Check back closer to the event.</p>
      ) : data ? (
        <div className="min-[900px]:grid min-[900px]:grid-cols-[400px_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-10">
          <div className="flex flex-col gap-3">
            {data.challenges.map((c, i) => (
              <div key={c.id} className="rise" style={riseAt(i)}>
                <ProblemCard
                  challenge={c}
                  companies={data.companies}
                  selected={wide && c.id === selected?.id}
                  onSelect={wide ? () => setSelectedId(c.id) : undefined}
                />
              </div>
            ))}
          </div>
          {wide && selected ? (
            <section
              aria-label="Selected task"
              className="sticky top-[68px] max-h-[calc(100dvh-88px)] overflow-y-auto rounded-card bg-surface px-7 pt-5 pb-7"
            >
              <ChallengeBody
                key={selected.id}
                challenge={selected}
                companies={data.companies}
                action={
                  <div data-story={`start-${selected.id}`} className="mt-5 w-fit rounded-full">
                    <Button href={`/challenges/${selected.id}/work`} className="w-auto! px-8">
                      Start · {selected.minutes} min
                    </Button>
                  </div>
                }
              />
            </section>
          ) : null}
        </div>
      ) : null}
    </Screen>
  );
}
