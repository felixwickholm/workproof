"use client";

import { useSyncExternalStore } from "react";
import { timeAgo } from "./format";

const MINUTE = 60_000;

function subscribe(listener: () => void) {
  const id = window.setInterval(listener, MINUTE);
  return () => window.clearInterval(id);
}

/** The current minute, so every relative time on the page moves together. */
const nowMinute = () => Math.floor(Date.now() / MINUTE) * MINUTE;

/** "3 h ago", updated each minute. The server renders nothing, so no clock ever mismatches. */
export function TimeAgo({ at, className }: { at: string; className?: string }) {
  const now = useSyncExternalStore(subscribe, nowMinute, () => null);
  return (
    <time dateTime={at} className={className}>
      {now === null ? null : timeAgo(at, now)}
    </time>
  );
}
