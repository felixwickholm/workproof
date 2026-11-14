"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { api, currentTalentId, errorText } from "@/lib/client/api";

const LABEL = "Second look";

/**
 * The person decides, per proof, whether other employers with the same skills may read the
 * blind proof. The list says exactly who can read it now.
 */
export function SharingCard({ proofId, sharing, sharedWith, onChanged }: { proofId: string; sharing: boolean; sharedWith: string[]; onChanged: () => Promise<void> }) {
  const [on, setOn] = useState(sharing);
  const [synced, setSynced] = useState(sharing);
  const [error, setError] = useState<string | null>(null);
  // The server's value wins once it changes, for example after a reload.
  if (synced !== sharing) {
    setSynced(sharing);
    setOn(sharing);
  }

  async function change(next: boolean) {
    setOn(next);
    setError(null);
    try {
      await api.setSharing(proofId, await currentTalentId(), next);
      await onChanged();
    } catch (e) {
      setOn(!next);
      setError(errorText(e));
    }
  }

  return (
    <div>
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-subhead font-medium text-label">{LABEL}</p>
          <p className="text-footnote mt-0.5 text-pretty text-label-2">
            If the company that posted the task says not now, or does not answer in 48 hours, employers whose tasks share 2 core skills may read this
            blind proof. No name.
          </p>
        </div>
        <Switch checked={on} onChange={(next) => void change(next)} label={LABEL} />
      </div>
      <p className="text-subhead mt-3 text-pretty text-label">
        {!on
          ? "Off. Only the company that posted the task can read it."
          : sharedWith.length > 0
            ? `Can read it now: ${sharedWith.join(", ")}.`
            : "On. No other employer can read it yet."}
      </p>
      <p className="text-footnote mt-2 text-pretty text-label-2">
        Turn it off at any time. Employers who have not answered yet can no longer read this proof. An employer that already answered keeps its answer.
      </p>
      {error ? (
        <p role="alert" className="text-footnote mt-2 text-label-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}
