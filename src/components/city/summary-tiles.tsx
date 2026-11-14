import type { CityOverview } from "@/lib/domain/types";
import { cx } from "../ui/cx";

type Totals = CityOverview["totals"];

const tiles: { key: Exclude<keyof Totals, "automatedDecisions">; label: string; human?: boolean }[] = [
  { key: "challenges", label: "Problem Cards live" },
  { key: "proofs", label: "Proofs sent" },
  { key: "humanDecisions", label: "Human decisions", human: true },
  { key: "meetingsInvited", label: "Meetings invited" },
  { key: "meetingsConfirmedByBoth", label: "Meetings confirmed by both sides" },
  { key: "secondLookMeetings", label: "Second Look meetings" },
];

/** Six outcome numbers and the one that matters most: automated decisions, always zero. */
export function SummaryTiles({ totals }: { totals: Totals }) {
  return (
    <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
      {tiles.map(({ key, label, human }) => (
        <Tile key={key} label={label} value={totals[key]} human={human} />
      ))}
      <div className="col-span-2 flex items-center justify-between gap-4 rounded-card bg-surface p-5 min-[900px]:col-span-1 min-[900px]:col-start-4 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:flex-col min-[900px]:items-start">
        <div>
          <p className="text-headline font-semibold">Automated decisions</p>
          <p className="text-subhead mt-1 text-label-2 text-pretty">Every decision has a named person.</p>
        </div>
        <p className="tnum text-[56px] leading-none font-bold tracking-[-0.03em] text-accent min-[900px]:text-[88px]">
          {totals.automatedDecisions}
        </p>
      </div>
    </div>
  );
}

function Tile({ label, value, human }: { label: string; value: number; human?: boolean }) {
  return (
    <div className="flex min-h-[124px] flex-col justify-between gap-3 rounded-card bg-surface p-4">
      <p className="text-subhead font-medium text-label-2 text-pretty">{label}</p>
      <p className={cx("tnum text-[40px] leading-none font-bold tracking-[-0.03em]", human && "text-accent")}>{value}</p>
    </div>
  );
}

export function SummaryTilesSkeleton() {
  return (
    <div aria-busy className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="min-h-[124px] rounded-card bg-surface" />
      ))}
      <div className="col-span-2 h-24 rounded-card bg-surface min-[900px]:col-span-1 min-[900px]:col-start-4 min-[900px]:row-span-2 min-[900px]:row-start-1 min-[900px]:h-auto" />
    </div>
  );
}
