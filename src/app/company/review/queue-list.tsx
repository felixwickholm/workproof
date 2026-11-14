"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Monogram } from "@/components/blind-proof";
import { CompanySwitcher, CompanySwitcherSkeleton } from "@/components/company/company-switcher";
import { DecidedDetails, DecisionLine } from "@/components/company/decided-summary";
import { SECOND_LOOK_LINE, waitingFor } from "@/components/company/format";
import { QueueGroup, QueueRow, QueueRowSkeleton } from "@/components/company/queue-row";
import { cx } from "@/components/ui/cx";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import type { ReviewQueue } from "@/lib/domain/types";
import { useReview } from "./review-context";

const href = (proofId: string) => `/company/review/${encodeURIComponent(proofId)}`;

/** The inbox: to review and second look, oldest first; then the decided history, newest first. */
export function QueueList({ selectedId }: { selectedId: string | null }) {
  const { companies, companyId, setCompanyId, company, queue, error, loading, retry, reload, now } = useReview();
  const router = useRouter();

  const switchTo = (id: string) => {
    setCompanyId(id);
    if (selectedId) router.push("/company/review");
  };

  return (
    <div className="px-5 pt-3 pb-10">
      {companies ? (
        <CompanySwitcher companies={companies} value={companyId} onChange={switchTo} label="Reviewing as" />
      ) : (
        <CompanySwitcherSkeleton />
      )}

      <div className="mt-6">
        {company ? (
          <h1 className="text-large-title font-bold text-balance">{company.name}</h1>
        ) : (
          <Skeleton className="mt-2 h-8 w-56" />
        )}
        <p className="text-subhead mt-1 text-label-2">Oldest first. Tryout never ranks people.</p>
      </div>

      {loading && !queue ? (
        <Section label="To review">
          <div aria-busy className="overflow-hidden rounded-card bg-surface">
            <QueueRowSkeleton />
            <QueueRowSkeleton />
          </div>
        </Section>
      ) : error && !queue ? (
        <div className="mt-8">
          <ErrorState error={error} what="the queue" onRetry={retry} />
        </div>
      ) : queue ? (
        <div key={queue.company.id} className="rise">
          <Section label="To review" count={queue.proofs.length}>
            {queue.proofs.length === 0 ? (
              <Empty>Nothing waiting. New work shows up here as it arrives.</Empty>
            ) : (
              <QueueGroup>
                {queue.proofs.map((p) => (
                  <QueueRow key={p.proofId} proof={p} href={href(p.proofId)} selected={p.proofId === selectedId} right={waitingFor(p.submittedAt, now)} />
                ))}
              </QueueGroup>
            )}
          </Section>

          <Section label="Second look" count={queue.secondLook.length} note={SECOND_LOOK_LINE}>
            {queue.secondLook.length === 0 ? (
              <Empty>Nothing here yet. Work another employer said not now to shows up here when it matches your skills.</Empty>
            ) : (
              <QueueGroup>
                {queue.secondLook.map((p) => (
                  <QueueRow
                    key={p.proofId}
                    proof={p}
                    href={href(p.proofId)}
                    selected={p.proofId === selectedId}
                    right={waitingFor(p.submittedAt, now)}
                    footer={<p className="text-footnote mt-1 text-label-2 text-pretty">Matched on {p.sharedSkills.join(", ")}</p>}
                  />
                ))}
              </QueueGroup>
            )}
          </Section>

          <Section label="Decided" count={queue.decided.length}>
            {queue.decided.length === 0 ? (
              <Empty>No decisions yet. Each one sends written feedback to the person.</Empty>
            ) : (
              <DecidedList entries={queue.decided} selectedId={selectedId} onChanged={reload} />
            )}
          </Section>
        </div>
      ) : null}
    </div>
  );
}

const LATEST = 3;

/** Decisions, newest first. Only the latest few show until the reviewer asks for all. */
function DecidedList({ entries, selectedId, onChanged }: { entries: ReviewQueue["decided"]; selectedId: string | null; onChanged: () => Promise<void> }) {
  const [showAll, setShowAll] = useState(false);
  const newestFirst = [...entries].reverse();
  const visible = showAll
    ? newestFirst
    : newestFirst.filter((entry, i) => i < LATEST || entry.proof.proofId === selectedId);
  const hidden = newestFirst.length - visible.length;

  return (
    <ul className="overflow-hidden rounded-card bg-surface">
      {visible.map((entry) => {
        const selected = entry.proof.proofId === selectedId;
        return (
          <li key={entry.decision.id} className={cx("row relative px-4 pt-3.5 pb-4", selected && "min-[900px]:bg-raised/60")}>
            <Link href={href(entry.proof.proofId)} className="-mx-4 -mt-3.5 flex items-center gap-3 px-4 pt-3.5 pb-3">
              <Monogram label={entry.proof.label} />
              <div className="min-w-0 flex-1">
                <p className="text-headline font-semibold">{entry.proof.label}</p>
                <DecisionLine entry={entry} />
              </div>
            </Link>
            <DecidedDetails entry={entry} onChanged={onChanged} />
          </li>
        );
      })}
      {hidden > 0 ? (
        <li className="row relative">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-body flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors duration-150 active:bg-raised"
          >
            Show all {newestFirst.length}
            <ChevronDown aria-hidden className="size-5 shrink-0 text-label-2" strokeWidth={2.2} />
          </button>
        </li>
      ) : null}
    </ul>
  );
}

function Section({ label, count, note, children }: { label: string; count?: number; note?: string; children: ReactNode }) {
  return (
    <section className="mt-8" data-section={label}>
      <div className="mb-2 flex items-baseline justify-between gap-3 px-5">
        <h2 className="text-headline font-semibold">{label}</h2>
        {count ? <span className="text-subhead tnum text-label-2">{count}</span> : null}
      </div>
      {note ? <p className="text-footnote -mt-1 mb-2 px-5 text-label-2">{note}</p> : null}
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-subhead rounded-card bg-surface px-4 py-4 text-label-2 text-pretty">{children}</p>;
}
