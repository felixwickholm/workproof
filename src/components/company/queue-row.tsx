import Link from "next/link";
import type { ReactNode } from "react";
import type { BlindProof } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { cx } from "../ui/cx";
import { ProofKindTag } from "../ui/tag";
import { proofHref } from "./format";

interface Props {
  proof: BlindProof;
  selected?: boolean;
  /** Still waits for a written answer: the label is set heavier and a dot marks it. */
  unread?: boolean;
  /** The row's one status mark, under the task: shared skills, or the decision in words. */
  status?: ReactNode;
}

/**
 * One proof in the review list: the label and the kind of proof, the task, when it arrived and
 * one status mark. Nothing about quality: no score, no rank, no badge.
 */
export function QueueRow({ proof, selected, unread, status }: Props) {
  return (
    <li>
      <Link
        href={proofHref(proof.proofId)}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "relative flex flex-col gap-1 rounded-[12px] px-3 py-3 transition-colors duration-150",
          selected ? "bg-fill" : "hover:bg-fill/60 active:bg-fill",
        )}
      >
        {/* The dot hangs in the left padding, so read and unread labels line up. */}
        {unread ? <span aria-hidden className="absolute top-5 left-[3px] size-1.5 rounded-full bg-label" /> : null}
        <span className="flex min-w-0 items-center gap-2">
          <span className={cx("text-subhead shrink-0 text-label", unread ? "font-semibold" : "font-medium")}>{proof.label}</span>
          <ProofKindTag kind={proof.proofKind} className="h-[22px] px-2 text-caption" />
          <TimeAgo at={proof.submittedAt} className="text-footnote tnum ml-auto shrink-0 text-label-2" />
        </span>
        <span className="text-footnote block truncate text-label-2">{proof.challengeTitle}</span>
        {status ? <span className="block">{status}</span> : null}
      </Link>
    </li>
  );
}

export function QueueRowSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2 px-3 py-3.5">
      <span className="flex items-center gap-2">
        <span className="h-4 w-20 rounded-full bg-fill" />
        <span className="h-[22px] w-16 rounded-full bg-fill" />
        <span className="ml-auto h-3 w-14 rounded-full bg-fill" />
      </span>
      <span className="h-3 w-56 rounded-full bg-fill" />
    </div>
  );
}
