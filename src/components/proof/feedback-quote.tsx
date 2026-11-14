import type { DecisionKind } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { decisionWords } from "./format";
import { TimeAgo } from "./time-ago";

interface Props {
  reviewer: string;
  companyName: string;
  feedback: string;
  decision: DecisionKind;
  /** The company read the proof because the person allowed a second employer to see it. */
  viaSecondLook?: boolean;
  /** When the answer was written (ISO time). */
  at?: string;
  className?: string;
}

/**
 * A reviewer's own words to the person, set as a quotation, then who wrote it and what they
 * decided. "Not now" is said plainly and never in red: it comes with a reason, which is the point.
 */
export function FeedbackQuote({ reviewer, companyName, feedback, decision, viaSecondLook, at, className }: Props) {
  return (
    <figure className={className}>
      <blockquote className="font-serif text-[20px] leading-[28px] text-pretty text-label">&ldquo;{feedback}&rdquo;</blockquote>
      <figcaption className="mt-3">
        <span className="text-subhead block font-medium text-label">
          {reviewer}, {companyName}
        </span>
        <span className="text-footnote mt-0.5 block text-label-2">
          <span className={cx(decision === "meet" && "font-medium text-accent")}>{decisionWords(decision)}</span>
          {viaSecondLook ? " · shared by another company" : null}
          {at ? (
            <>
              {" · "}
              <TimeAgo at={at} />
            </>
          ) : null}
        </span>
      </figcaption>
    </figure>
  );
}
