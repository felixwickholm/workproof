import { EspooFlowMap } from "@/components/espoo-map";
import { cx } from "@/components/ui/cx";
import { CountTo } from "./count-to";
import { countParts } from "./counts";
import type { LandingData } from "./data";
import { FRAME, HEADING, SECTION, reveal } from "./parts";

/** The demo event on the Espoo map, with its four headline numbers, plainly marked as demo data. */
export function MapSection({ data }: { data: LandingData }) {
  return (
    <section aria-labelledby="map-title" className={cx(FRAME, SECTION, "grid items-center gap-x-10 gap-y-8 min-[1024px]:grid-cols-12")}>
      <div className="min-[1024px]:col-span-5">
        <h2 id="map-title" className={HEADING} {...reveal(0)}>
          One event in Espoo.
        </h2>
        <p className="mt-4 text-[17px] leading-[26px] text-label-2" {...reveal(1)}>
          <span className="mr-2 inline-flex h-7 items-center rounded-full bg-fill px-3 text-[14px] font-medium text-label">Demo data</span>
          {data.eventName}, so far.
        </p>
        <dl className="mt-8 grid grid-cols-2 gap-x-6 gap-y-6" {...reveal(2)}>
          {countParts(data.counts).map((part) => (
            <div key={part.noun} className="flex flex-col border-t border-separator pt-3">
              <dt className="text-[15px] leading-[21px] text-label-2">{part.noun}</dt>
              <dd className="order-first text-[44px] leading-[48px] tracking-[-0.02em] text-label tnum min-[640px]:text-[56px] min-[640px]:leading-[60px]">
                <CountTo value={part.value} />
              </dd>
            </div>
          ))}
        </dl>
      </div>
      <div className="min-[1024px]:col-span-7" {...reveal(1)}>
        <EspooFlowMap variant="hero" live companies={data.map.companies} flows={data.map.flows} className="mx-auto w-full max-w-[680px]" />
      </div>
    </section>
  );
}
