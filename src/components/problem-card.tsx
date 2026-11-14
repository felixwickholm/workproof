import Link from "next/link";
import { Users } from "lucide-react";
import type { Challenge, Company, TaskFormat } from "@/lib/domain/types";
import { CompanyMark, companiesOf } from "./company-mark";
import { Skeleton } from "./ui/skeleton";
import { cx } from "./ui/cx";
import { Tag } from "./ui/tag";

export const formatLabel: Record<TaskFormat, string> = {
  review: "Review task",
  plan: "Planning task",
  write: "Writing task",
  build: "Build task",
  explain: "Explain task",
};

/** One company: its blurb. A pooled task: no blurb, since the names already say who posted it. */
export function companyLine(challenge: Challenge, companies: Company[]) {
  const found = companiesOf(challenge, companies);
  return found.length === 1 ? found[0].blurb : "";
}

export function pooledLabel(challenge: Challenge) {
  const n = challenge.companyIds.length;
  return n > 1 ? `${n} companies, one task` : null;
}

export function metaLine(challenge: Challenge) {
  return [`${challenge.minutes} min`, challenge.aiAllowed ? "AI allowed" : null].filter(Boolean).join(" · ");
}

const SHOWN_SKILLS = 3;

/** A task as a tappable card in the list: who posted it, what it is, what it takes. */
export function ProblemCard({
  challenge,
  companies,
  selected,
  onSelect,
}: {
  challenge: Challenge;
  companies: Company[];
  /** Shown beside the list on a laptop. */
  selected?: boolean;
  /** On a laptop a tap shows the task beside the list instead of opening it. */
  onSelect?: () => void;
}) {
  const blurb = companyLine(challenge, companies);
  const pooled = pooledLabel(challenge);
  const more = challenge.coreSkills.length - SHOWN_SKILLS;
  return (
    <Link
      href={`/challenges/${challenge.id}`}
      data-story={`task-${challenge.id}`}
      aria-current={selected ? "true" : undefined}
      onClick={
        onSelect
          ? (e) => {
              e.preventDefault();
              onSelect();
            }
          : undefined
      }
      className={cx(
        "press highlight block rounded-card p-5 transition-colors duration-150 active:bg-raised",
        selected ? "bg-raised shadow-[inset_0_0_0_1px_var(--color-label-3)]" : "bg-surface",
      )}
    >
      <CompanyMark companies={companiesOf(challenge, companies)} />
      <h2 className="mt-3 text-[20px] leading-[25px] font-semibold tracking-[-0.015em] text-pretty">{challenge.title}</h2>
      {blurb ? <p className="text-subhead mt-1 truncate text-label-2">{blurb}</p> : null}
      <p className="text-footnote tnum mt-1 text-label-2">{metaLine(challenge)}</p>
      <div className="mt-3.5 flex flex-wrap gap-2">
        {challenge.coreSkills.slice(0, SHOWN_SKILLS).map((s) => (
          <Tag key={s.id}>{s.label}</Tag>
        ))}
        {more > 0 ? <Tag className="text-label-2">+{more}</Tag> : null}
      </div>
      {pooled ? (
        <p className="hairline-t text-footnote -mx-5 mt-4 flex items-center gap-2 px-5 pt-3.5 text-label-2">
          <Users aria-hidden className="size-4" strokeWidth={1.8} />
          {pooled}
        </p>
      ) : null}
    </Link>
  );
}

export function ProblemCardSkeleton() {
  return (
    <div className="rounded-card bg-surface p-5">
      <Skeleton className="h-3 w-40" />
      <Skeleton className="mt-3 h-5 w-64" />
      <Skeleton className="mt-3 h-3.5 w-44" />
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-7 w-20" />
        <Skeleton className="h-7 w-24" />
        <Skeleton className="h-7 w-16" />
      </div>
    </div>
  );
}
