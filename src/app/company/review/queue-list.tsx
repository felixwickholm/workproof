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
import { formatTotal } from "@/components/words";
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
    <div key={queue.company.id} className="pb-10">
      <CompanyLine companies={companies} value={companyId} onChange={switchTo} label="Scoring as" className="px-1" />

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
          <ul>
            {queue.proofs.map((p) => (
              <QueueRow key={p.proofId} proof={p} unread={unread(p.proofId)} selected={p.proofId === selectedId} />
            ))}
          </ul>
        )}
      </Section>

      {shared.length > 0 ? (
        <Section label="Shared with you" count={shared.length}>
          <ul>
            {shared.map(({ proof, line }) => (
              <QueueRow key={proof.proofId} proof={proof} unread={unread(proof.proofId)} selected={proof.proofId === selectedId} status={line} />
            ))}
          </ul>
        </Section>
      ) : null}

      {queue.decided.length > 0 ? (
        <Section label="Scored" count={queue.decided.length}>
          <ul>
            {newestFirst(queue.decided).map((entry) => (
              <QueueRow
                key={entry.decision.id}
                proof={entry.proof}
                selected={entry.proof.proofId === selectedId}
                value={typeof entry.decision.total === "number" ? <span className="text-body text-label">{formatTotal(entry.decision.total)}</span> : undefined}
                status={rowState(entry)}
              />
            ))}
          </ul>
        </Section>
      ) : null}

      {queue.challenges.length > 0 ? (
        <Section label="Top work">
          <ul>
            {queue.challenges.map((c) => (
              <li key={c.id}>
                <Link href={challengeHref(c.id)} className="text-subhead flex min-h-11 items-center gap-2 rounded-[12px] px-3 py-2 text-label transition-colors duration-150 hover:bg-fill/60">
                  <span className="min-w-0 flex-1 text-pretty">{c.title}</span>
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

function Section({ label, count, children }: { label: string; count?: number; children: ReactNode }) {
  return (
    <section className="mt-6" aria-label={label}>
      <div className="mb-1.5 flex items-baseline gap-2 px-1">
        <h2 className="text-section text-label">{label}</h2>
        {count !== undefined ? <span className="text-footnote tnum text-label-2">{count}</span> : null}
      </div>
      {children}
    </section>
  );
}
