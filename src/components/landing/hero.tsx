import Link from "next/link";
import type { CSSProperties } from "react";
import { cx } from "@/components/ui/cx";
import { FOOT_LINE, HEADLINE, SUB_LINE } from "./copy";
import type { LandingData } from "./data";
import { Doors } from "./doors";
import { FRAME } from "./parts";
import { ForEspoo } from "./quiet-line";
import { StartActions } from "./tour-button";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** The headline's two sentences, each on its own line on every screen. */
const [FIRST, SECOND] = HEADLINE.split(/(?<=\.)\s/) as [string, string];

/**
 * The front door, one screen tall: one sentence, one sub-line, the three doors, the tour and a
 * quiet line about who it is for. Nothing else stands before the doors.
 */
export function Hero({ data }: { data: LandingData }) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cx(FRAME, "flex flex-col pt-2 pb-6 min-[768px]:min-h-[calc(100svh-76px)] min-[768px]:pt-6 min-[1100px]:pt-8")}
    >
      <h1
        id="hero-title"
        className="font-serif text-[38px] leading-[1.02] tracking-[-0.02em] text-label min-[360px]:text-[42px] min-[640px]:text-[64px] min-[1100px]:text-[88px] min-[1100px]:leading-[0.98]"
      >
        <span className="lp-line">
          <span className="lp-line-inner" style={{ "--i": 0 } as CSSProperties}>
            {FIRST}
          </span>
        </span>
        <span className="lp-line">
          <span className="lp-line-inner" style={{ "--i": 1 } as CSSProperties}>
            {SECOND}
          </span>
        </span>
      </h1>
      <p className="lp-load mt-3 max-w-[34rem] text-[20px] leading-[28px] text-pretty text-label-2 min-[640px]:mt-5 min-[640px]:text-[22px] min-[640px]:leading-[31px]" style={delay(300)}>
        {SUB_LINE}
      </p>

      <Doors data={data} className="lp-load mt-6 min-[640px]:mt-9 min-[1100px]:mt-10" />

      <StartActions className="lp-load mt-5 mb-6 min-[640px]:mt-7" />

      <div
        className="lp-load flex flex-col gap-3 border-t border-separator pt-4 min-[768px]:mt-auto min-[640px]:flex-row min-[640px]:items-center min-[640px]:justify-between min-[640px]:gap-6"
        style={delay(560)}
      >
        <p className="max-w-[44rem] text-[15px] leading-[21px] text-pretty text-label-2">{FOOT_LINE}</p>
        <div className="flex items-center justify-between gap-4 min-[640px]:hidden">
          <ForEspoo />
          <Link href="/for-judges" className="inline-flex min-h-11 items-center text-[15px] font-medium text-label underline underline-offset-4">
            Evidence for judges
          </Link>
        </div>
      </div>
    </section>
  );
}
