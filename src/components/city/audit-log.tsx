"use client";

import { useState } from "react";
import type { AuditEvent } from "@/lib/domain/types";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";
import { auditActorName } from "./figures";
import { formatClock } from "./format";

const COLLAPSED = 12;

const actorLabel: Record<AuditEvent["actor"], string> = { ai: "AI", human: "Person", system: "System" };

const actorChip: Record<AuditEvent["actor"], string> = {
  human: "bg-tint text-accent",
  ai: "text-label shadow-[inset_0_0_0_1px_var(--color-control)]",
  system: "bg-fill text-label-2",
};

/** Every step anyone or anything took, newest first: time, who acted, what they did. */
export function AuditLog({ events, className }: { events: AuditEvent[]; className?: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? events : events.slice(0, COLLAPSED);

  return (
    <Panel title="Audit log" count={events.length} className={className}>
      <ol>
        {shown.map((e) => (
          <li
            key={e.id}
            className="grid grid-cols-[44px_minmax(0,1fr)] items-baseline gap-x-3 gap-y-1 py-2.5 [&+&]:hairline-t @min-[600px]:grid-cols-[44px_64px_128px_minmax(0,1fr)] @min-[600px]:py-2"
          >
            <time dateTime={e.at} className="text-footnote tnum text-label-2">
              {formatClock(e.at)}
            </time>
            {/* Narrow: the actor and who on one line. Wide: each in its own column. */}
            <span className="flex min-w-0 items-baseline gap-2 @min-[600px]:contents">
              <span className={cx("text-caption inline-flex h-5 w-fit shrink-0 items-center rounded-full px-2 font-medium", actorChip[e.actor])}>{actorLabel[e.actor]}</span>
              <span className="text-footnote truncate font-medium text-label">{auditActorName(e.by)}</span>
            </span>
            {/* Wide: one line per step, the full detail on hover. Narrow: the detail wraps under the action. */}
            <span title={e.detail} className="col-start-2 min-w-0 @min-[600px]:col-start-4 @min-[600px]:truncate">
              <span className="text-footnote block text-label @min-[600px]:inline">{e.action}</span>
              <span className="text-footnote block text-label-2 @min-[600px]:inline @min-[600px]:before:content-['_·_']">{e.detail}</span>
            </span>
          </li>
        ))}
      </ol>
      {events.length > COLLAPSED ? (
        <button
          type="button"
          onClick={() => setAll((v) => !v)}
          className="press text-subhead tnum mt-2 flex h-11 w-full items-center justify-center rounded-full bg-fill font-medium text-label transition-colors duration-150 hover:bg-label/10"
        >
          {all ? "Show the newest 12" : `Show all ${events.length}`}
        </button>
      ) : null}
    </Panel>
  );
}
