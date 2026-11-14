"use client";

import { useEffect, useState } from "react";
import { cx } from "./cx";

function format(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/**
 * A soft countdown. It never blocks: at zero it says "Take the time you need".
 * `startedAt` keeps the clock right across reloads.
 */
export function TimerChip({ minutes, startedAt }: { minutes: number; startedAt: number }) {
  const total = minutes * 60;
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const left = now === null ? total : Math.max(0, total - Math.floor((now - startedAt) / 1000));
  const over = left === 0;

  return (
    <span
      role="timer"
      aria-label={over ? "Time is up. Take the time you need." : `${format(left)} left`}
      className={cx(
        "inline-flex h-8 items-center rounded-full bg-fill px-3 text-footnote font-medium tnum",
        over ? "text-label-2" : "text-label",
      )}
    >
      {over ? "Take the time you need" : format(left)}
    </span>
  );
}
