"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import { CompanyLine } from "@/components/company/company-line";
import { decidedLine, nameShown, newestFirst, type DecidedEntry } from "@/components/company/decision-words";
import { useOpenedProofs } from "@/components/company/opened-proofs";
import { QueueRow, QueueRowSkeleton } from "@/components/company/queue-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { useReview } from "./review-context";

/** Answered proofs shown before "Show all": enough for today's work, short enough to keep the list calm. */
const LATEST = 5;

/**
 * The review list in arrival order: proofs for the company's own tasks, then Second look, then
 * what it has answered. Never sorted by anything about the person. A dot marks only the proofs
 * this browser has not opened yet.
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

  return (
    <div className="pb-10 min-[900px]:pr-1">
      <CompanyLine companies={companies} value={companyId} onChange={switchTo} label="Reviewing as" className="px-1" />

      {loading && !queue ? (
        <Section label="To read">
          <div aria-busy>
            <QueueRowSkeleton />
            <QueueRowSkeleton />
            <QueueRowSkeleton />
          </div>
        </Section>
      ) : error && !queue ? (
        <div className="mt-6">
          <ErrorState error={error} what="the queue" onRetry={retry} away={{ href: "/employer", label: "Back to Hiring" }} />
        </div>
      ) : queue ? (
        <div key={queue.company.id}>
          <Section label="To read" count={queue.proofs.length}>
            {queue.proofs.length === 0 ? (
              <EmptyState
                action={
                  <Button href="/company" variant="secondary" size="sm">
                    Post a task
                  </Button>
                }
              >
                Nothing waits. New work shows up here in the order it arrives.
              </EmptyState>
            ) : (
              <ul>
                {queue.proofs.map((p) => (
                  <QueueRow key={p.proofId} proof={p} unread={unread(p.proofId)} selected={p.proofId === selectedId} />
                ))}
              </ul>
            )}
          </Section>

          <Section label="Second look" count={queue.secondLook.length} note="Work another employer could not use, shared with the person's consent. The skills match your task.">
            {queue.secondLook.length === 0 ? (
              <EmptyState>Nothing here now. When someone allows it, work another employer said not now to shows up here if the skills match.</EmptyState>
            ) : (
              <ul>
                {queue.secondLook.map((p) => (
                  <QueueRow key={p.proofId} proof={p} unread={unread(p.proofId)} selected={p.proofId === selectedId} />
                ))}
              </ul>
            )}
          </Section>

          <Section label="Answered" count={queue.decided.length}>
            {queue.decided.length === 0 ? (
              <EmptyState>No answers yet. Each decision sends your written words to the person.</EmptyState>
            ) : (
              <AnsweredList entries={queue.decided} selectedId={selectedId} />
            )}
          </Section>
        </div>
      ) : null}
    </div>
  );
}

/** Answered proofs, newest first. The latest few show until the reviewer asks for all. */
function AnsweredList({ entries, selectedId }: { entries: DecidedEntry[]; selectedId: string | null }) {
  const [showAll, setShowAll] = useState(false);
  const ordered = newestFirst(entries);
  const visible = showAll ? ordered : ordered.filter((entry, i) => i < LATEST || entry.proof.proofId === selectedId);
  const hidden = ordered.length - visible.length;

  return (
    <ul>
      {visible.map((entry) => (
        <QueueRow key={entry.decision.id} proof={entry.proof} selected={entry.proof.proofId === selectedId} status={<AnsweredStatus entry={entry} />} />
      ))}
      {hidden > 0 ? (
        <li>
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="text-subhead flex min-h-11 w-full items-center justify-between gap-3 rounded-[12px] px-3 text-left text-label transition-colors duration-150 hover:bg-fill/60"
          >
            Show all {ordered.length}
            <ChevronDown aria-hidden className="size-[18px] shrink-0 text-label-2" strokeWidth={2} />
          </button>
        </li>
      ) : null}
    </ul>
  );
}

/** The decision in words; once the person accepted, who they are, and why the name is shown. */
function AnsweredStatus({ entry }: { entry: DecidedEntry }) {
  const meet = entry.decision.decision === "meet";
  return (
    <span className="block">
      <span className={meet ? "text-footnote font-medium text-accent" : "text-footnote font-medium text-label-2"}>{decidedLine(entry)}</span>
      {nameShown(entry) && entry.identity ? (
        <span className="mt-1 block rounded-[10px] bg-raised px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--color-separator)]">
          <span className="text-footnote block font-semibold text-label">{entry.identity.name || "Name not given"}</span>
          <span className="text-footnote block truncate text-label">{entry.identity.contact || "No contact given"}</span>
          <span className="text-caption mt-0.5 block text-label-2">Name shown because the person accepted</span>
        </span>
      ) : null}
    </span>
  );
}

function Section({ label, count, note, children }: { label: string; count?: number; note?: string; children: ReactNode }) {
  return (
    <section className="mt-6" aria-label={label}>
      <div className="mb-1.5 flex items-baseline gap-2 px-1">
        <h2 className="text-section text-label">{label}</h2>
        {count !== undefined ? <span className="text-footnote tnum text-label-2">{count}</span> : null}
      </div>
      {note ? <p className="text-footnote mb-2 px-1 text-pretty text-label-2">{note}</p> : null}
      {children}
    </section>
  );
}
