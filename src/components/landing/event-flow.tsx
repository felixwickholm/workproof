import { cx } from "@/components/ui/cx";
import { EVENT_STEPS } from "./copy";
import { FRAME, HEADING, SECTION, reveal } from "./parts";

/** The event in five numbered steps: one row on a laptop, a list on a phone. */
export function EventFlow({ className }: { className?: string }) {
  return (
    <section aria-labelledby="flow-title" className={cx(FRAME, SECTION, className)}>
      <h2 id="flow-title" className={HEADING} {...reveal(0)}>
        How an event works.
      </h2>
      <ol className="mt-8 grid gap-y-5 min-[768px]:grid-cols-5 min-[768px]:gap-x-6 min-[1024px]:mt-12">
        {EVENT_STEPS.map((step, i) => (
          <li key={step} className="flex gap-4 border-t border-separator pt-4 min-[768px]:flex-col min-[768px]:gap-2" {...reveal(i + 1)}>
            <span aria-hidden className="w-8 shrink-0 font-serif text-[40px] leading-[40px] text-label-3 tnum min-[768px]:text-[56px] min-[768px]:leading-[56px]">
              {i + 1}
            </span>
            <span className="text-[19px] leading-[27px] text-pretty text-label min-[1024px]:text-[21px] min-[1024px]:leading-[29px]">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
