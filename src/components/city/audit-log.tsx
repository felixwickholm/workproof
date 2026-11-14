import type { AuditEvent } from "@/lib/domain/types";
import { formatClock } from "./format";

const actorLabel: Record<AuditEvent["actor"], string> = { ai: "Software", human: "Person", system: "System" };

/** The log names roles and reviewers only. A person who sent work shows as "Work seeker", never by name. */
export function actorName(by: string) {
  return by === "Talent" ? "Work seeker" : by;
}

/** Every step anyone or anything took, newest first, as a plain table: time, who, what. */
export function AuditLog({ events }: { events: AuditEvent[] }) {
  if (events.length === 0) return <p className="text-body text-label-2">Nothing has happened yet. Each action shows here.</p>;
  return (
    <div className="@container">
      <table className="w-full border-collapse text-left">
        <thead className="sr-only @min-[640px]:not-sr-only">
          <tr className="text-footnote text-label-2">
            <th scope="col" className="w-20 pb-3 font-normal">Time</th>
            <th scope="col" className="w-56 pb-3 font-normal">Who</th>
            <th scope="col" className="pb-3 font-normal">What</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} className="hairline-t align-baseline max-[639px]:grid max-[639px]:grid-cols-[64px_minmax(0,1fr)] max-[639px]:py-3">
              <td className="text-subhead tnum py-3 text-label-2 max-[639px]:row-span-2 max-[639px]:py-0">
                <time dateTime={e.at}>{formatClock(e.at)}</time>
              </td>
              <td className="text-subhead py-3 pr-4 text-label max-[639px]:py-0">
                {actorName(e.by)} <span className="text-label-2">· {actorLabel[e.actor]}</span>
              </td>
              <td className="text-subhead py-3 text-label max-[639px]:py-0 max-[639px]:pt-1">
                {e.action}
                <span className="block text-label-2">{e.detail}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
