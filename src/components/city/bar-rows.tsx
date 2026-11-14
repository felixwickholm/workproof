import type { ReactNode } from "react";
import { cx } from "../ui/cx";
import { BarChart } from "./bars";
import { ChartTip } from "./chart-tip";

/** One horizontal row: words on the left, one or more bar segments, the value at the bar's tip. */
export interface BarRow {
  key: string;
  label: string;
  /** A quieter line under the label, for example "about 2 in 3 of the step before". */
  note?: string | null;
  /** Segments from the baseline outwards, each with its length (0 to 1 of the track) and its fill. */
  segments: { share: number; tone: string; tip: { value: string; label: string } }[];
  /** The number at the tip, in ink. Carries `data-total` when given, so a test reads the figure it means. */
  value: ReactNode;
  total?: string;
  /** Set apart from the rows above, for a step that is reported late or not at all. */
  apart?: boolean;
}

/** Room kept at the end of the track for the value at the tip of the longest bar. */
const VALUE_ROOM = "4rem";

/**
 * Horizontal bars with the value at each tip. Thin marks (16px), a 4px rounded data end, square at the
 * baseline, and a 2px surface gap between stacked segments. The track stops short of the card's edge so
 * the longest bar keeps room for its number. Bars grow once, the first time they show.
 */
export function BarRows({ rows, label }: { rows: BarRow[]; label: string }) {
  return (
    <BarChart label={label} className="@container">
      {(grown) => (
        <ol className="flex flex-col">
          {rows.map((row, i) => (
            <li
              key={row.key}
              className={cx(
                "grid grid-cols-1 gap-x-4 gap-y-1 py-1.5 @min-[480px]:grid-cols-[10.5rem_minmax(0,1fr)] @min-[480px]:items-center",
                row.apart && "mt-2 hairline-t pt-3.5",
              )}
            >
              <span className="flex min-w-0 flex-col">
                <span className={cx("text-subhead truncate", row.apart ? "text-label-2" : "text-label")} title={row.label}>
                  {row.label}
                </span>
                {row.note ? <span className="text-caption truncate text-label-2">{row.note}</span> : null}
              </span>
              <span className="flex h-6 min-w-0 items-center">
                {row.segments.map((s, j) => (
                  <ChartTip
                    key={j}
                    value={s.tip.value}
                    label={s.tip.label}
                    align="start"
                    className={cx("flex h-full shrink-0 items-center", j < row.segments.length - 1 && "mr-0.5")}
                    style={{ width: `calc((100% - ${VALUE_ROOM}) * ${s.share})`, minWidth: 6 }}
                  >
                    <span
                      aria-hidden
                      className={cx(
                        "block h-4 w-full origin-left transition-transform duration-500 ease-out motion-reduce:transition-none",
                        j === row.segments.length - 1 && "rounded-r-[4px]",
                        s.tone,
                      )}
                      style={{ transform: grown ? "scaleX(1)" : "scaleX(0)", transitionDelay: `${i * 40}ms` }}
                    />
                  </ChartTip>
                ))}
                <span data-total={row.total} className="tnum text-subhead ml-2.5 shrink-0 font-semibold text-label">
                  {row.value}
                </span>
              </span>
            </li>
          ))}
        </ol>
      )}
    </BarChart>
  );
}
