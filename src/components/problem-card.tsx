import Link from "next/link";
import { Users } from "lucide-react";
import type { Challenge, Company, TaskFormat } from "@/lib/domain/types";
import { Skeleton } from "./ui/skeleton";
import { Tag } from "./ui/tag";

export const formatLabel: Record<TaskFormat, string> = {
  review: "Review task",
  plan: "Planning task",
  write: "Writing task",
  build: "Build task",
  explain: "Explain task",
};

/** One company: its blurb. A pooled task: the company names, since several blurbs do not fit one line. */
export function companyLine(challenge: Challenge, companies: Company[]) {
  const found = challenge.companyIds
    .map((id) => companies.find((c) => c.id === id))
    .filter((c): c is Company => Boolean(c));
  if (found.length > 1) return found.map((c) => c.name).join(" and ");
  return found[0]?.blurb ?? "";
}

export function pooledLabel(challenge: Challenge) {
  const n = challenge.companyIds.length;
  return n > 1 ? `${n} companies, one task` : null;
}

export function metaLine(challenge: Challenge) {
  return [`${challenge.minutes} min`, formatLabel[challenge.format], challenge.aiAllowed ? "AI allowed" : null]
    .filter(Boolean)
    .join(" · ");
}

/** A challenge as a tappable card in the list. */
export function ProblemCard({ challenge, companies }: { challenge: Challenge; companies: Company[] }) {
  const blurb = companyLine(challenge, companies);
  const pooled = pooledLabel(challenge);
  return (
    <Link href={`/challenges/${challenge.id}`} className="press highlight block rounded-card bg-surface p-5 transition-colors duration-150 active:bg-raised">
      {blurb ? <p className="text-footnote line-clamp-2 text-label-2">{blurb}</p> : null}
      <h2 className="text-title-3 mt-1 font-semibold text-pretty">{challenge.title}</h2>
      <p className="text-subhead tnum mt-1 text-label-2">{metaLine(challenge)}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {challenge.coreSkills.slice(0, 5).map((s) => (
          <Tag key={s.id}>{s.label}</Tag>
        ))}
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
