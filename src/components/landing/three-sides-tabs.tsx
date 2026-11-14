"use client";

import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import { ArrowLink } from "./parts";

export interface Side {
  id: string;
  /** The tab's name: a mode label. */
  label: string;
  line: string;
  points: readonly string[];
  href: string;
  /** The product view for this side, rendered on the server. */
  view: ReactNode;
}

/**
 * Three tabs that switch one large product view. Real tab buttons with arrow-key, Home and End
 * support; every panel is in the HTML, and the views cross-fade in one grid cell.
 */
export function ThreeSidesTabs({ sides }: { sides: readonly Side[] }) {
  const [active, setActive] = useState(0);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const base = useId();

  const choose = (i: number) => {
    setActive(i);
    tabs.current[i]?.focus();
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const last = sides.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    choose(next);
  };

  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-10 min-[1024px]:grid-cols-12">
      <div className="min-w-0 min-[1024px]:col-span-5">
        <div
          role="tablist"
          aria-label="Three sides"
          onKeyDown={onKey}
          className="flex w-full gap-1 rounded-full bg-fill p-1 min-[480px]:inline-flex min-[480px]:w-auto"
        >
          {sides.map((side, i) => (
            <button
              key={side.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${base}-tab-${side.id}`}
              aria-selected={active === i}
              aria-controls={`${base}-panel-${side.id}`}
              tabIndex={active === i ? 0 : -1}
              onClick={() => setActive(i)}
              className={cx(
                "press h-10 flex-auto rounded-full px-2 text-[14px] font-semibold whitespace-nowrap transition-colors duration-200 min-[480px]:px-4 min-[480px]:text-[15px]",
                active === i ? "bg-raised text-label shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-label-2 hover:text-label",
              )}
            >
              {side.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1">
          {sides.map((side, i) => (
            <div key={side.id} className="lp-panel" data-active={active === i} inert={active !== i}>
              <p className="font-serif text-[30px] leading-[34px] tracking-[-0.01em] text-balance text-label min-[640px]:text-[36px] min-[640px]:leading-[40px]">
                {side.line}
              </p>
              <ul className="mt-6 flex flex-col gap-3">
                {side.points.map((point) => (
                  <li key={point} className="flex gap-3 text-[17px] leading-[25px] text-label">
                    <span aria-hidden className="mt-[10px] size-1.5 shrink-0 rounded-full bg-label-3" />
                    {point}
                  </li>
                ))}
              </ul>
              <ArrowLink href={side.href} className="mt-6 text-[17px]">
                Open this view
              </ArrowLink>
            </div>
          ))}
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 min-[1024px]:col-span-7">
        {sides.map((side, i) => (
          <div
            key={side.id}
            role="tabpanel"
            id={`${base}-panel-${side.id}`}
            aria-labelledby={`${base}-tab-${side.id}`}
            // Only the open view sets the height, so a short view leaves no empty band under it.
            className={cx("lp-panel", active !== i && "h-0 overflow-hidden")}
            data-active={active === i}
            inert={active !== i}
          >
            {side.view}
          </div>
        ))}
      </div>
    </div>
  );
}
