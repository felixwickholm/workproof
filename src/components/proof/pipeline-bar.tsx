import { cx } from "../ui/cx";

/**
 * Where the work stands, step by step: five labelled counts on one thin track. Equal steps, not a
 * funnel: the shape never suggests that fewer people further on is a loss to optimise.
 */
export function PipelineBar({ stages, className }: { stages: { stage: string; count: number }[]; className?: string }) {
  return (
    <ol className={cx("relative grid", className)} style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
      {/* The track runs from the first dot's centre to the last one's. */}
      <span aria-hidden className="absolute top-[5px] h-px bg-separator" style={{ left: `${50 / stages.length}%`, right: `${50 / stages.length}%` }} />
      {stages.map(({ stage, count }) => (
        <li key={stage} className="relative flex min-w-0 flex-col items-center text-center">
          <span aria-hidden className={cx("size-[11px] rounded-full", count > 0 ? "bg-label" : "bg-ground shadow-[inset_0_0_0_1.5px_var(--color-control)]")} />
          <span className="text-kpi mt-3 text-label">{count}</span>
          <span className="text-footnote mt-0.5 w-full truncate text-label-2">{stage}</span>
        </li>
      ))}
    </ol>
  );
}
