"use client";

import { AuditLog } from "@/components/city/audit-log";
import { citySource } from "@/components/city/source";
import { useLive } from "@/components/city/use-live-city";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";

const back = { href: "/city", label: "City" };

/** Every action at the event, newest first: who did what, a person or software. */
export function LogView() {
  const { data, error, loading, retry } = useLive(citySource.overview);
  return (
    <Screen page back={back} title="The log" subtitle="Every action at the event, newest first. No job seeker's name.">
      {data ? (
        <Card>
          <AuditLog events={data.audit} />
        </Card>
      ) : loading ? (
        <div aria-busy aria-label="Loading the log" className="rounded-card bg-surface p-5">
          {Array.from({ length: 10 }, (_, i) => (
            <Skeleton key={i} className="my-4 h-4 w-full max-w-[720px]" />
          ))}
        </div>
      ) : (
        <ErrorState error={error} what="the log" onRetry={retry} away={{ href: "/city", label: "Back to the city" }} />
      )}
    </Screen>
  );
}
