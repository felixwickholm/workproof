import Link from "next/link";
import type { ReactNode } from "react";
import type { BlindProof } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { cx } from "../ui/cx";
import { proofHref } from "./format";
import { workLabel } from "./hiring-words";

interface Props {
  proof: BlindProof;
  selected?: boolean;
  /** Not opened yet in this browser: the label is set heavier and a dot marks it. */
  unread?: boolean;
  /** Right of the label: the total for scored work, else when it arrived. */
  value?: ReactNode;
  /** One line under the challenge: where scored work stands, or who shared it. */
  status?: ReactNode;
}

/** One work in the scoring list: the label, when it arrived or its total, the challenge and one status line. */
export function QueueRow({ proof, selected, unread, value, status }: Props) {
  return (
    <li>
      <Link
        href={proofHref(proof.proofId)}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "relative flex min-h-11 flex-col gap-0.5 rounded-[12px] px-3 py-2.5 transition-colors duration-150",
          selected ? "bg-fill" : "hover:bg-fill/60 active:bg-fill",
        )}
      >
        {/* The dot hangs in the left padding, so read and unread labels line up. */}
        {unread ? <span aria-hidden className="absolute top-[19px] left-[3px] size-1.5 rounded-full bg-label" /> : null}
        <span className="flex min-w-0 items-baseline gap-2">
          <span className={cx("text-body shrink-0 text-label", unread ? "font-semibold" : "font-medium")}>{workLabel(proof.label)}</span>
          {/* Screen readers hear the label and the time as two parts. */}
          <span className="sr-only">, </span>
          <span className="text-footnote tnum ml-auto shrink-0 text-label-2">{value ?? <TimeAgo at={proof.submittedAt} />}</span>
        </span>
        <span className="text-footnote block truncate text-label-2">{proof.challengeTitle}</span>
        {status ? <span className="text-footnote block truncate text-label">{status}</span> : null}
      </Link>
    </li>
  );
}

export function QueueRowSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2 px-3 py-3">
      <span className="flex items-center gap-2">
        <span className="h-4 w-20 rounded-full bg-fill" />
        <span className="ml-auto h-3 w-14 rounded-full bg-fill" />
      </span>
      <span className="h-3 w-44 rounded-full bg-fill" />
    </div>
  );
}
