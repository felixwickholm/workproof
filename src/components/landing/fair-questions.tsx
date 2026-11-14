import { cx } from "@/components/ui/cx";
import { BAND, FRAME, HEADING, LEAD, reveal } from "./parts";

/** The questions a city official asks first, each answered with what the product does today and what it does not. */
export const FAIR_QUESTIONS = [
  {
    question: "Will people do unpaid tasks?",
    answer:
      "A task takes 20 minutes, and the app refuses a task longer than 30. One proof can reach several employers: through a task they share, or through Second look if the person allows it. Every decision comes with a written reason. The city should set the rule that tasks stay short and are never real client work.",
  },
  {
    question: "Will companies read and answer?",
    answer:
      "Nothing forces an answer. The city sees, per employer, how many answers are still owed, and an organiser can make answering a condition for a table at the next event. After 48 hours without an answer, the proof can go to another employer, if the person allowed it.",
  },
  {
    question: "What about professionals new to Finnish, or with a degree from abroad?",
    answer:
      "The reviewer reads the work, not the CV, so a degree nobody here knows filters no one out. Schools and employers are hidden before review. Each task page says the work language and whether Finnish is needed. A spoken answer works too, and the reviewer reads it as text.",
  },
  {
    question: "Can AI do the task?",
    answer:
      "AI is allowed, and the task says so. The task asks for judgement, the two follow-up answers are about the person's own choices, and the meeting starts from the work. The product cannot prove who typed the answer.",
  },
  {
    question: "How does it fit our event tools?",
    answer:
      "It runs in the days before the event. An invitation ends in the same 15-minute meeting you book today. The city page exports the meeting list as a file for your meeting tool, with a name only where the person accepted.",
  },
] as const;

/** Five honest answers set as a compact two-column list on a laptop, just above the close. Plain HTML, no JavaScript. */
export function FairQuestions() {
  return (
    <section aria-labelledby="questions-title" className="bg-surface">
      <div className={cx(FRAME, BAND)}>
        <div className="grid gap-x-8 gap-y-4 min-[1024px]:grid-cols-12 min-[1024px]:items-end">
          <h2 id="questions-title" className={cx(HEADING, "min-[1024px]:col-span-5")} {...reveal(0)}>
            Fair questions.
          </h2>
          <p className={cx(LEAD, "text-label-2 min-[1024px]:col-span-7 min-[1024px]:pb-2")} {...reveal(1)}>
            What a city asks before it runs an event on this, answered with what is built today.
          </p>
        </div>
        <dl className="mt-8 grid gap-x-12 min-[1024px]:mt-12 min-[1024px]:grid-cols-2">
          {FAIR_QUESTIONS.map(({ question, answer }, i) => (
            <div key={question} className="border-t border-separator py-5 min-[1024px]:py-6" {...reveal((i % 2) + 1)}>
              <dt className="text-[18px] leading-[25px] font-semibold tracking-[-0.01em] text-pretty text-label min-[640px]:text-[20px] min-[640px]:leading-[27px]">
                {question}
              </dt>
              <dd className="mt-2 text-[16px] leading-[24px] text-pretty text-label-2">{answer}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
