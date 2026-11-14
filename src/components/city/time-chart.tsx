import { cx } from "../ui/cx";
import { plural } from "../words";
import { BarChart } from "./bars";
import { ChartTip } from "./chart-tip";
import { dayLabel, lengthOf, type CompanyTimeline } from "./charts";

interface Props {
  /** Work handed in per day, zero-filled, the event day last. */
  days: { day: string; proofs: number }[];
  eventDay: string;
  companies: CompanyTimeline[];
}

/** Plot height of the work columns, in px. The axis labels sit below it, outside the plot. */
const PLOT = 112;

/**
 * Challenges and work over time on one day axis. Above: work handed in per day, as columns. Below, one
 * row per company on the same days: a dot on each day it published a challenge, and the work its
 * challenges got at the end of the row. "Before" holds challenges published before the first day.
 * Two measures, two plots, one shared axis: never two scales on one plot.
 */
export function TimeChart({ days, eventDay, companies }: Props) {
  const max = Math.max(0, ...days.map((d) => d.proofs));
  const peak = days.reduce((best, d, i) => (d.proofs > (days[best]?.proofs ?? -1) ? i : best), 0);
  const cols = `var(--name) var(--before) repeat(${days.length}, minmax(0,1fr)) 2.75rem`;
  const hasEarlier = companies.some((c) => c.earlier > 0);

  return (
    <div className="@container">
      <div className="[--before:2.75rem] [--name:0px] @min-[520px]:[--before:3rem] @min-[520px]:[--name:9rem]">
      <BarChart label="Work handed in per day">
        {(grown) => (
          <div className="grid items-end gap-x-1 @min-[520px]:gap-x-2" style={{ gridTemplateColumns: cols }}>
            <span className="text-caption col-span-full self-start text-label-2 @min-[520px]:col-span-1">Work per day</span>
            <span className="@min-[520px]:hidden" />
            <span />
            {days.map((d, i) => {
              const labelled = i === peak || i === days.length - 1;
              return (
                <ChartTip
                  key={d.day}
                  value={plural(d.proofs, "piece of work", "pieces of work")}
                  label={dayLabel(d.day, eventDay)}
                  align={i < 2 ? "start" : i > days.length - 3 ? "end" : "center"}
                  className="flex flex-col items-center justify-end"
                  style={{ height: PLOT + 20 }}
                >
                  <span className={cx("tnum text-caption mb-1 text-label", !labelled && "invisible")}>{d.proofs}</span>
                  <span
                    aria-hidden
                    className="block w-full max-w-6 origin-bottom rounded-t-[4px] bg-accent transition-transform duration-500 ease-out motion-reduce:transition-none"
                    style={{
                      height: Math.max(2, lengthOf(d.proofs, max) * PLOT),
                      transform: grown ? "scaleY(1)" : "scaleY(0)",
                      transitionDelay: `${i * 40}ms`,
                    }}
                  />
                </ChartTip>
              );
            })}
            <span />
          </div>
        )}
      </BarChart>

      <div className="grid gap-x-1 hairline-t pt-1.5 @min-[520px]:gap-x-2" style={{ gridTemplateColumns: cols }}>
        <span />
        <span className={cx("text-caption text-center text-label-2", !hasEarlier && "invisible")}>Before</span>
        {days.map((d) => (
          <span key={d.day} className={cx("text-caption tnum truncate text-center", d.day === eventDay ? "font-semibold text-label" : "text-label-2")}>
            {Number(d.day.slice(8))}
          </span>
        ))}
        <span className="text-caption text-right text-label-2">Work</span>
      </div>

      <p className="text-caption mt-5 mb-1 text-label-2">Challenges published, per company</p>
      <ul aria-label="Challenges published per company, by day">
        {companies.map((c) => (
          <li key={c.companyId} className="grid items-center gap-x-1 py-1 @min-[520px]:gap-x-2" style={{ gridTemplateColumns: cols }}>
            <span className="text-subhead col-span-full truncate text-label @min-[520px]:col-span-1" title={c.name}>
              {c.name}
            </span>
            <span className="@min-[520px]:hidden" />
            <Dot count={c.earlier} what={`${c.name}, earlier`} />
            {c.perDay.map((n, i) => (
              <Dot key={days[i]?.day ?? i} count={n} what={`${c.name}, ${dayLabel(days[i]?.day ?? "", eventDay)}`} />
            ))}
            <span className="tnum text-subhead text-right font-semibold text-label">{c.took}</span>
          </li>
        ))}
      </ul>

      <table className="sr-only">
        <caption>Work handed in per day</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <th scope="row">{dayLabel(d.day, eventDay)}</th>
              <td>{d.proofs}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

/** A published challenge on a day: an 8px dot with a surface ring, and the count when it is more than one. */
function Dot({ count, what }: { count: number; what: string }) {
  if (count === 0) return <span aria-hidden className="mx-auto block size-1 rounded-full bg-label/15" />;
  return (
    <ChartTip value={plural(count, "challenge")} label={what} className="mx-auto flex h-6 items-center justify-center px-1">
      <span aria-hidden className="flex items-center gap-1">
        <span className="block size-2.5 rounded-full bg-accent shadow-[0_0_0_2px_var(--color-surface)]" />
        {count > 1 ? <span className="tnum text-caption text-label">{count}</span> : null}
      </span>
    </ChartTip>
  );
}
