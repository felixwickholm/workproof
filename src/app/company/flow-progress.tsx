/** One 4px bar for the whole flow, filled to the current step, with the step in words beside it. */
export function FlowProgress({ step, total }: { step: number; total: number }) {
  const words = `Step ${step} of ${total}`;
  return (
    <div className="flex w-full max-w-[320px] items-center gap-3">
      <span
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={step}
        aria-label={words}
        className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-fill"
      >
        <span
          className="block h-full origin-left rounded-full bg-label transition-transform duration-300 ease-(--ease-out) motion-reduce:transition-none"
          style={{ transform: `scaleX(${step / total})` }}
        />
      </span>
      <span aria-hidden className="text-footnote tnum shrink-0 text-label-2">
        {words}
      </span>
    </div>
  );
}
