import { MessagesSquare } from "lucide-react";
import type { ExplainAnswer } from "@/lib/domain/types";
import { BlindText } from "../proof";
import { Card } from "../ui/card";

/** The answer the meeting opens with: the first spoken follow-up if there is one, else the first. */
export function openerAnswer(explain: readonly ExplainAnswer[]): ExplainAnswer | null {
  return explain.find((e) => e.spoken) ?? explain[0] ?? null;
}

/**
 * After an invitation: the talk starts from the person's own words about their own choice, not from a
 * CV. An AI can help write a task answer; it cannot sit in the meeting and defend the choice.
 */
export function MeetingOpener({ explain, className }: { explain: readonly ExplainAnswer[]; className?: string }) {
  const answer = openerAnswer(explain);
  if (!answer) return null;
  return (
    <Card tone="raised" className={className}>
      <h3 className="text-section flex items-center gap-2 text-label">
        <MessagesSquare aria-hidden className="size-4 text-label-2" strokeWidth={1.8} />
        Start the talk here
      </h3>
      <figure className="mt-4">
        <figcaption className="text-footnote text-pretty text-label-2">{answer.question}</figcaption>
        <blockquote className="mt-2 font-serif text-[20px] leading-[28px] text-pretty text-label">
          <BlindText text={`“${answer.answer}”`} />
        </blockquote>
        {answer.spoken ? <p className="text-footnote mt-2 text-label-2">Said aloud, shown as text.</p> : null}
      </figure>
      <p className="text-subhead mt-5 text-pretty font-medium text-label">Ask the person to explain this answer, then to change one thing.</p>
      <p className="text-footnote mt-1.5 text-pretty text-label-2">Their own answer from the work, with personal details removed.</p>
    </Card>
  );
}
