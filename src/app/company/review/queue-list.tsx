"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { Monogram } from "@/components/blind-proof";
import { CompanySwitcher, CompanySwitcherSkeleton } from "@/components/company/company-switcher";
import { DecidedDetails, DecisionLine } from "@/components/company/decided-summary";
import { waitingFor } from "@/components/company/format";
import { QueueGroup, QueueRow, QueueRowSkeleton } from "@/components/company/queue-row";
import { Eyebrow } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { useReview } from "./review-context";

const href = (proofId: string) => `/company/review/${encodeURIComponent(proofId)}`;

/** The inbox: to review, second look, decided. Always oldest first. */
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

          <Section label="Second look" count={queue.secondLook.length} note="Another employer passed. The skills match your task.">
            {queue.secondLook.length === 0 ? (
              <Empty>Nothing here yet. Work another employer passed on shows up here when it matches your skills.</Empty>
            ) : (
              <QueueGroup>
                {queue.secondLook.map((p) => (
                  <QueueRow
                    key={p.proofId}
                    proof={p}
                    href={href(p.proofId)}
                    selected={p.proofId === selectedId}
                    right={waitingFor(p.submittedAt, now)}
                    footer={
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {p.sharedSkills.map((s) => (
                          <Tag key={s}>{s}</Tag>
                        ))}
                      </div>
                    }
                  />
                ))}
              </QueueGroup>
            )}
          </Section>

          <Section label="Decided" count={queue.decided.length}>
            {queue.decided.length === 0 ? (
              <Empty>No decisions yet. Each one sends written feedback to the person.</Empty>
            ) : (
              <ul className="overflow-hidden rounded-card bg-surface">
                {queue.decided.map((entry) => {
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
                      <DecidedDetails entry={entry} onChanged={reload} />
                    </li>
                  );
                })}
              </ul>
            )}
          </Section>
        </div>
      ) : null}
    </div>
  );
}

function Section({ label, count, note, children }: { label: string; count?: number; note?: string; children: ReactNode }) {
  return (
    <section className="mt-8">
      <div className="mb-2 flex items-baseline justify-between gap-3 px-4">
        <Eyebrow>{label}</Eyebrow>
        {count ? <span className="text-footnote tnum text-label-2">{count}</span> : null}
      </div>
      {note ? <p className="text-footnote -mt-1 mb-2 px-4 text-label-2">{note}</p> : null}
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-subhead rounded-card bg-surface px-4 py-4 text-label-2 text-pretty">{children}</p>;
}
