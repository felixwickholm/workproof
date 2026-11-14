"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { api } from "@/lib/client/api";
import { toast } from "../ui/toast";

/** Fired on window after the visitor's demo data was reset; pages holding client data reload it. */
export const RESET_EVENT = "workprint:reset";

/** Fired on window to start a walkthrough. The event's detail names which one. */
export const TOUR_EVENT = "workprint:tour";

/**
 * Starts a walkthrough from anywhere: the one-minute walkthrough by default, or Olena's whole story.
 * The tour listens for the event, so the shell needs no import of it. Safe as an onClick handler:
 * anything other than "story" starts the one-minute walkthrough.
 */
export function startTour(kind?: "minute" | "story" | unknown) {
  window.dispatchEvent(new CustomEvent(TOUR_EVENT, { detail: kind === "story" ? "story" : "minute" }));
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
