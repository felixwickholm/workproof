import { FeedbackQuote } from "@/components/proof";
import { Tag } from "@/components/ui/tag";
import type { PassportEntry } from "@/lib/domain/types";
import { BigButton } from "./gated-action";
import { ownerLine, type PassOwners } from "./pass-face";
import { passState, proofTimeline } from "./pass-state";
import { ProofTimeline } from "./proof-timeline";

/** Fills the quote's byline when the passport does not name the person who wrote the answer. */
export const UNNAMED_REVIEWER = "A reviewer";

/**
 * The pass in front, read beside the stack on a laptop: the latest written answer in the
 * reviewer's own words, the road from sent to met, and the way into the whole proof.
 */
export function PassDetail({
  entry,
  owners,
  reviewerOf,
}: {
  entry: PassportEntry;
  owners: PassOwners;
  /** The reviewer's name for a company's answer, when known. */
  reviewerOf: (companyName: string) => string | undefined;
}) {
  const state = passState(entry);
  const latest = entry.responses[entry.responses.length - 1];
  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2">
        <Tag tone={state.tone} className="h-6 px-2.5 text-caption">
          {state.label}
        </Tag>
        <span className="text-footnote text-label-2">
          {entry.proof.label} · {ownerLine(entry, owners)}
        </span>
      </div>
      <p className="text-title-3 mt-3 font-semibold text-pretty text-label">{entry.challenge.title}</p>

      <div className="mt-5 border-t border-separator pt-5">
        {latest ? (
          <FeedbackQuote
            reviewer={reviewerOf(latest.companyName) ?? UNNAMED_REVIEWER}
            companyName={latest.companyName}
            feedback={latest.feedback}
            decision={latest.decision}
            viaSecondLook={latest.viaSecondLook}
          />
        ) : (
          <p className="text-subhead text-pretty text-label-2">
            {entry.challenge.kind === "taster"
              ? "A practice proof. No company reads it; it shows you what a company would see."
              : "Every decision comes with a written reason. This one has no answer yet."}
          </p>
        )}
      </div>

      <ProofTimeline steps={proofTimeline(entry)} layout="list" className="mt-6 border-t border-separator pt-5" />
      <BigButton href={`/passport/${entry.proof.proofId}`} variant="secondary" className="mt-6 w-full min-[900px]:w-auto min-[900px]:self-start">
        Open this proof
      </BigButton>
    </div>
  );
}
