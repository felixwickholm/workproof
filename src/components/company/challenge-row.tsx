import Link from "next/link";
import type { Challenge, TaskCounts } from "@/lib/domain/types";
import { Button } from "../ui/button";
import { cx } from "../ui/cx";
import { proofHref } from "./format";
import { FunnelNumbers } from "./funnel-numbers";
import { challengeShape } from "./hiring-words";

export function challengeHref(challengeId: string): string {
  return `/employer/challenges/${encodeURIComponent(challengeId)}`;
}

interface Props {
  challenge: Challenge;
  counts: TaskCounts;
  /** Work for this challenge still without a score. */
  waiting: number;
  /** The oldest work without a score, where "Score work" opens. */
  firstWaiting: string | null;
}

/**
 * One challenge in one row: its title and shape, the four steps as numbers, and the one action
 * that matters now: scoring when work waits, else the top work.
 */
export function ChallengeRow({ challenge, counts, waiting, firstWaiting }: Props) {
  const score = waiting > 0 && firstWaiting;
  return (
    <li className="grid gap-4 py-5 min-[1000px]:grid-cols-[minmax(0,1fr)_auto_200px] min-[1000px]:items-center min-[1000px]:gap-8">
      <div className="min-w-0">
        <Link href={challengeHref(challenge.id)} className="text-title-3 block font-semibold text-pretty text-label underline-offset-4 hover:underline">
          {challenge.title}
        </Link>
        <p className="text-subhead mt-1 text-label-2">{challengeShape(challenge)}</p>
      </div>
      <FunnelNumbers counts={counts} />
      <div className={cx("flex min-[1000px]:justify-end")}>
        {score ? (
          <Button href={proofHref(firstWaiting)} variant="secondary" size="sm" className="w-full min-[1000px]:w-auto">
            Score work ({waiting})
          </Button>
        ) : (
          <Button href={challengeHref(challenge.id)} variant="secondary" size="sm" className="w-full min-[1000px]:w-auto">
            See top work
          </Button>
        )}
      </div>
    </li>
  );
}

/** A row's shape while the list loads. */
export function ChallengeRowSkeleton() {
  return (
    <li aria-hidden className="grid gap-4 py-5 min-[1000px]:grid-cols-[minmax(0,1fr)_auto_200px] min-[1000px]:items-center min-[1000px]:gap-8">
      <div>
        <span className="block h-6 w-[min(420px,80%)] rounded-full bg-fill" />
        <span className="mt-2 block h-4 w-28 rounded-full bg-fill" />
      </div>
      <div className="flex gap-6">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className="flex flex-col gap-2">
            <span className="h-7 w-8 rounded-full bg-fill" />
            <span className="h-3.5 w-14 rounded-full bg-fill" />
          </span>
        ))}
      </div>
      <span className="h-[38px] w-full rounded-full bg-fill min-[1000px]:ml-auto min-[1000px]:w-40" />
    </li>
  );
}
