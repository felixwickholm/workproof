import { FIGURES } from "@/app/for-judges/evidence";
import { cx } from "@/components/ui/cx";
import { ArrowLink, BAND, FRAME, HEADING, LEAD, reveal } from "./parts";

/**
 * The four promises in plain words, each with the tested number as its evidence line. The
 * numbers come from the project's own measured runs.
 */
export const LANDING_PROMISES = [
  { promise: "No score. No rank.", evidence: `Tested: ${FIGURES.judgingRejected} judging phrases blocked in drafted text.` },
  { promise: "Your work, not your name.", evidence: `Tested: ${FIGURES.plantedReached} planted identity details reached a reviewer.` },
  { promise: "Your voice stays text.", evidence: "Built in: a spoken answer is stored as text only. The voice is not shared." },
  { promise: "A named person decides.", evidence: `Tested: ${FIGURES.automatedDecisions} automated decisions in the audit log. Each decision carries a written reason.` },
] as const;

/** The four promises at display size, each over the line that shows how it is checked. */
export function PeopleDecide() {
  return (
    <section aria-labelledby="decide-title" className="bg-surface">
      <div className={cx(FRAME, BAND)}>
        <div className="grid gap-x-8 gap-y-4 min-[1024px]:grid-cols-12 min-[1024px]:items-end">
          <h2 id="decide-title" className={cx(HEADING, "min-[1024px]:col-span-5")} {...reveal(0)}>
            People decide.
          </h2>
          <p className={cx(LEAD, "text-label min-[1024px]:col-span-7 min-[1024px]:pb-2")} {...reveal(1)}>
            The brief rules out automated decisions about people. So we built the rule into the code and we test it.
          </p>
        </div>
        <ul className="mt-10 grid gap-x-8 gap-y-8 min-[640px]:grid-cols-2 min-[1024px]:mt-14 min-[1024px]:gap-y-12">
          {LANDING_PROMISES.map((p, i) => (
            <li key={p.promise} className="border-t border-separator pt-5" {...reveal((i % 2) + 1)}>
              <p className="font-serif text-[36px] leading-[1.05] tracking-[-0.015em] text-balance text-label min-[640px]:text-[44px] min-[1024px]:text-[52px]">
                {p.promise}
              </p>
              <p className="mt-3 max-w-[44ch] text-[15px] leading-[22px] text-pretty text-label-2 tnum">{p.evidence}</p>
            </li>
          ))}
        </ul>
        <ArrowLink href="/for-judges" className="mt-8 text-[17px] min-[1024px]:mt-12">
          See the evidence
        </ArrowLink>
      </div>
    </section>
  );
}
