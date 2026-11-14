import Link from "next/link";
import type { Challenge, TaskCounts } from "@/lib/domain/types";
import { Button } from "../ui/button";
import { cx } from "../ui/cx";
import { formatTotal } from "../words";
import { challengeHref, proofHref } from "./format";
import { challengeShape } from "./hiring-words";

/** One row of My challenges: the challenge, its numbers and where its next action goes. */
export interface ChallengeTableRow {
  challenge: Challenge;
  counts: TaskCounts;
  /** The highest total a reviewer gave on this challenge, or null before the first score. */
  topTotal: number | null;
  /** Work for this challenge still without a score. */
  waiting: number;
  /** The oldest work without a score, where "Score work" opens. */
  firstWaiting: string | null;
}

/** The columns from 900px: the challenge, four numbers right-aligned, and the action. */
const GRID = "min-[900px]:grid-cols-[minmax(0,1fr)_84px_84px_84px_96px_176px] min-[900px]:items-center min-[900px]:gap-x-4";

/**
 * My challenges as one table: rules and alignment, no bands. On a phone each row stacks, and the four
 * numbers sit in a row of their own with their labels under them.
 */
export function ChallengeTable({ rows }: { rows: readonly ChallengeTableRow[] }) {
  return (
    <div className="overflow-hidden rounded-card border border-separator bg-surface">
      <div aria-hidden className={cx("text-footnote hidden border-b border-separator px-6 py-3 font-semibold tracking-wide text-label-2 uppercase min-[900px]:grid", GRID)}>
        <span>Challenge</span>
        <span className="text-right">Did it</span>
        <span className="text-right">Scored</span>
        <span className="text-right">Invited</span>
        <span className="text-right">Top score</span>
        <span />
      </div>
      <ul className="divide-y divide-separator">
        {rows.map((row) => (
          <Row key={row.challenge.id} {...row} />
        ))}
      </ul>
    </div>
  );
}

function Row({ challenge, counts, topTotal, waiting, firstWaiting }: ChallengeTableRow) {
  const score = waiting > 0 && firstWaiting;
  return (
    <li className={cx("grid gap-4 px-5 py-5 min-[900px]:px-6 min-[900px]:py-4", GRID)}>
      <div className="min-w-0">
        <Link href={challengeHref(challenge.id)} className="text-headline block font-semibold text-pretty text-label underline-offset-4 hover:underline">
          {challenge.title}
        </Link>
        <p className="text-subhead mt-0.5 truncate text-label-2">
          {challengeShape(challenge)} · {challenge.coreSkills.map((s) => s.label).join(", ")}
        </p>
      </div>
      <div className="grid grid-cols-4 gap-2 min-[900px]:contents">
        <Stat label="did it" value={counts.took} />
        <Stat label="scored" value={counts.scored} />
        <Stat label="invited" value={counts.invited} />
        <Stat label="top score" value={topTotal === null ? null : formatTotal(topTotal)} />
      </div>
      <div className="flex min-[900px]:justify-end">
        {score ? (
          <Button href={proofHref(firstWaiting)} size="sm" className="w-full min-[900px]:w-auto">
            Score work ({waiting})
          </Button>
        ) : (
          <Button href={challengeHref(challenge.id)} variant="secondary" size="sm" className="w-full min-[900px]:w-auto">
            See top work
          </Button>
        )}
      </div>
    </li>
  );
}

/** One number. A missing value prints as a grey dash, a zero as a grey zero. */
function Stat({ label, value }: { label: string; value: number | string | null }) {
  const quiet = value === null || value === 0;
  return (
    <p className="flex flex-col min-[900px]:items-end">
      <span className={cx("tnum text-[22px] leading-7 min-[900px]:text-[17px] min-[900px]:leading-6", quiet ? "text-label-3" : "text-label")}>
        {value === null ? <span aria-label="none">–</span> : value}
      </span>
      <span className="text-footnote text-label-2 min-[900px]:sr-only">{label}</span>
    </p>
  );
}

/** The table's shape while it loads. */
export function ChallengeTableSkeleton() {
  return (
    <div aria-hidden className="overflow-hidden rounded-card border border-separator bg-surface">
      <ul className="divide-y divide-separator">
        {[0, 1].map((i) => (
          <li key={i} className={cx("grid gap-4 px-5 py-5 min-[900px]:px-6 min-[900px]:py-4", GRID)}>
            <div>
              <span className="block h-5 w-[min(420px,80%)] rounded-full bg-fill" />
              <span className="mt-2 block h-4 w-40 rounded-full bg-fill" />
            </div>
            <div className="grid grid-cols-4 gap-2 min-[900px]:contents">
              {[0, 1, 2, 3].map((j) => (
                <span key={j} className="h-6 w-10 rounded-full bg-fill min-[900px]:ml-auto" />
              ))}
            </div>
            <span className="h-[38px] w-full rounded-full bg-fill min-[900px]:ml-auto min-[900px]:w-36" />
          </li>
        ))}
      </ul>
    </div>
  );
}
