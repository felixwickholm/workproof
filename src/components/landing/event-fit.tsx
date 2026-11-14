import { cx } from "@/components/ui/cx";
import { FRAME, HEADING, SECTION, reveal } from "./parts";

/** Where Workprint sits in an event the city already runs: before, at and after the day. */
export const EVENT_PHASES = [
  { when: "Before the event", what: "Companies post a task in one sentence. People answer from anywhere, over days." },
  { when: "At the event", what: "Every meeting starts from the work: 15 minutes, booked the way you book today." },
  { when: "After the event", what: "Both sides confirm they met. The city sees outcomes and answers still owed." },
] as const;

/** Three phases set as one typographic row, no cards, and who runs it. */
export function EventFit() {
  return (
    <section aria-labelledby="fit-title" className={cx(FRAME, SECTION)}>
      <h2 id="fit-title" className={HEADING} {...reveal(0)}>
        Fits the event you already run.
      </h2>
      <ol className="mt-8 grid gap-y-6 min-[768px]:mt-12 min-[768px]:grid-cols-3">
        {EVENT_PHASES.map((phase, i) => (
          <li
            key={phase.when}
            className="border-t border-separator pt-4 min-[768px]:border-t-0 min-[768px]:border-l min-[768px]:px-6 min-[768px]:pt-0 min-[768px]:first:border-l-0 min-[768px]:first:pl-0"
            {...reveal(i + 1)}
          >
            <p className="text-[15px] leading-[22px] font-semibold text-label">{phase.when}</p>
            <p className="mt-2 text-[19px] leading-[27px] text-pretty text-label min-[1024px]:text-[21px] min-[1024px]:leading-[30px]">{phase.what}</p>
          </li>
        ))}
      </ol>
      <p className="mt-8 max-w-[62ch] text-[15px] leading-[22px] text-pretty text-label-2 min-[768px]:mt-10" {...reveal(4)}>
        Run by the event organiser. Works next to the event&apos;s own meeting tool: the meeting list exports as a file.
      </p>
    </section>
  );
}
