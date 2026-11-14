import type { CSSProperties } from "react";
import { cx } from "@/components/ui/cx";
import { EVENT_VENUE, project } from "@/lib/geo/espoo";
import { ESPOO_OUTLINE_PATH, ESPOO_VIEW } from "@/lib/geo/espoo-outline";
import type { Box } from "./labels";

const ITEMS = [
  { key: "sent", text: "Proof handed in" },
  { key: "answered", text: "Answered in writing" },
  { key: "invited", text: "Invited to meet" },
  { key: "met", text: "Met" },
] as const;

/** The mark for each state, drawn the way the map draws it. */
function LegendMark({ state }: { state: (typeof ITEMS)[number]["key"] }) {
  const line = {
    sent: "stroke-label-2 opacity-50",
    answered: "stroke-label-2 opacity-60",
    invited: "stroke-accent",
    met: "stroke-accent",
  }[state];
  return (
    <svg aria-hidden viewBox="0 0 28 12" className="h-3 w-7 shrink-0 overflow-visible">
      <path d="M1 9Q12 1 22 6" fill="none" strokeWidth={1.5} strokeDasharray={state === "sent" ? "2 3.5" : undefined} className={line} />
      {state === "met" ? (
        <>
          <circle cx={23.5} cy={6.5} r={4.5} fill="none" strokeWidth={1.5} className="stroke-accent" />
          <circle cx={23.5} cy={6.5} r={2.25} className="fill-label" />
        </>
      ) : (
        <circle cx={23.5} cy={6.5} r={2.25} className={state === "invited" ? "fill-accent" : "fill-label"} />
      )}
    </svg>
  );
}

type LegendState = (typeof ITEMS)[number]["key"];

/** The key, in words, one line style per state. Counts live in the city's tiles, not here. */
export function MapLegend({ states, className }: { states?: readonly LegendState[]; className?: string }) {
  const shown = states ? ITEMS.filter((item) => states.includes(item.key)) : ITEMS;
  return (
    <ul className={cx("flex flex-wrap gap-x-5 gap-y-2 text-[13px] leading-[18px] text-label-2", className)}>
      {shown.map((item) => (
        <li key={item.key} className="flex items-center gap-2">
          <LegendMark state={item.key} />
          <span>{item.text}</span>
        </li>
      ))}
    </ul>
  );
}

export const MAP_CAPTION = "Each line is one piece of work on its way to an employer. No names on this map.";

/**
 * The whole city in miniature, filled, with the part the map shows outlined and the event
 * marked, so a reader knows which corner of Espoo they are looking at.
 */
export function MapInset({ view, className, style }: { view: Box; className?: string; style?: CSSProperties }) {
  const venue = project(EVENT_VENUE.lat, EVENT_VENUE.lon);
  return (
    <svg aria-hidden viewBox={`-20 -20 ${ESPOO_VIEW.width + 40} ${ESPOO_VIEW.height + 40}`} className={cx("overflow-visible", className)} style={style}>
      <path d={ESPOO_OUTLINE_PATH} fillRule="evenodd" className="fill-label-3 opacity-40" />
      <rect x={view.x} y={view.y} width={view.width} height={view.height} rx={24} fill="none" strokeWidth={26} className="stroke-label" />
      <circle cx={venue.x} cy={venue.y} r={44} className="fill-accent" />
    </svg>
  );
}
