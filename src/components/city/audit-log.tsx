"use client";

import { useEffect, useState } from "react";
import type { AuditEvent } from "@/lib/domain/types";
import { formatAgo } from "./format";

const actorLabel: Record<AuditEvent["actor"], string> = { ai: "AI", human: "Human", system: "System" };
const COLLAPSED = 8;

/** Every step anyone or anything took, newest first. */
export function AuditLog({ events }: { events: AuditEvent[] }) {
  const [all, setAll] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const shown = all ? events : events.slice(0, COLLAPSED);

  return (
    <div className="overflow-hidden rounded-card bg-surface">
      <ol className="[--row-inset:16px]">
        {shown.map((e) => (
          <li key={e.id} className="row relative flex gap-3 px-4 py-3">
            <span className="mt-0.5 inline-flex h-5 w-[52px] shrink-0 items-center justify-center rounded-full text-caption font-medium text-label-2 shadow-[inset_0_0_0_0.5px_var(--color-label-3)]">
              {actorLabel[e.actor]}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-subhead text-pretty">
                <span className="font-semibold">{e.by}</span> <span className="text-label">{e.action.charAt(0).toLowerCase() + e.action.slice(1)}</span>
              </p>
              <p className="text-footnote mt-0.5 text-label-2 text-pretty">{e.detail}</p>
            </div>
            <time dateTime={e.at} className="text-footnote tnum shrink-0 text-label-3">
              {formatAgo(e.at, now)}
            </time>
          </li>
        ))}
      </ol>
      {events.length > COLLAPSED ? (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="hairline-t text-subhead tnum flex h-12 w-full items-center justify-center font-medium text-label transition-colors duration-150 active:bg-raised"
        >
          {all ? "Show fewer" : `Show all ${events.length}`}
        </button>
      ) : null}
    </div>
  );
}
