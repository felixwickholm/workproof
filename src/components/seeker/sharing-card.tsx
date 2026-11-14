"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { api, currentTalentId, errorText } from "@/lib/client/api";

const LABEL = "Let other companies with the same need see this work";

/**
 * The person decides, per piece of work, whether other companies with the same need may see it,
 * without the name. The lines under the switch say exactly who can see it now.
 */
export function SharingCard({ proofId, sharing, onChanged }: { proofId: string; sharing: boolean; onChanged: () => Promise<void> }) {
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
          <p className="text-body font-medium text-label">{LABEL}</p>
          <p className="text-footnote mt-0.5 text-pretty text-label-2">They see the work, not your name. Turn it off at any time.</p>
        </div>
        <Switch checked={on} onChange={(next) => void change(next)} label={LABEL} />
      </div>
      {error ? (
        <p role="alert" className="text-footnote mt-2 text-label-2">
          {error}
        </p>
      ) : null}
    </div>
  );
}
