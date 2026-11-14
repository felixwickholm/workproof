"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/lib/client/api";
import { toast } from "../ui/toast";

/** Fired on window after the visitor's demo data was reset; pages holding client data reload it. */
export const RESET_EVENT = "workproof:reset";

/** Fired on window to start a tour. The event's detail names which one. */
export const TOUR_EVENT = "workproof:tour";

/**
 * Starts a tour from anywhere: "minute" (the default) for the overview, or "seeker", "employer" or
 * "city" for the demo of that view. The tour listens for the event, so the shell needs no import of
 * it. Safe as an onClick handler: anything else (also the retired "story") starts the overview.
 */
export function startTour(kind?: unknown) {
  const known = kind === "seeker" || kind === "employer" || kind === "city";
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: known ? kind : "minute" }));
}

/** Resets this visitor's demo copy, refreshes server data and tells client-side pages to reload theirs. */
export function useResetDemo() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const reset = useCallback(async () => {
    setBusy(true);
    try {
      await api.resetDemo();
      router.refresh();
      window.dispatchEvent(new Event(RESET_EVENT));
      toast("Demo reset. Everything is back at the start.");
    } catch {
      toast("Could not reset the demo. Try again.");
    } finally {
      setBusy(false);
    }
  }, [router]);
  return { reset, busy };
}
