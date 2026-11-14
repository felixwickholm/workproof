"use client";

import Link from "next/link";
import { use, useEffect, useRef, useState } from "react";
import { getReviewer, useCompanyId, useCompanyKnown } from "@/components/company/company-choice";
import { companyErrorText, proofHref } from "@/components/company/format";
import { challengeShape, workLabel } from "@/components/company/hiring-words";
import { ShareSheet } from "@/components/company/share-sheet";
import { TopWorkRow } from "@/components/company/top-work-row";
import { useOnDemoReset } from "@/components/company/use-demo-reset";
import { TimeAgo } from "@/components/proof";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import { placesOf } from "@/lib/domain/places";
import type { TopProof } from "@/lib/domain/types";

const POLL_MS = 5000;

/** The rule above the list, so nobody reads the totals as a machine's verdict. */
export const SCORE_SOURCE_LINE = "People score the work. The AI never does. Names stay hidden until the person says yes.";

/**
 * One challenge: who scored what. Scored work highest total first (ties by arrival), then the work
 * that waits for a score, oldest first.
 */
export function Leaderboard({ params }: { params: Promise<{ id: string }> }) {
  const challengeId = decodeURIComponent(use(params).id);
  const [companyId] = useCompanyId();
  const known = useCompanyKnown();
  const top = useResource(known ? () => companyApi.top(companyId, challengeId) : null, [companyId, challengeId, known], { pollMs: POLL_MS });
  useOnDemoReset(() => void top.reload());
  const [inviting, setInviting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sharing, setSharing] = useState<TopProof | null>(null);

  // A challenge the city made for this company is claimed the first time the company opens it.
  const claimed = useRef<string | null>(null);
  const unclaimed = top.data?.challenge.onBehalf && !top.data.challenge.claimedAt ? top.data.challenge.id : null;
  useEffect(() => {
    if (!unclaimed || claimed.current === unclaimed) return;
    claimed.current = unclaimed;
    companyApi.claim(unclaimed, companyId).catch(() => {
      claimed.current = null;
    });
  }, [unclaimed, companyId]);

  async function invite(row: TopProof) {
    if (inviting) return;
    setInviting(row.proof.proofId);
    setError(null);
    try {
      await companyApi.decideHold(row.decision.id, { decision: "meet", reviewer: getReviewer(companyId) });
      await top.reload();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      setInviting(null);
    }
  }

  const d = top.data;
  if (top.error && !d) {
    return (
      <Screen page back={{ href: "/employer", label: "My challenges" }}>
        <ErrorState error={top.error} what="this challenge" onRetry={top.retry} away={{ href: "/employer", label: "Back to my challenges" }} />
      </Screen>
    );
  }
  if (!d) return <LeaderboardSkeleton />;

  const { challenge } = d;
  const places = placesOf(challenge);
  const firstHold = d.scored.find((r) => r.decision.decision === "hold")?.proof.proofId;

  return (
    <Screen
      page
      back={{ href: "/employer", label: "My challenges" }}
      title={challenge.title}
      subtitle={
        <>
          {challenge.onBehalf ? `Made for you by ${challenge.onBehalf.by}. ` : ""}
          {challengeShape(challenge)}
          {places ? ` · ${places} places` : ""}
          <span className="mt-1 block text-label">{challenge.coreSkills.map((s) => s.label).join(" · ")}</span>
        </>
      }
    >
      <section aria-labelledby="top-work" className="rise" style={riseAt(1)}>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="top-work" className="text-title font-semibold text-label">
            Top work
          </h2>
          <p className="text-subhead text-label-2">{SCORE_SOURCE_LINE}</p>
        </div>
        {error ? (
          <p role="alert" className="text-subhead mt-3 text-label">
            {error}
          </p>
        ) : null}
        {d.scored.length === 0 ? (
          <EmptyState
            className="mt-4"
            action={
              d.waiting[0] ? (
                <Button href={proofHref(d.waiting[0].proofId)} size="sm">
                  Score the first work
                </Button>
              ) : undefined
            }
          >
            {d.waiting.length > 0 ? "No work has a score yet. Score the first one, and it shows here." : "No one did this challenge yet. Work shows here once it has a score."}
          </EmptyState>
        ) : (
          <ul data-tour="top-work" className="mt-2 divide-y divide-separator">
            {d.scored.map((row, i) => (
              <TopWorkRow
                key={row.proof.proofId}
                rank={i + 1}
                row={row}
                skills={challenge.coreSkills}
                onInvite={() => void invite(row)}
                inviting={inviting === row.proof.proofId}
                onShare={() => setSharing(row)}
                inviteTour={row.proof.proofId === firstHold ? "invite" : undefined}
              />
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="waiting" className="rise mt-10" style={riseAt(2)}>
        <p aria-hidden className="text-footnote flex items-center gap-3 text-label-2 before:h-px before:w-6 before:bg-separator after:h-px after:flex-1 after:bg-separator">
          Not scored yet
        </p>
        <div className="mt-6 flex items-baseline gap-3">
          <h2 id="waiting" className="text-title-3 font-semibold text-label">
            Waiting for a score
          </h2>
          <span className="text-subhead text-label-2">Oldest first.</span>
        </div>
        {d.waiting.length === 0 ? (
          <p className="text-body mt-3 text-label-2">Nothing waits. All work has a score.</p>
        ) : (
          <ul className="mt-2 divide-y divide-separator">
            {d.waiting.map((p) => (
              <li key={p.proofId} className="flex min-h-16 items-center gap-4 py-3">
                <Link href={proofHref(p.proofId)} className="text-body min-w-0 flex-1 font-medium text-label underline-offset-4 hover:underline">
                  {workLabel(p.label)}
                </Link>
                <TimeAgo at={p.submittedAt} className="text-footnote text-label-2" />
                <Button href={proofHref(p.proofId)} variant="secondary" size="sm">
                  Score
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {sharing ? (
        <ShareSheet
          open
          onClose={() => setSharing(null)}
          proofId={sharing.proof.proofId}
          proofLabel={sharing.proof.label}
          challengeId={challenge.id}
          companyId={companyId}
        />
      ) : null}
    </Screen>
  );
}

/** The page's shape while it loads: the title, then rows with a score, the label and the marks. */
export function LeaderboardSkeleton() {
  return (
    <Screen page back={{ href: "/employer", label: "My challenges" }}>
      <div aria-busy>
        <span className="sr-only">Loading the top work</span>
        <Skeleton className="h-9 w-[min(560px,90%)]" />
        <Skeleton className="mt-3 h-4 w-48" />
        <Skeleton className="mt-12 h-7 w-40" />
        <ul className="mt-2 divide-y divide-separator">
          {[0, 1, 2].map((i) => (
            <li key={i} className="grid gap-4 py-6 min-[1000px]:grid-cols-[32px_140px_minmax(0,1fr)_280px_auto] min-[1000px]:items-center min-[1000px]:gap-6">
              <span className="hidden h-6 w-4 rounded-full bg-fill min-[1000px]:block" />
              <span className="block h-11 w-24 rounded-full bg-fill" />
              <span className="flex flex-col gap-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-56" />
              </span>
              <span className="flex flex-col gap-2">
                {[0, 1, 2].map((j) => (
                  <Skeleton key={j} className="h-3 w-full" />
                ))}
              </span>
              <span className="h-[38px] w-28 rounded-full bg-fill" />
            </li>
          ))}
        </ul>
      </div>
    </Screen>
  );
}
