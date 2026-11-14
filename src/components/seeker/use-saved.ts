"use client";

import { useCallback, useSyncExternalStore } from "react";
import { getSavedChallenges, setChallengeSaved } from "@/lib/client/local";

const EVENT = "workproof:saved";
const NONE: readonly string[] = [];

/** One cached snapshot per stored value, so useSyncExternalStore sees a stable list between changes. */
let cache: { raw: string; ids: readonly string[] } = { raw: "", ids: NONE };

function snapshot(): readonly string[] {
  const ids = getSavedChallenges();
  const raw = ids.join("|");
  if (raw !== cache.raw) cache = { raw, ids };
  return cache.ids;
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  // Another tab saving a challenge updates this one too.
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** The challenges this visitor saved on this device, and a toggle. The server render sees none. */
export function useSaved(): { saved: readonly string[]; toggle: (challengeId: string) => void } {
  const saved = useSyncExternalStore(subscribe, snapshot, () => NONE);
  const toggle = useCallback((challengeId: string) => {
    setChallengeSaved(challengeId, !getSavedChallenges().includes(challengeId));
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { saved, toggle };
}
