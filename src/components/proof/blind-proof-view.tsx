import { EyeOff } from "lucide-react";
import { REVIEWER_HIDDEN_LINE } from "@/lib/domain/guardrails";
import type { BlindProof, OwnProof } from "@/lib/domain/types";
import { SpokenBadge } from "../voice";
import { cx } from "../ui/cx";
import { ProofKindTag, Tag } from "../ui/tag";
import { AttachmentView, type PictureReport } from "./attachment-view";
import { HumanWorkLine } from "./fixed-lines";
import { clipSkills, hiddenLine } from "./format";
import { TimeAgo } from "./time-ago";
import { BlindText } from "./work-text";

interface Props {
  /** An `OwnProof` (the author's view) shows how many details were hidden; a reviewer's `BlindProof` never does. */
  proof: BlindProof | OwnProof;
  /** "full" is the reading view; "mini" is a compact card for a list. */
  variant?: "full" | "mini";
  /** A target for the guided walkthrough, `data-tour="<id>"`. */
  tour?: string;
  /** Add the fixed "did a person do this?" line under the work. */
  showHumanWorkLine?: boolean;
  /** Whose words the human-work line uses: "your own choices" for the author, "their" for a reviewer. */
  perspective?: "seeker" | "reviewer";
  /** A reviewer's report action for the picture, with the person's own check shown above it. */
  pictureReport?: PictureReport;
  className?: string;
}

/** The author sees the count; every reviewer sees the same fixed sentence, since a count hints at a background. */
function Hidden({ proof }: { proof: BlindProof | OwnProof }) {
  return (
    <p className="text-footnote flex items-center gap-2 text-label-2">
      <EyeOff aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
      {"hiddenCount" in proof ? hiddenLine(proof.hiddenCount) : REVIEWER_HIDDEN_LINE}
    </p>
  );
}

/**
 * A proof as anyone outside the author reads it: the work, never the name. Every removed detail
 * shows as a "hidden" pill and spoken answers say so. The footer counts what was hidden for the author only.
 */
export function BlindProofView({ proof, variant = "full", tour, showHumanWorkLine, perspective = "reviewer", pictureReport, className }: Props) {
  const header = (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
      <h3 className="text-headline font-semibold text-label">{proof.label}</h3>
      <ProofKindTag kind={proof.proofKind} className="h-6 px-2.5 text-caption" />
      <TimeAgo at={proof.submittedAt} className="text-footnote ml-auto text-label-2" />
    </div>
  );

  if (variant === "mini") {
    const { shown, more } = clipSkills(proof.skills);
    return (
      <article data-tour={tour} className={cx("rounded-card bg-surface p-5", className)}>
        {header}
        <BlindText text={proof.work} className="text-subhead mt-3 line-clamp-3 text-label" />
        <div className="mt-3.5 flex flex-wrap gap-1.5">
          {shown.map((s) => (
            <Tag key={s.id} className="h-6 px-2.5 text-caption">
              {s.label}
            </Tag>
          ))}
          {more > 0 ? <Tag className="h-6 px-2.5 text-caption text-label-2">+{more}</Tag> : null}
        </div>
        <div className="mt-4 border-t border-separator pt-3">
          <Hidden proof={proof} />
        </div>
      </article>
    );
  }

  return (
    <article data-tour={tour} className={cx("rounded-card bg-surface p-5 min-[900px]:p-7", className)}>
      {header}
      <p className="text-subhead mt-1 text-pretty text-label-2">{proof.challengeTitle}</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {proof.skills.map((s) => (
          <Tag key={s.id} className="h-6 px-2.5 text-caption">
            {s.label}
          </Tag>
        ))}
      </div>

      {proof.glance ? (
        <div className="mt-6">
          <p className="text-section text-label">At a glance</p>
          <p className="text-subhead mt-1 text-pretty text-label-2">{proof.glance}</p>
        </div>
      ) : null}

      {proof.attachment ? <AttachmentView attachment={proof.attachment} report={pictureReport} className="mt-6" /> : null}

      <div className="mt-6">
        {proof.spoken ? <SpokenBadge className="mb-3" /> : null}
        <BlindText text={proof.work} className="text-body text-label" />
      </div>

      {proof.explain.length > 0 ? (
        <section aria-label="Follow-up questions" className="mt-7 border-t border-separator pt-5">
          <h4 className="text-section text-label">Follow-up answers</h4>
          <ol className="mt-3 flex flex-col gap-4">
            {proof.explain.map((e, i) => (
              <li key={i}>
                <p className="text-footnote text-pretty text-label-2">{e.question}</p>
                {/* The badge sits on the answer that was spoken, on its own line, so it never crowds a heading. */}
                {e.spoken ? <SpokenBadge className="mt-2 h-6" /> : null}
                <BlindText text={e.answer} className="text-body mt-1 text-label" />
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      <footer className="mt-7 flex flex-col gap-1.5 border-t border-separator pt-4">
        <Hidden proof={proof} />
        {showHumanWorkLine ? <HumanWorkLine perspective={perspective} /> : null}
      </footer>
    </article>
  );
}
