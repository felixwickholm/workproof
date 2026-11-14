"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useCompanyId } from "@/components/company/company-choice";
import { api, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { BlindProof, Company, ReviewQueue } from "@/lib/domain/types";

/** Polling keeps the company screen in step with the talent's phone: a reveal shows within 5 seconds. */
const POLL_MS = 4000;

interface ReviewState {
  companyId: string;
  setCompanyId: (id: string) => void;
  companies: Company[] | null;
  company: Company | null;
  queue: ReviewQueue | null;
  error: unknown;
  loading: boolean;
  retry: () => void;
  reload: () => Promise<void>;
  /** Clock for "time waiting", ticking every 30 seconds. Null until the page runs in the browser. */
  now: number | null;
}

const Context = createContext<ReviewState | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const queue = useResource(() => companyApi.queue(companyId), [companyId], { pollMs: POLL_MS });
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const value: ReviewState = {
    companyId,
    setCompanyId,
    companies: companies.data,
    company: companies.data?.find((c) => c.id === companyId) ?? queue.data?.company ?? null,
    queue: queue.data,
    error: queue.error,
    loading: queue.loading,
    retry: queue.retry,
    reload: queue.reload,
    now,
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useReview(): ReviewState {
  const value = useContext(Context);
  if (!value) throw new Error("useReview must be used inside ReviewProvider");
  return value;
}

export type QueueItem =
  | { kind: "review"; proof: BlindProof }
  | { kind: "second"; proof: BlindProof & { sharedSkills: string[] } }
  | { kind: "decided"; proof: BlindProof; entry: ReviewQueue["decided"][number] };

/** Finds a proof in any section of the queue. */
export function findInQueue(queue: ReviewQueue, proofId: string): QueueItem | null {
  const own = queue.proofs.find((p) => p.proofId === proofId);
  if (own) return { kind: "review", proof: own };
  const second = queue.secondLook.find((p) => p.proofId === proofId);
  if (second) return { kind: "second", proof: second };
  const entry = queue.decided.find((d) => d.proof.proofId === proofId);
  if (entry) return { kind: "decided", proof: entry.proof, entry };
  return null;
}
