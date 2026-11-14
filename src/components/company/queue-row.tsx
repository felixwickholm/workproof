import Link from "next/link";
import type { ReactNode } from "react";
import type { BlindProof } from "@/lib/domain/types";
import { Monogram } from "../blind-proof";
import { cx } from "../ui/cx";
import { firstLine } from "./format";

/**
 * One proof in the inbox: label, the task, the first line of the work, how long it waited.
 * Nothing about quality: no score, no rank, no badge.
 */
export function QueueRow({
  proof,
  href,
  selected,
  right,
  footer,
}: {
  proof: BlindProof;
  href: string;
  selected?: boolean;
  /** Top right, for example the time waiting. */
  right?: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <li className="row relative [--row-inset:72px]">
      <Link
        href={href}
        aria-current={selected ? "page" : undefined}
        className={cx(
          "flex gap-3 px-4 py-3.5 transition-colors duration-150 active:bg-raised",
          selected && "min-[900px]:bg-raised",
        )}
      >
        <Monogram label={proof.label} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-headline font-semibold">{proof.label}</p>
            {right ? <span className="text-footnote tnum shrink-0 text-label-2">{right}</span> : null}
          </div>
          <p className="text-subhead mt-0.5 truncate">{proof.challengeTitle}</p>
          <p className="text-subhead mt-0.5 line-clamp-2 text-label-2 text-pretty">{firstLine(proof.work)}</p>
          {footer}
        </div>
      </Link>
    </li>
  );
}

export function QueueGroup({ children }: { children: ReactNode }) {
  return <ul className="overflow-hidden rounded-card bg-surface">{children}</ul>;
}

export function QueueRowSkeleton() {
  return (
    <div className="flex gap-3 px-4 py-3.5">
      <span className="size-11 shrink-0 rounded-inner bg-raised" />
      <div className="flex-1">
        <span className="block h-4 w-24 rounded-full bg-raised" />
        <span className="mt-2.5 block h-3.5 w-52 rounded-full bg-raised" />
        <span className="mt-2 block h-3.5 w-40 rounded-full bg-raised" />
      </div>
    </div>
  );
}
