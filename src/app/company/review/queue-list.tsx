"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { type ReactNode } from "react";
import { challengeHref } from "@/components/company/format";
import { CompanyLine } from "@/components/company/company-line";
import { newestFirst } from "@/components/company/decision-words";
import { rowState } from "@/components/company/hiring-words";
import { useOpenedProofs } from "@/components/company/opened-proofs";
import { sharedRows } from "@/components/company/review-order";
import { QueueRow, QueueRowSkeleton } from "@/components/company/queue-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { totalOutOf } from "@/components/words";
import { useReview } from "./review-context";

/**
 * The work to score, oldest first, then work other companies shared, then what this company scored.
 * Unscored work stays in arrival order: never sorted by anything about the person. Each challenge's
 * top work is one tap away at the bottom.
 */
export function QueueList({ selectedId }: { selectedId: string | null }) {
  const { companies, companyId, setCompanyId, queue, error, loading, retry } = useReview();
  const opened = useOpenedProofs();
  const router = useRouter();
  const unread = (proofId: string) => opened !== null && !opened.has(proofId);

  const switchTo = (id: string) => {
    setCompanyId(id);
    if (selectedId) router.push("/company/review");
  };

  if (loading && !queue) {
    return (
      <Section label="Waiting for a score">
        <div aria-busy>
          <QueueRowSkeleton />
          <QueueRowSkeleton />
          <QueueRowSkeleton />
        </div>
      </Section>
    );
  }
  if (error && !queue) return <ErrorState error={error} what="the work to score" onRetry={retry} away={{ href: "/employer", label: "Back to my challenges" }} />;
  if (!queue) return null;

  const shared = sharedRows(queue);

  return (
    <div key={queue.company.id} className="pb-10 min-[900px]:flex min-[900px]:flex-wrap min-[900px]:gap-x-14 min-[900px]:gap-y-6 min-[900px]:pb-0">
      <CompanyLine companies={companies} value={companyId} onChange={switchTo} label="Scoring as" className="px-1 min-[900px]:basis-full min-[900px]:px-0" />

      <Section label="Waiting for a score" count={queue.proofs.length}>
        {queue.proofs.length === 0 ? (
          <EmptyState
            action={
              <Button href="/company" variant="secondary" size="sm">
                New challenge
              </Button>
            }
          >
            Nothing waits. New work shows up here, oldest first.
          </EmptyState>
        ) : (
          <ul className={ROWS}>
            {queue.proofs.map((p) => (
              <QueueRow key={p.proofId} proof={p} unread={unread(p.proofId)} selected={p.proofId === selectedId} />
            ))}
          </ul>
        )}
      </Section>

      {shared.length > 0 ? (
        <Section label="Shared with you" count={shared.length}>
          <ul className={ROWS}>
            {shared.map(({ proof, line }) => (
              <QueueRow key={proof.proofId} proof={proof} unread={unread(proof.proofId)} selected={proof.proofId === selectedId} status={line} />
            ))}
          </ul>
        </Section>
      ) : null}

      {queue.decided.length > 0 ? (
        <Section label="Scored" count={queue.decided.length}>
          <ul className={ROWS}>
            {newestFirst(queue.decided).map((entry) => (
              <QueueRow
                key={entry.decision.id}
                proof={entry.proof}
                selected={entry.proof.proofId === selectedId}
                value={typeof entry.decision.total === "number" ? <span className="text-body font-medium">{totalOutOf(entry.decision.total)}</span> : undefined}
                status={rowState(entry)}
              />
            ))}
          </ul>
        </Section>
      ) : null}

      {queue.challenges.length > 0 ? (
        <Section label="Top work">
          <ul className={ROWS}>
            {queue.challenges.map((c) => (
              <li key={c.id}>
                <Link
                  href={challengeHref(c.id)}
                  title={c.title}
                  className="press text-body flex min-h-14 items-center gap-3 rounded-[14px] px-4 py-3 text-label transition-colors duration-150 hover:bg-fill/60 min-[900px]:h-12 min-[900px]:min-h-0 min-[900px]:max-w-[34ch] min-[900px]:rounded-full min-[900px]:bg-raised min-[900px]:py-0 min-[900px]:hover:bg-fill"
                >
                  <span className="min-w-0 flex-1 text-pretty min-[900px]:truncate">{c.title}</span>
                  <ChevronRight aria-hidden className="size-4 shrink-0 text-label-2" strokeWidth={1.75} />
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </div>
  );
}

/** On a phone a stack of roomy rows; from 900px one line of chips that wraps. */
const ROWS = "flex flex-col gap-1 min-[900px]:flex-row min-[900px]:flex-wrap min-[900px]:gap-2";

function Section({ label, count, children }: { label: string; count?: number; children: ReactNode }) {
  return (
    <section className="mt-10 min-[900px]:mt-0" aria-label={label}>
      <div className="mb-3 flex items-baseline gap-2 px-1 min-[900px]:px-0">
        <h2 className="text-section text-label min-[900px]:text-headline">{label}</h2>
        {count !== undefined ? <span className="text-subhead tnum text-label-2">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}
