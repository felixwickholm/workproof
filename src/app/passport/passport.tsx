"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { getTalentId } from "@/lib/client/local";
import { useResource } from "@/lib/client/use-resource";
import { ProofPass } from "./proof-pass";

export function Passport() {
  const [talentId] = useState(() => (typeof window === "undefined" ? "" : getTalentId()));
  const { data, error, loading, retry, reload } = useResource(talentId ? () => api.passport(talentId) : null, [talentId], {
    pollMs: 5000,
  });

  return (
    <Screen title="My proofs" tabs>
      {(loading || !talentId) && !data ? (
        <div aria-busy className="flex flex-col gap-3">
          <PassSkeleton />
          <PassSkeleton />
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="your proofs" onRetry={retry} />
      ) : data && data.length === 0 ? (
        <Card className="rise">
          <p className="text-headline font-semibold">No proofs yet</p>
          <p className="text-subhead mt-1 text-label-2">
            Do a short task. A company sees the work, not your CV.
          </p>
          <Button href="/try" size="sm" className="mt-5">
            Try a 2-minute task
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {data?.map((entry, i) => (
            <div key={entry.proof.proofId} className="rise" style={riseAt(i)}>
              <ProofPass entry={entry} onChanged={reload} />
            </div>
          ))}
        </div>
      )}
    </Screen>
  );
}

function PassSkeleton() {
  return (
    <div className="rounded-card bg-surface p-5">
      <div className="flex items-center gap-3">
        <span className="size-11 rounded-inner bg-raised" />
        <Skeleton className="h-4 w-24" />
      </div>
      <Skeleton className="mt-5 h-5 w-60" />
      <Skeleton className="mt-3 h-3.5 w-40" />
      <Skeleton className="mt-6 h-11 w-full rounded-inner" />
    </div>
  );
}
