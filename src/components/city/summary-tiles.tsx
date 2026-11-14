import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { CityOverview } from "@/lib/domain/types";
import { formatHours } from "./format";

type Totals = CityOverview["totals"];

const tiles: { key: "challenges" | "proofs" | "meetingsInvited" | "secondLookMeetings" | "feedbackOwed"; label: string }[] = [
  { key: "challenges", label: "Tasks live" },
  { key: "proofs", label: "Proofs sent" },
  { key: "meetingsInvited", label: "People invited to meet" },
  { key: "secondLookMeetings", label: "Second look meetings" },
  { key: "feedbackOwed", label: "Feedback owed" },
];

/**
 * The city's question first: did people get an answer, how fast, and did meetings happen.
 * Then the one picture of who decides: people, never automation. Then the other numbers.
 */
export function SummaryTiles({ totals, feedbackOwed }: { totals: Totals; feedbackOwed: number }) {
  const values = { ...totals, feedbackOwed };
  return (
    <div className="flex flex-col gap-3">
      <section aria-label="Answers for people" className="grid grid-cols-1 gap-3 min-[600px]:grid-cols-3">
        <Tile
          label="People who got an answer"
          value={
            <>
              {totals.proofsAnswered}
              <span className="text-title-3 font-semibold text-label-2"> of {totals.proofs} proofs</span>
            </>
          }
        />
        <Tile label="Median reply time" value={formatHours(totals.medianHoursToFirstAnswer)} />
        <Tile label="Meetings confirmed by both sides" value={totals.meetingsConfirmedByBoth} />
      </section>
      <section aria-label="Decisions at the event" className="grid grid-cols-2 overflow-hidden rounded-card bg-surface">
        <Hero label="Human decisions" value={totals.humanDecisions} accent />
        <div className="shadow-[inset_0.5px_0_0_var(--color-separator)]">
          <Hero label="Automated decisions" value={totals.automatedDecisions}>
            <p className="text-subhead mt-2 flex items-start gap-1.5 text-label text-pretty">
              <Check aria-hidden className="mt-0.5 size-[18px] shrink-0 text-accent" strokeWidth={2.6} />
              Every decision has a named person.
            </p>
          </Hero>
        </div>
      </section>
      <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3">
        {tiles.map(({ key, label }) => (
          <Tile key={key} label={label} value={values[key]} />
        ))}
      </div>
    </div>
  );
}

function Hero({ label, value, accent, children }: { label: string; value: number; accent?: boolean; children?: ReactNode }) {
  return (
    <div data-total={label} className="h-full px-5 pt-5 pb-5 min-[900px]:px-7 min-[900px]:py-7">
      <p data-value className={`tnum text-[64px] leading-none font-semibold tracking-[-0.04em] min-[900px]:text-[96px] ${accent ? "text-accent" : "text-label"}`}>
        {value}
      </p>
      <p className="text-headline mt-3 font-semibold text-pretty">{label}</p>
      {children}
    </div>
  );
}

function Tile({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div data-total={label} className="flex flex-col gap-2 rounded-card bg-surface p-4">
      <p data-value className="tnum text-[32px] leading-none font-semibold tracking-[-0.03em]">
        {value}
      </p>
      <p className="text-subhead font-medium text-label-2 text-pretty">{label}</p>
    </div>
  );
}

export function SummaryTilesSkeleton() {
  return (
    <div aria-busy className="flex flex-col gap-3">
      <div className="h-[176px] rounded-card bg-surface min-[900px]:h-[220px]" />
      <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-3">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="min-h-[96px] rounded-card bg-surface" />
        ))}
      </div>
    </div>
  );
}
