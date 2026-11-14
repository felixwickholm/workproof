import Link from "next/link";
import type { ReactNode } from "react";
import type { BlindProof } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { cx } from "../ui/cx";
import { proofHref } from "./format";
import { workLabel } from "../words";

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

/**
 * One work in the scoring list: the label, when it arrived or its total, the challenge and one status line.
 * From 900px it is a one-line chip in the switcher band: the label and the time or total; the open work is filled.
 */
export function QueueRow({ proof, selected, unread, value, status }: Props) {
  return (
    <li>
      <Link
        href={proofHref(proof.proofId)}
        aria-current={selected ? "page" : undefined}
        title={proof.challengeTitle}
        className={cx(
          "press relative flex min-h-16 flex-col justify-center gap-1 rounded-[14px] px-4 py-3.5 transition-colors duration-150",
          "min-[900px]:h-12 min-[900px]:min-h-0 min-[900px]:flex-row min-[900px]:items-center min-[900px]:rounded-full min-[900px]:py-0 min-[900px]:pl-5",
          selected ? "bg-fill min-[900px]:bg-label min-[900px]:text-ground" : "hover:bg-fill/60 active:bg-fill min-[900px]:bg-raised min-[900px]:hover:bg-fill",
        )}
      >
        {/* The dot hangs in the left padding, so read and unread labels line up. */}
        {unread ? (
          <span
            aria-hidden
            className={cx(
              "absolute top-[25px] left-[5px] size-1.5 rounded-full min-[900px]:top-[21px] min-[900px]:left-[9px]",
              selected ? "bg-label min-[900px]:bg-ground" : "bg-label",
            )}
          />
        ) : null}
        <span className="flex min-w-0 items-baseline gap-3">
          <span className={cx("shrink-0 text-[17px] leading-[26px]", selected ? "min-[900px]:text-ground" : "text-label", unread ? "font-semibold" : "font-medium")}>
            {workLabel(proof.label)}
          </span>
          {/* Screen readers hear the label and the time as two parts. */}
          <span className="sr-only">, </span>
          <span className={cx("text-subhead tnum ml-auto shrink-0", value ? "text-label" : "text-label-2", selected && "min-[900px]:text-ground")}>
            {value ?? <TimeAgo at={proof.submittedAt} />}
          </span>
        </span>
        <span className="text-subhead block truncate text-label-2 min-[900px]:sr-only">{proof.challengeTitle}</span>
        {status ? <span className="text-subhead block truncate text-label min-[900px]:sr-only">{status}</span> : null}
      </Link>
    </li>
  );
}

export function QueueRowSkeleton() {
  return (
    <div aria-hidden className="flex flex-col gap-2 px-4 py-4 min-[900px]:p-0">
      <span className="flex items-center gap-2">
        <span className="h-4 w-20 rounded-full bg-fill" />
        <span className="ml-auto h-3 w-14 rounded-full bg-fill" />
      </span>
      <span className="h-3 w-44 rounded-full bg-fill" />
    </div>
  );
}
