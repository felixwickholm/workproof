"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { useSyncExternalStore } from "react";
import type { BlindProof } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { Button } from "../ui/button";
import { Panel } from "../ui/card";
import { EmptyState } from "../ui/empty-state";
import { ProofKindTag } from "../ui/tag";
import { oldestWaitLine, readingOwedLine, secondLookLine } from "./employer-format";
import { firstLine, proofHref } from "./format";

/** Rows on the home; the queue itself holds the rest. */
const SHOWN = 3;
const MINUTE = 60_000;

/**
 * "Next in your queue": the oldest proofs, in the order they arrived, as row cards, and how long
 * the oldest has waited against the answer window. Work only: a label, the kind of proof, the
 * task and the first line. No name, no photo of a person, no score.
 */
export function QueuePreview({
  proofs,
  waiting,
  secondLook,
  windowHours,
  readingMinutes,
  className,
}: {
  proofs: BlindProof[];
  waiting: number;
  secondLook: number;
  /** The event's answer window, when the server sends it. */
  windowHours: number | null;
  /** About how long the waiting work takes to read and answer. */
  readingMinutes: number;
  className?: string;
}) {
  const extra = secondLookLine(secondLook);
  const reading = readingOwedLine(readingMinutes);
  return (
    <Panel title="Next in your queue" count={waiting} href="/company/review" linkLabel="Open the queue" tour="queue" className={className}>
      <p className="text-footnote -mt-1 text-pretty text-label-2">Work only. No names, no photos, no scores. Oldest first.</p>
      <OldestWait at={proofs[0]?.submittedAt} windowHours={windowHours} />
      {reading ? <p className="text-subhead tnum mt-1 text-label-2">{reading}</p> : null}
      {proofs.length === 0 ? (
        <EmptyState className="mt-3">Nothing waits in your own queue. New work shows up here in the order it arrives.</EmptyState>
      ) : (
        <ol className="mt-3 flex flex-col gap-2">
          {proofs.slice(0, SHOWN).map((p) => (
            <li key={p.proofId}>
              <QueueCard proof={p} />
            </li>
          ))}
        </ol>
      )}
      {extra ? <p className="text-footnote mt-3 text-pretty text-label-2">{extra}</p> : null}
      <Button href="/company/review" variant="secondary" size="sm" className="mt-4">
        Open the queue
      </Button>
    </Panel>
  );
}

function subscribeMinute(listener: () => void) {
  const id = window.setInterval(listener, MINUTE);
  return () => window.clearInterval(id);
}

const nowMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE;

/** "Oldest has waited 3 h. Answer window: 48 h." The server renders nothing, so no clock mismatches. */
function OldestWait({ at, windowHours }: { at: string | undefined; windowHours: number | null }) {
  const now = useSyncExternalStore(subscribeMinute, nowMinute, () => null);
  const line = now === null ? null : oldestWaitLine(at, now, windowHours);
  if (!line) return null;
  return (
    <p className="text-subhead tnum mt-3 flex items-center gap-2 text-label">
      <Clock aria-hidden className="size-4 shrink-0 text-label-2" strokeWidth={1.8} />
      {line}
    </p>
  );
}

/**
 * One waiting proof as a row card: the label and kind, the first line of the work, the task and the
 * arrival. No count of hidden details: how much was hidden could hint at where someone comes from.
 */
function QueueCard({ proof }: { proof: BlindProof }) {
  return (
    <Link
      href={proofHref(proof.proofId)}
      className="press block rounded-[14px] bg-raised px-4 py-3 shadow-[inset_0_0_0_1px_var(--color-separator)] transition-shadow duration-150 hover:shadow-[inset_0_0_0_1px_var(--color-control)]"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="text-subhead shrink-0 font-semibold text-label">{proof.label}</span>
        <ProofKindTag kind={proof.proofKind} className="h-6 px-2.5 text-caption" />
        <span className="text-footnote ml-auto shrink-0 text-label-2">
          arrived <TimeAgo at={proof.submittedAt} className="lowercase" />
        </span>
      </span>
      <span className="text-subhead mt-1.5 block truncate text-label">{firstLine(proof.work) || "Answer given without text"}</span>
      <span className="text-footnote mt-0.5 block truncate text-label-2">{proof.challengeTitle}</span>
    </Link>
  );
}
