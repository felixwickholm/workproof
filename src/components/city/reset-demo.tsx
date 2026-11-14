"use client";

import { useState } from "react";
import { api, errorText } from "@/lib/client/api";
import { Button } from "../ui/button";

/** Quiet reset for presenters, with an inline confirm step. */
export function ResetDemo({ onDone }: { onDone: () => Promise<void> }) {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reset() {
    setBusy(true);
    setError(null);
    try {
      await api.resetDemo();
      await onDone();
      setConfirming(false);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setBusy(false);
    }
  }

  if (!confirming) {
    return (
      <Button variant="quiet" size="sm" onClick={() => setConfirming(true)}>
        Reset demo data
      </Button>
    );
  }

  return (
    <div className="rounded-card bg-surface p-5">
      <p className="text-headline font-semibold">Reset the demo data?</p>
      <p className="text-subhead mt-1 text-label-2 text-pretty">
        This removes everything people did here and loads the sample event again.
      </p>
      {error ? (
        <p role="alert" className="text-footnote mt-3 text-label-2">
          {error}
        </p>
      ) : null}
      <div className="mt-4 flex gap-2">
        <Button variant="secondary" size="sm" loading={busy} onClick={reset}>
          Reset
        </Button>
        <Button variant="quiet" size="sm" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
