"use client";

import { use } from "react";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { ServiceLine } from "@/components/shell/service-line";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

/**
 * What a shared link shows: the work as the company read it and each reviewer's written answer. No name or
 * contact: the person who sent the link decides who they are to the reader.
 */
export function SharedWork({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const { data, error, loading, retry } = useResource(
    () => api.sharedPortfolio(token),
    [token],
  );
  const one = data?.cards.length === 1;
  return (
    <Screen
      title={one ? "One piece of work" : "A record of work"}
      subtitle="Challenges done at Espoo talent events, with what each company wrote back. Shared by the person who did them. Their name is not on this page."
      right={<ServiceLine compact className="pr-2" />}
      page
    >
      {loading && !data ? (
        <div aria-busy className="flex flex-col gap-4">
          <Skeleton className="h-[128px] rounded-card" />
          <Skeleton className="h-[420px] rounded-card" />
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="this work" onRetry={retry} />
      ) : data ? (
        <PortfolioView portfolio={data} />
      ) : null}
    </Screen>
  );
}
