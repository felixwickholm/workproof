import type { CSSProperties } from "react";
import { cx } from "@/components/ui/cx";
import { EVENT_VENUE, project } from "@/lib/geo/espoo";
import { ESPOO_OUTLINE_PATH, ESPOO_VIEW } from "@/lib/geo/espoo-outline";
import { PinMark } from "./company-node";
import { FAMILY_LABEL, FAMILY_ORDER, FAMILY_SHAPE } from "./families";
import type { Box } from "./labels";
import type { FlowStage } from "./summary";

const LINES: readonly { stage: FlowStage; text: string }[] = [
  { stage: "sent", text: "Handed in" },
  { stage: "scored", text: "Scored by a person" },
  { stage: "invited", text: "Invited to talk" },
];

/** The mark for each line, drawn the way the map draws it. */
function LineMark({ stage }: { stage: FlowStage }) {
  return (
    <svg aria-hidden viewBox="0 0 28 12" className="h-3 w-7 shrink-0 overflow-visible">
      <path
        d="M1 9Q13 1 27 6"
        fill="none"
        strokeWidth={2}
        strokeLinecap="round"
        strokeDasharray={stage === "sent" ? "2.5 3.5" : undefined}
        className={stage === "invited" ? "stroke-accent" : "stroke-label-2"}
      />
    </svg>
  );
}

/** The key, in words: three pin shapes for the three families, three line styles for how far the work got. */
export function MapLegend({ className }: { className?: string }) {
  return (
    <div className={cx("flex flex-col gap-2 text-[14px] leading-5 text-label-2", className)}>
      <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Employer types">
        {FAMILY_ORDER.map((family) => (
          <li key={family} className="flex items-center gap-2">
            <PinMark shape={FAMILY_SHAPE[family]} className="size-2.5 fill-label" />
            <span>{FAMILY_LABEL[family]}</span>
          </li>
        ))}
      </ul>
      <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Lines">
        {LINES.map((item) => (
          <li key={item.stage} className="flex items-center gap-2">
            <LineMark stage={item.stage} />
            <span>{item.text}</span>
          </li>
        ))}
        <li>A thicker line carries more work</li>
      </ul>
    </div>
  );
}

export const MAP_CAPTION = "Each line runs from the event to an employer. No names of people on this map.";

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
