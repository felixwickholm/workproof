"use client";

import { useEffect, useState } from "react";
import { clock } from "@/lib/think-aloud/transcript";

const R = 12;
const C = 2 * Math.PI * R;

/**
 * A calm ring that empties over the challenge's minutes. It never blocks: at zero it says
 * "Take your time". `startedAt` keeps it right across reloads; `at` drives it in a demo.
 */
export function TimeRing({ minutes, startedAt, at }: { minutes: number; startedAt: number; at?: number }) {
  const total = minutes * 60;
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (at !== undefined) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [at]);

  const used = at ?? (now === null ? 0 : Math.floor((now - startedAt) / 1000));
  const left = Math.max(0, total - used);
  const share = total ? left / total : 0;
  return (
    <span role="timer" aria-label={left ? `${clock(left)} left` : "Time is up. Take your time."} className="inline-flex items-center gap-2.5">
      <svg aria-hidden viewBox="0 0 32 32" className="size-8 -rotate-90">
        <circle cx="16" cy="16" r={R} fill="none" strokeWidth="3" className="stroke-fill" />
        <circle cx="16" cy="16" r={R} fill="none" strokeWidth="3" strokeLinecap="round" className="stroke-label transition-[stroke-dashoffset] duration-1000 ease-linear" strokeDasharray={C} strokeDashoffset={C * (1 - share)} />
      </svg>
      <span className="text-body tnum text-label">{left ? `${clock(left)} left` : "Take your time"}</span>
    </span>
  );
}
