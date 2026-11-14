"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { use, useEffect, useId, useState, type ReactNode } from "react";
import { getReviewer } from "@/components/company/company-choice";
import { DecidedView } from "@/components/company/decided-view";
import { DecisionPanel } from "@/components/company/decision-panel";
import { proofHref, SECOND_LOOK_LINE } from "@/components/company/format";
import { MeetingOpener } from "@/components/company/meeting-opener";
import { markOpened } from "@/components/company/opened-proofs";
import { ReviewGuide } from "@/components/company/review-guide";
import { TaskDisclosure } from "@/components/company/task-disclosure";
import { BlindProofView } from "@/components/proof";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { useWide } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { api, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, ReviewQueue } from "@/lib/domain/types";
import { findInQueue, useReview, type QueueItem } from "../review-context";

/**
 * Beside the work only when the pane fits a full reading measure (about 640px) plus the 300px
 * guide; narrower, the guide sits under the work, right above the answer.
 */
const GUIDE_BESIDE = "@min-[980px]:grid @min-[980px]:grid-cols-[minmax(0,1fr)_300px] @min-[980px]:items-start @min-[980px]:gap-6";

/** One blind proof, read against what the task asked for, then a written answer and Not now or Meet. */
export function ProofReview({ params }: { params: Promise<{ proofId: string }> }) {
  const proofId = decodeURIComponent(use(params).proofId);
  const { queue, company, reload } = useReview();

  // A proof opens at its top, where the work starts, and counts as opened in this browser.
  const companyKey = company?.id;
  useEffect(() => {
    window.scrollTo({ top: 0 });
    markOpened(proofId);
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
      <Card>
        <h2 className="text-headline font-semibold">Not in this queue</h2>
        <p className="text-subhead mt-1 text-pretty text-label-2">This proof is not waiting for {company.name}. It may belong to another company in the switcher.</p>
        <Button href="/company/review" variant="secondary" size="sm" className="mt-4">
          Back to the queue
        </Button>
      </Card>
    );
  }

  const { proof } = item;
  const ownTask = Boolean(known);

  return (
    <div className="@container">
      <h2 className="sr-only">{proof.label}</h2>
      <div className={GUIDE_BESIDE}>
        <div className="flex min-w-0 flex-col gap-4">
          {item.kind === "second" ? <SecondLookNote skills={item.proof.sharedSkills} /> : null}
          <BlindProofView
            proof={proof}
            variant="full"
            showHumanWorkLine
            pictureReport={{
              defaultReviewer: getReviewer(company.id),
              onReport: async (reviewer) => {
                await companyApi.reportPicture(proof.proofId, company.id, reviewer);
                await reload();
              },
            }}
            className="rise"
          />
          {challenge ? <TaskDisclosure challenge={challenge} /> : <div className="h-14 rounded-card bg-surface" />}
          <div className="@min-[980px]:hidden">
            <LookFor challenge={challenge} ownTask={ownTask} foldable />
          </div>
          <DecisionSlot key={proof.proofId} item={item} queue={queue} companyName={company.name} reload={reload}>
            <DecisionPanel proof={proof} company={company} onDecided={reload} tour="decision" />
          </DecisionSlot>
        </div>
        <aside aria-label="What to look for" className="hidden @min-[980px]:sticky @min-[980px]:top-6 @min-[980px]:block">
          <LookFor challenge={challenge} ownTask={ownTask} />
        </aside>
      </div>
    </div>
  );
}

/**
 * Where the answer is written and, once sent, what was sent. The two crossfade in place, so the
 * reviewer sees the result where they pressed. Keyed by proof, so opening another proof never fades.
 */
function DecisionSlot({
  item,
  queue,
  companyName,
  reload,
  children,
}: {
  item: QueueItem;
  queue: ReviewQueue;
  companyName: string;
  reload: () => Promise<void>;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const decided = item.kind === "decided";
  const from = reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(6px)" };
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={decided ? "decided" : "deciding"}
        initial={from}
        animate={{ opacity: 1, transform: "translateY(0px)" }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
        className="flex flex-col gap-4"
      >
        {item.kind === "decided" ? (
          <>
            <DecidedView entry={item.entry} companyName={companyName} onChanged={reload} tour="decision" />
            {item.entry.decision.decision === "meet" ? <MeetingOpener explain={item.proof.explain} /> : null}
            <NextProof queue={queue} current={item.proof.proofId} />
          </>
        ) : (
          children
        )}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * The task's review guide, in words, beside or under the work. Under the work on a phone it is
 * folded, so the answer box is never six skill notes away; on a laptop it starts open.
 */
function LookFor({ challenge, ownTask, foldable }: { challenge: Challenge | null | undefined; ownTask: boolean; foldable?: boolean }) {
  const wide = useWide();
  const [toggled, setToggled] = useState<boolean | null>(null);
  const panelId = useId();
  if (!challenge) return <div className="h-40 rounded-card bg-surface" />;

  const open = !foldable || (toggled ?? wide);
  const source = `${ownTask ? "From the review guide you approved." : "From the review guide of the original task."} Words, not a scale.`;
  return (
    <Card>
      {foldable ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setToggled(!open)}
          className="-m-2 flex w-[calc(100%+16px)] items-center gap-3 rounded-[14px] p-2 text-left"
        >
          <span className="min-w-0 flex-1">
            <span className="text-section block text-label">What to look for</span>
            <span className="text-footnote mt-0.5 block text-label-2">
              {challenge.reviewGuide.length} {challenge.reviewGuide.length === 1 ? "skill" : "skills"} · {source}
            </span>
          </span>
          <ChevronDown aria-hidden className={cx("size-5 shrink-0 text-label-3 transition-transform duration-200 ease-(--ease-out)", open && "rotate-180")} strokeWidth={2.2} />
        </button>
      ) : (
        <>
          <h2 className="text-section text-label">What to look for</h2>
          <p className="text-footnote mt-1 text-pretty text-label-2">{source}</p>
        </>
      )}
      {open ? (
        <div id={panelId}>
          <ReviewGuide
            guide={challenge.reviewGuide}
            skills={challenge.coreSkills}
            className={cx("mt-4", foldable && "@min-[620px]:grid @min-[620px]:grid-cols-2 @min-[620px]:gap-x-6")}
          />
        </div>
      ) : null}
    </Card>
  );
}

function SecondLookNote({ skills }: { skills: string[] }) {
  return (
    <Card>
      <h2 className="text-section text-label">Second look</h2>
      <p className="text-subhead mt-1 text-pretty text-label-2">{SECOND_LOOK_LINE}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skills.map((s) => (
          <Tag key={s} className="h-6 px-2.5 text-caption">
            {s}
          </Tag>
        ))}
      </div>
    </Card>
  );
}

/** After an answer, the next proof that waits, so the reviewer is never at a dead end. */
function NextProof({ queue, current }: { queue: ReviewQueue; current: string }) {
  const next = [...queue.proofs, ...queue.secondLook].find((p) => p.proofId !== current);
  if (!next) {
    return (
      <Button href="/employer" variant="secondary" size="sm">
        Nothing else waits. Back to Hiring
      </Button>
    );
  }
  return (
    <Link
      href={proofHref(next.proofId)}
      className="press text-subhead flex min-h-[52px] items-center justify-between gap-3 rounded-full bg-fill px-5 font-medium text-label transition-colors duration-150 hover:bg-label/10"
    >
      Next to read: {next.label}
      <ArrowRight aria-hidden className="size-[18px] shrink-0" strokeWidth={1.8} />
    </Link>
  );
}

/** The open proof's shape while the queue loads: the work card, the task line, the answer area. */
export function ReviewSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-4">
      <div className="rounded-card bg-surface p-5 min-[900px]:p-7">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-6 w-16" />
          <Skeleton className="ml-auto h-3.5 w-16" />
        </div>
        <Skeleton className="mt-3 h-3.5 w-64" />
        <div className="mt-8 flex flex-col gap-3">
          {[90, 100, 84, 96, 70, 88].map((width) => (
            <span key={width} aria-hidden className="block h-3.5 rounded-full bg-fill" style={{ width: `${width}%` }} />
          ))}
        </div>
      </div>
      <div className="h-14 rounded-card bg-surface" />
      <div className="rounded-card bg-surface p-5 min-[900px]:p-6">
        <Skeleton className="h-3.5 w-48" />
        <div className="mt-4 h-[120px] rounded-inner bg-fill" />
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="h-[52px] rounded-full bg-fill" />
          <div className="h-[52px] rounded-full bg-fill" />
        </div>
      </div>
    </div>
  );
}
