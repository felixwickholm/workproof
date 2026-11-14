"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useState } from "react";
import { BlindProofFull } from "@/components/blind-proof";
import { DecidedDetails, DecisionLine } from "@/components/company/decided-summary";
import { DecisionSheet } from "@/components/company/decision-sheet";
import { SECOND_LOOK_LINE, waitingFor } from "@/components/company/format";
import { LookForRow } from "@/components/company/look-for";
import { ReviewGuide } from "@/components/company/review-guide";
import { TaskDisclosure } from "@/components/company/task-disclosure";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { riseAt } from "@/components/ui/rise";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { DecisionKind } from "@/lib/domain/types";
import { findInQueue, useReview } from "../review-context";

/** One blind proof, read against the review guide, then Pass or Meet with written feedback. */
export function ProofReview({ params }: { params: Promise<{ proofId: string }> }) {
  const proofId = decodeURIComponent(use(params).proofId);
  const { queue, company, reload, now } = useReview();
  const router = useRouter();
  const [sheet, setSheet] = useState<DecisionKind | null>(null);

  // A proof opens at its top, where the context line says why it is here.
  const companyKey = company?.id;
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [proofId, companyKey]);

  const item = queue ? findInQueue(queue, proofId) : null;
  const challengeId = item?.proof.challengeId ?? null;
  const known = challengeId ? queue?.challenges.find((c) => c.id === challengeId) : undefined;
  // Second look proofs come from another company's task, so it is not in this queue.
  const fetched = useResource(challengeId && !known ? () => api.challenge(challengeId) : null, [challengeId, Boolean(known)]);
  const challenge = known ?? fetched.data;

  if (!queue || !company) return <ReviewSkeleton />;

  if (!item) {
    return (
      <div className="mx-auto max-w-[640px] px-5 pt-6 min-[900px]:px-8">
        <Card>
          <p className="text-headline font-semibold">Not in this queue</p>
          <p className="text-subhead mt-1 text-label-2 text-pretty">
            This proof is not waiting for {company.name}. It may belong to another company in the switcher.
          </p>
          <Button href="/company/review" variant="secondary" size="sm" className="mt-4">
            Back to the queue
          </Button>
        </Card>
      </div>
    );
  }

  const { proof } = item;
  const guide = challenge ? <ReviewGuide guide={challenge.reviewGuide} skills={challenge.coreSkills} /> : null;

  return (
    <div className="flex min-h-[calc(100dvh-44px)] flex-col">
      <div className="mx-auto w-full max-w-[440px] flex-1 px-5 pt-4 pb-8 min-[900px]:max-w-[1040px] min-[900px]:px-8 min-[900px]:pt-6">
        <div className="rise">
          <ContextLine item={item} now={now} />
        </div>

        <div className="min-[1180px]:grid min-[1180px]:grid-cols-[minmax(0,1fr)_300px] min-[1180px]:items-start min-[1180px]:gap-6">
          <div className="min-w-0">
            {item.kind === "decided" ? (
              <Card className="highlight rise mt-4">
                <DecisionLine entry={item.entry} />
                <div className="mt-3">
                  <DecidedDetails entry={item.entry} onChanged={reload} />
                </div>
              </Card>
            ) : null}

            <div className="rise mt-4" style={riseAt(1)}>
              <BlindProofFull
                proof={proof}
                audience="reviewer"
                beforeWork={
                  <div className="flex flex-col gap-3">
                    {challenge ? <TaskDisclosure challenge={challenge} /> : <div className="h-14 rounded-card bg-surface" />}
                    {guide && challenge ? (
                      <div className="flex min-[1180px]:hidden">
                        <LookForRow count={challenge.reviewGuide.length} note={guideNote(Boolean(known))}>
                          {guide}
                        </LookForRow>
                      </div>
                    ) : null}
                  </div>
                }
              />
            </div>
          </div>

          {guide ? (
            <aside className="hidden min-[1180px]:sticky min-[1180px]:top-[68px] min-[1180px]:mt-4 min-[1180px]:block">
              <GuideLabel ownTask={Boolean(known)} />
              {guide}
            </aside>
          ) : null}
        </div>
      </div>

      {item.kind === "decided" ? null : (
        <div className="glass highlight pb-safe sticky bottom-0 z-10">
          <div className="mx-auto grid w-full max-w-[440px] grid-cols-2 gap-3 px-5 pt-3 pb-3 min-[900px]:max-w-[1040px] min-[900px]:px-8">
            <Button variant="secondary" onClick={() => setSheet("pass")}>
              Pass
            </Button>
            <Button variant="secondary" onClick={() => setSheet("meet")}>
              Meet
            </Button>
          </div>
        </div>
      )}

      <DecisionSheet
        key={proof.proofId}
        kind={sheet}
        proof={proof}
        company={company}
        onClose={() => setSheet(null)}
        onDecided={reload}
        onDone={() => {
          setSheet(null);
          // On a phone the queue is a separate screen: go back to it, at the top where the company switcher is.
          if (!window.matchMedia("(min-width: 900px)").matches) router.push("/company/review");
          window.requestAnimationFrame(() => window.scrollTo({ top: 0 }));
        }}
      />
    </div>
  );
}

function guideNote(ownTask: boolean) {
  return `${ownTask ? "From the review guide you approved." : "From the review guide of the original task."} Read the work against it.`;
}

function GuideLabel({ ownTask }: { ownTask: boolean }) {
  return (
    <div className="mb-2 px-5">
      <p className="text-headline font-semibold">Look for</p>
      <p className="text-footnote mt-1 text-label-2">{guideNote(ownTask)}</p>
    </div>
  );
}

function ContextLine({ item, now }: { item: NonNullable<ReturnType<typeof findInQueue>>; now: number | null }) {
  if (item.kind === "second") {
    return (
      <div>
        <p className="text-headline font-semibold">Second look</p>
        <p className="text-subhead mt-1 text-label-2 text-pretty">{SECOND_LOOK_LINE}</p>
        <p className="text-subhead mt-1 text-label text-pretty">Matched on {item.proof.sharedSkills.join(", ")}</p>
      </div>
    );
  }
  if (item.kind === "decided") return <p className="text-headline font-semibold">Decided</p>;
  const waiting = waitingFor(item.proof.submittedAt, now);
  return (
    <p className="text-footnote tnum text-label-2">
      {waiting === "Just now" ? "Just arrived" : waiting ? `Waiting ${waiting}` : "To review"}
    </p>
  );
}

export function ReviewSkeleton() {
  return (
    <div aria-busy className="mx-auto max-w-[440px] px-5 pt-4 min-[900px]:max-w-[1040px] min-[900px]:px-8 min-[900px]:pt-6">
      <Skeleton className="h-3 w-32" />
      <div className="mt-4 h-14 rounded-card bg-surface" />
      <div className="mt-6 h-40 rounded-card bg-surface" />
      <div className="mt-3 h-64 rounded-card bg-surface" />
    </div>
  );
}
