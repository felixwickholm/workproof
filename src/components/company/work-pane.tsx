"use client";

import { EyeOff } from "lucide-react";
import { Fragment, useState, type ReactNode } from "react";
import { REVIEWER_HIDDEN_LINE } from "@/lib/domain/guardrails";
import type { BlindProof, Challenge, RelatedPart } from "@/lib/domain/types";
import { TimeAgo } from "../proof";
import { AttachmentView, type PictureReport } from "../proof/attachment-view";
import { HIDDEN_TOKEN } from "../proof/mark-hidden";
import { cx } from "../ui/cx";
import { workLabel } from "../words";
import { markQuotes } from "./quote-marks";

/** The reading size for the work itself: 18/30 from 900px, 17/28 on a phone. */
const READ = "text-[17px] leading-[28px] min-[900px]:text-[18px] min-[900px]:leading-[30px]";

/** Said once, above the toggle, so nobody reads the marks as a judgement. */
const RELATED_LINE = "Software marked where each skill shows up. It gives no score.";

interface Props {
  proof: BlindProof;
  challenge: Challenge | null;
  /** Sentences per skill, found by cue words. Null while they load or when the route fails. */
  related: RelatedPart[] | null;
  pictureReport?: PictureReport;
}

/**
 * The work as the reviewer reads it, without the name: the choice for a Choose challenge, the answer,
 * what the person said while working, and their two follow-up answers. Every removed detail shows as
 * a "hidden" bar. A toggle underlines the sentences software linked to one skill.
 */
export function WorkPane({ proof, challenge, related, pictureReport }: Props) {
  const [skillId, setSkillId] = useState<string | null>(null);
  const quotes = related?.find((r) => r.skillId === skillId)?.quotes ?? [];
  const picked = proof.choice ? challenge?.options?.find((o) => o.id === proof.choice) : undefined;

  return (
    <article className="flex min-w-0 flex-col gap-12 min-[900px]:gap-14">
      <header>
        <div className="flex items-baseline gap-4">
          <h2 className="text-h2 text-label">{workLabel(proof.label)}</h2>
          <TimeAgo at={proof.submittedAt} className="text-body text-label-2" />
        </div>
        <p className="text-body mt-3 flex items-start gap-2.5 text-pretty text-label-2">
          <EyeOff aria-hidden className="mt-[5px] size-4 shrink-0" strokeWidth={1.75} />
          {REVIEWER_HIDDEN_LINE}
        </p>
      </header>

      {related && related.some((r) => r.quotes.length > 0) ? (
        <div className="-mt-4 min-[900px]:-mt-6">
          <p className="text-subhead text-pretty text-label-2">{RELATED_LINE}</p>
          <div role="group" aria-label="Underline the sentences for one skill" className="mt-3 flex flex-wrap gap-2">
            <ToggleChip on={skillId === null} onClick={() => setSkillId(null)}>
              Off
            </ToggleChip>
            {related
              .filter((r) => r.quotes.length > 0)
              .map((r) => (
                <ToggleChip key={r.skillId} on={skillId === r.skillId} onClick={() => setSkillId(r.skillId)}>
                  {r.label}
                </ToggleChip>
              ))}
          </div>
        </div>
      ) : null}

      {picked ? (
        <Part title="Their choice">
          <p className={cx(READ, "font-medium text-label")}>
            {picked.id.toUpperCase()}: {picked.title}
          </p>
        </Part>
      ) : null}

      <Part title="The answer">
        <MarkedText text={proof.work} quotes={quotes} />
        {proof.attachment ? <AttachmentView attachment={proof.attachment} report={pictureReport} className="mt-6" /> : null}
      </Part>

      {proof.thinkAloud ? (
        <Part title="What they said while working" note={`${Math.max(1, Math.round(proof.thinkAloud.seconds / 60))} min, shown as text.`}>
          {proof.thinkAloud.screen ? <AttachmentView attachment={proof.thinkAloud.screen} className="mb-6" /> : null}
          {/* Spoken words, set apart from the written answer in a calm block. */}
          <blockquote className="rounded-card bg-surface px-6 py-5 min-[900px]:px-8 min-[900px]:py-7">
            <MarkedText text={proof.thinkAloud.transcript} quotes={quotes} />
          </blockquote>
        </Part>
      ) : null}

      {proof.explain.length > 0 ? (
        <Part title="Their answers to the follow-up questions">
          <dl className="flex flex-col gap-8">
            {proof.explain.map((e) => (
              <div key={e.question}>
                <dt className="text-[17px] leading-[26px] font-semibold text-pretty text-label">{e.question}</dt>
                <dd className="mt-2">
                  <MarkedText text={e.answer} quotes={quotes} />
                </dd>
              </div>
            ))}
          </dl>
        </Part>
      ) : null}
    </article>
  );
}

function Part({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="text-h3 text-label">{title}</h3>
      {note ? <p className="text-subhead mt-1 text-label-2">{note}</p> : null}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ToggleChip({ on, onClick, children }: { on: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={cx(
        "press text-footnote min-h-11 rounded-full px-4 font-medium transition-colors duration-150",
        on ? "bg-label text-ground" : "bg-fill text-label hover:bg-label/10",
      )}
    >
      {children}
    </button>
  );
}

/** Text with the blind layer's hidden details as quiet bars, and the chosen skill's sentences underlined. */
function MarkedText({ text, quotes }: { text: string; quotes: readonly string[] }) {
  return (
    <p className={cx(READ, "whitespace-pre-wrap text-pretty text-label")}>
      {markQuotes(text, quotes).map((run, i) => (
        <span key={i} className={cx(run.marked && "underline decoration-label-2 decoration-2 underline-offset-[5px]")}>
          {run.text.split(HIDDEN_TOKEN).map((piece, j) => (
            <Fragment key={j}>
              {j > 0 ? (
                <span className="hidden-token">
                  <EyeOff aria-hidden className="size-3" strokeWidth={1.75} />
                  hidden
                </span>
              ) : null}
              {piece}
            </Fragment>
          ))}
        </span>
      ))}
    </p>
  );
}
