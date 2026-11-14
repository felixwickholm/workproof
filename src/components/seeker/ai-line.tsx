import { cx } from "@/components/ui/cx";

/** The honest answer to "can AI do the task?", said where a person decides to start and where they send. */
const AI_ALLOWED_LINE = "AI is allowed. The two follow-up questions are about your own choices, and the meeting starts from this work.";

export function AiAllowedLine({ className }: { className?: string }) {
  return <p className={cx("text-footnote text-pretty text-label", className)}>{AI_ALLOWED_LINE}</p>;
}
