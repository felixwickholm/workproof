import type { CSSProperties } from "react";
import { EspooFlowMap } from "@/components/espoo-map";
import { cx } from "@/components/ui/cx";
import { CountsLine } from "./counts-line";
import type { LandingData } from "./data";
import { DISPLAY, FRAME, LEAD } from "./parts";
import { PartnerRow } from "./quiet-line";
import { StartActions } from "./tour-button";

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

/** The three sides and the AI rule, at a glance: who posts, who reads, what the AI may do. */
export const SIDES_AT_A_GLANCE = ["Companies post a real task", "A person reads your work, not your name", "AI drafts the tasks, people decide"] as const;

/** The name with its tagline, then what happens, in one breath. */
export const TAGLINE = "Workprint is hiring that sees the work, not the name.";
export const SUPPORTING = "Do a short real task for an Espoo company. A person reads it without your name and decides, always in writing.";

/** Three short phrases in one row, split by hairlines; on a narrow phone they stack. */
function SidesAtAGlance({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <ul className={cx("grid text-[15px] leading-[21px] text-label min-[480px]:grid-cols-3", className)} style={style}>
      {SIDES_AT_A_GLANCE.map((phrase) => (
        <li
          key={phrase}
          className="py-2 text-pretty max-[479px]:border-t max-[479px]:border-separator max-[479px]:first:border-t-0 max-[479px]:first:pt-0 min-[480px]:border-l min-[480px]:border-separator min-[480px]:px-4 min-[480px]:py-0 min-[480px]:first:border-l-0 min-[480px]:first:pl-0"
        >
          {phrase}
        </li>
      ))}
    </ul>
  );
}

/** Every left-column part sits in columns 1-6 on a laptop; the map holds columns 7-12. */
const LEFT = "min-[1024px]:col-span-6 min-[1024px]:col-start-1";
/** On a phone these parts follow the map, so the first screen reaches the Start button and the map. */
const AFTER_MAP = "max-[1023px]:order-1";

/**
 * The name and what it is, one large Start button for the one-minute walkthrough, two quieter ways
 * in, the partner, and the demo event's outcomes. The live Espoo map shows the same event.
 */
export function Hero({ data }: { data: LandingData }) {
  return (
    <section
      aria-labelledby="hero-title"
      className={cx(FRAME, "grid gap-x-10 pt-5 pb-8 min-[1024px]:grid-cols-12 min-[1024px]:items-start min-[1024px]:pt-8 min-[1024px]:pb-14")}
    >
      <h1 id="hero-title" className={cx(DISPLAY, LEFT)}>
        <span className="lp-line">
          <span className="lp-line-inner" style={{ "--i": 0 } as CSSProperties}>
            Skip the CV.
          </span>
        </span>
        <span className="lp-line">
          <span className="lp-line-inner" style={{ "--i": 1 } as CSSProperties}>
            Do the work.
          </span>
        </span>
      </h1>
      <p className={cx(LEAD, LEFT, "lp-load mt-4 max-w-[37rem] text-label min-[640px]:mt-6")} style={delay(320)}>
        <span className="font-semibold">{TAGLINE}</span> {SUPPORTING}
      </p>
      <SidesAtAGlance className={cx(LEFT, AFTER_MAP, "lp-load mt-8 max-w-[36rem] min-[1024px]:mt-6")} style={delay(380)} />
      <StartActions className={cx(LEFT, "lp-load mt-6 min-[640px]:mt-8")} />

      <div className={cx("lp-load mt-8 min-[1024px]:col-span-6 min-[1024px]:col-start-7 min-[1024px]:row-span-6 min-[1024px]:row-start-1 min-[1024px]:mt-0 min-[1024px]:self-center")} style={delay(200)}>
        <EspooFlowMap variant="hero" live companies={data.map.companies} flows={data.map.flows} className="mx-auto w-full max-w-[640px]" />
      </div>

      <PartnerRow className={cx(LEFT, AFTER_MAP, "lp-load mt-6 min-[640px]:mt-8")} />
      <div className={cx(LEFT, AFTER_MAP, "lp-load mt-6 border-t border-separator pt-4")} style={delay(500)}>
        <p className="text-[13px] leading-[18px] text-label-2">Demo event data · {data.eventName}, so far</p>
        <CountsLine counts={data.counts} className="mt-1 text-[15px] leading-[22px] text-label-2" />
      </div>
    </section>
  );
}
