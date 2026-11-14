"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { use, useEffect, type ReactNode } from "react";
import { challengeHref, proofHref } from "@/components/company/format";
import { getReviewer } from "@/components/company/company-choice";
import { MeetingOpener } from "@/components/company/meeting-opener";
import { markOpened } from "@/components/company/opened-proofs";
import { ScorePanel } from "@/components/company/score-panel";
import { ScoredView } from "@/components/company/scored-view";
import { WorkPane } from "@/components/company/work-pane";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { workLabel } from "@/components/words";
import { api, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { ReviewQueue } from "@/lib/domain/types";
import { findInQueue, useReview } from "../review-context";

/** Work beside the score once the pane fits a reading measure plus the 400px score panel. */
const SIDE_BY_SIDE = "@min-[960px]:grid @min-[960px]:grid-cols-[minmax(0,1fr)_400px] @min-[960px]:items-start @min-[960px]:gap-16";
/** The work's reading measure: about 70 characters of 18px text. */
const MEASURE = "max-w-[720px]";

/** One blind work: read it, score each skill, say why, then invite, not now, or score only. */
export function ProofReview({ params }: { params: Promise<{ proofId: string }> }) {
  const proofId = decodeURIComponent(use(params).proofId);
  const { queue, company, reload } = useReview();

  // A work opens at its top, where it starts, and counts as opened in this browser.
  const companyKey = company?.id;
  useEffect(() => {
    window.scrollTo({ top: 0 });
    markOpened(proofId);
  }, [proofId, companyKey]);

  const item = queue ? findInQueue(queue, proofId) : null;
  const challengeId = item?.proof.challengeId ?? null;
  const known = challengeId ? queue?.challenges.find((c) => c.id === challengeId) : undefined;
  // Shared work comes from another company's challenge, so it is not in this queue.
  const fetched = useResource(challengeId && !known ? () => api.challenge(challengeId) : null, [challengeId, Boolean(known)]);
  const challenge = known ?? fetched.data ?? null;
  const related = useResource(company ? () => companyApi.related(proofId, company.id).catch(() => null) : null, [proofId, companyKey]);

  if (!queue || !company) return <ReviewSkeleton />;

  if (!item) {
    return (
      <Card>
        <h2 className="text-headline font-semibold">Not in this list</h2>
        <p className="text-subhead mt-1 text-pretty text-label-2">This work is not waiting for {company.name}. It may belong to another company.</p>
        <Button href="/employer" variant="secondary" size="sm" className="mt-4">
          Back to my challenges
        </Button>
      </Card>
    );
  }

  const { proof } = item;

  return (
    <div className="@container">
      <div className={SIDE_BY_SIDE}>
        <div className={`rise min-w-0 ${MEASURE}`}>
          {item.kind === "second" ? <SharedNote line={`Shared with you. Same skills: ${item.proof.sharedSkills.join(", ")}.`} /> : null}
          {item.kind === "recommended" ? <SharedNote line={`Recommended by ${item.proof.recommendedBy}.`} /> : null}
          <WorkPane
            proof={proof}
            challenge={challenge}
            related={related.data ?? null}
            pictureReport={{
              defaultReviewer: getReviewer(company.id),
              onReport: async (reviewer) => {
                await companyApi.reportPicture(proof.proofId, company.id, reviewer);
                await reload();
              },
            }}
          />
        </div>
        <ScoreSlot key={proof.proofId} decided={item.kind === "decided"}>
          {item.kind === "decided" ? (
            <>
              <ScoredView entry={item.entry} challenge={challenge} companyId={company.id} onChanged={reload} />
              {item.entry.decision.decision === "meet" ? <MeetingOpener explain={proof.explain} /> : null}
              <NextWork queue={queue} current={proof.proofId} challengeId={proof.challengeId} />
            </>
          ) : challenge ? (
            <ScorePanel proof={proof} challenge={challenge} company={company} onScored={reload} />
          ) : (
            <div className="h-[640px] rounded-card bg-surface" />
          )}
        </ScoreSlot>
      </div>
    </div>
  );
}

/**
 * Where the score is given and, once sent, what was sent. The two crossfade in place, so the reviewer
 * sees the result where they pressed. Keyed by work, so opening another work never fades.
 */
function ScoreSlot({ decided, children }: { decided: boolean; children: ReactNode }) {
  const reduce = useReducedMotion();
  const from = reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={decided ? "scored" : "scoring"}
        initial={from}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="mt-14 flex flex-col gap-6 @min-[960px]:mt-0"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function SharedNote({ line }: { line: string }) {
  return <p className="text-body mb-8 rounded-inner bg-surface px-5 py-4 text-pretty text-label">{line}</p>;
}

/** After a score, the next work that waits, so the reviewer is never at a dead end. */
function NextWork({ queue, current, challengeId }: { queue: ReviewQueue; current: string; challengeId: string }) {
  const next = [...queue.proofs, ...queue.recommended, ...queue.secondLook].find((p) => p.proofId !== current);
  if (!next) {
    return (
      <Button href={challengeHref(challengeId)} variant="secondary">
        Nothing else waits. See top work
      </Button>
    );
  }
  return (
    <Link
      href={proofHref(next.proofId)}
      className="press text-body flex min-h-[52px] items-center justify-between gap-3 rounded-full bg-fill px-5 font-medium text-label transition-colors duration-150 hover:bg-label/10"
    >
      Next work to score: {workLabel(next.label)}
      <ArrowRight aria-hidden className="size-5 shrink-0" strokeWidth={1.75} />
    </Link>
  );
}

/** The open work's shape while the list loads: the work on the left, the score panel on the right. */
export function ReviewSkeleton() {
  return (
    <div className="@container">
      <div aria-busy className={SIDE_BY_SIDE}>
        <div className={`flex flex-col gap-3 ${MEASURE}`}>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-3.5 w-72" />
          <div className="mt-8 flex flex-col gap-3">
            {[90, 100, 84, 96, 70, 88, 92, 64].map((width) => (
              <span key={width} aria-hidden className="block h-4 rounded-full bg-fill" style={{ width: `${width}%` }} />
            ))}
          </div>
        </div>
        <div className="mt-14 flex flex-col gap-6 rounded-card bg-surface p-6 @min-[960px]:mt-0 min-[900px]:p-7">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-28" />
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <Skeleton className="h-4 w-40" />
              <div className="grid grid-cols-5 gap-1.5">
                {[0, 1, 2, 3, 4].map((j) => (
                  <span key={j} className="h-14 rounded-[14px] bg-fill" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
