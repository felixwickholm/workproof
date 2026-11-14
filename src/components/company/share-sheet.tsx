"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { cityApi, companyApi } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import { Button } from "../ui/button";
import { ErrorState } from "../ui/error-state";
import { Sheet } from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";
import { companyErrorText } from "./format";
import { workLabel } from "../words";

interface Props {
  open: boolean;
  onClose: () => void;
  proofId: string;
  proofLabel: string;
  challengeId: string;
  companyId: string;
}

const SHARE_LINE = "Share good candidates. The other company sees the work, not your scores.";
const NO_SHARING_LINE = "This person did not allow sharing.";

/**
 * Tip another company about one good piece of work. Only companies with a challenge that shares at
 * least two skills qualify, and only when the person allowed sharing.
 */
export function ShareSheet({ open, onClose, proofId, proofLabel, challengeId, companyId }: Props) {
  const data = useResource(
    open ? async () => {
      const [task, matches] = await Promise.all([cityApi.task(challengeId), cityApi.matches(challengeId)]);
      return { entry: task.top.find((t) => t.proofId === proofId), matches: matches.filter((m) => m.companyId !== companyId) };
    } : null,
    [open, challengeId, proofId],
  );
  const [sent, setSent] = useState<string[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function share(toCompanyId: string) {
    if (busy) return;
    setBusy(toCompanyId);
    setError(null);
    try {
      await companyApi.recommend({ proofId, fromCompanyId: companyId, toCompanyId });
      setSent((list) => [...list, toCompanyId]);
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      setBusy(null);
    }
  }

  const d = data.data;
  const sharedWith = new Set(d?.entry?.sharedWith ?? []);

  return (
    <Sheet open={open} onClose={onClose} title={`Share ${workLabel(proofLabel)}`}>
      <p className="text-body -mt-2 text-pretty text-label-2">{SHARE_LINE}</p>
      <div className="mt-5">
        {data.error && !d ? (
          <ErrorState error={data.error} what="the companies to share with" onRetry={data.retry} />
        ) : !d ? (
          <div aria-busy className="flex flex-col gap-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-5 w-64" />
          </div>
        ) : !d.entry?.canShare ? (
          <p className="text-body font-medium text-label">{NO_SHARING_LINE}</p>
        ) : d.matches.length === 0 ? (
          <p className="text-body text-label">No other company has a challenge with the same skills yet.</p>
        ) : (
          <ul className="-mx-1 flex flex-col">
            {d.matches.map((m) => {
              const done = sent.includes(m.companyId) || sharedWith.has(m.name);
              return (
                <li key={m.companyId} className="flex min-h-16 items-center gap-4 border-b border-separator px-1 py-3 last:border-b-0">
                  <span className="min-w-0 flex-1">
                    <span className="text-body block font-medium text-label">{m.name}</span>
                    <span className="text-footnote block text-pretty text-label-2">Same skills: {m.sharedSkills.join(", ")}</span>
                  </span>
                  {done ? (
                    <span className="text-subhead flex items-center gap-1.5 text-label-2">
                      <Check aria-hidden className="size-4" strokeWidth={1.75} />
                      Shared
                    </span>
                  ) : (
                    <Button variant="secondary" size="sm" loading={busy === m.companyId} onClick={() => void share(m.companyId)}>
                      Share
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {error ? (
          <p role="alert" className="text-footnote mt-3 text-label-2">
            {error}
          </p>
        ) : null}
      </div>
    </Sheet>
  );
}
