"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCompanyId, useCompanyKnown } from "@/components/company/company-choice";
import { useOnDemoReset } from "@/components/company/use-demo-reset";
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
}

const Context = createContext<ReviewState | null>(null);

export function ReviewProvider({ children }: { children: ReactNode }) {
  const [companyId, setCompanyId] = useCompanyId();
  const companies = useResource(() => api.companies(), []);
  const known = useCompanyKnown();
  const queue = useResource(known ? () => companyApi.queue(companyId) : null, [companyId, known], { pollMs: POLL_MS });
  useOnDemoReset(() => void queue.reload());

  const value: ReviewState = {
    companyId,
    setCompanyId,
    companies: companies.data,
    company: companies.data?.find((c) => c.id === companyId) ?? queue.data?.company ?? null,
    queue: queue.data,
    error: queue.error,
    loading: queue.loading,
    // The company list fails together with the queue when the network is down; retry both.
    retry: () => {
      if (!companies.data) companies.retry();
      queue.retry();
    },
    reload: queue.reload,
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
  | { kind: "recommended"; proof: BlindProof & { recommendedBy: string } }
  | { kind: "decided"; proof: BlindProof; entry: ReviewQueue["decided"][number] };

/** Finds a work in any section of the queue. */
export function findInQueue(queue: ReviewQueue, proofId: string): QueueItem | null {
  const own = queue.proofs.find((p) => p.proofId === proofId);
  if (own) return { kind: "review", proof: own };
  const second = queue.secondLook.find((p) => p.proofId === proofId);
  if (second) return { kind: "second", proof: second };
  const recommended = queue.recommended.find((p) => p.proofId === proofId);
  if (recommended) return { kind: "recommended", proof: recommended };
  const entry = queue.decided.find((d) => d.proof.proofId === proofId);
  if (entry) return { kind: "decided", proof: entry.proof, entry };
  return null;
}
