import { Clock, Info } from "lucide-react";
import { useId, type ReactNode } from "react";
import { designerLine } from "@/components/company/ai-designer";
import { answerWindowRule } from "@/components/company/employer-format";
import { InlineEdit } from "@/components/company/inline-edit";
import { LockedButton } from "@/components/controls/locked-button";
import { PlacesStepper } from "@/components/company/places-stepper";
import { MinutesSelect, ProofKindSelect } from "@/components/company/proof-kind-picker";
import { withoutSkill } from "@/components/company/wish-list";
import { WishSort } from "@/components/company/wish-sort";
import { TaskMaterialView } from "@/components/proof";
import { Card } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { Field } from "@/components/ui/field";
import { AiTag } from "@/components/ui/tag";
import type { ChallengeDraft } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

/** The API's limit for one review guide line. */
const LOOK_FOR_MAX = 400;

interface Props {
  draft: ChallengeDraft;
  onDraft: (draft: ChallengeDraft) => void;
  companyName: string;
  /** Why the built-in designer wrote this draft, when a live model is configured. */
  fallback: string | null;
  sortPlays: boolean;
  onSorted: () => void;
  approvedBy: string;
  onApprovedBy: (name: string) => void;
  /** The event's answer window, when the server sends it. */
  windowHours: number | null;
  busy: boolean;
  errorLine: ReactNode;
  onPublish: () => void;
}

/** What still stands between the draft and publishing, in words, or null when it can go live. */
export function publishWaitsFor(draft: ChallengeDraft, approvedBy: string): string | null {
  if (draft.title.trim().length < 3) return "Give the task a title.";
  if (draft.brief.trim().length < 10) return "Describe the situation in a sentence or two.";
  if (approvedBy.trim().length === 0) return "Add your name to approve it.";
  return null;
}

/**
 * Step 2: the wish sort, then the AI draft as one document a person edits in place: title, kind,
 * minutes, situation, what to hand in and what the reviewer looks for. A named person approves it
 * and accepts the answer window before anyone sees it.
 */
export function DraftStep(props: Props) {
  const { draft, onDraft, companyName, fallback, sortPlays, onSorted, approvedBy, onApprovedBy, windowHours, busy, errorLine, onPublish } = props;
  const removeSkill = (id: string) => onDraft(withoutSkill(draft, id));
  const editGuide = (skillId: string, lookFor: string) => onDraft({ ...draft, reviewGuide: draft.reviewGuide.map((g) => (g.skillId === skillId ? { ...g, lookFor } : g)) });
  const skillLabel = (id: string) => draft.coreSkills.find((s) => s.id === id)?.label ?? id;
  const waitingFor = publishWaitsFor(draft, approvedBy);

  return (
    <>
      <div className="rise mb-6 flex flex-wrap items-center gap-x-3 gap-y-1.5 min-[900px]:mb-8">
        <AiTag />
        <p className="text-footnote text-label-2">{designerLine(draft.draftedBy)}. Nothing goes live until you approve it.</p>
        {fallback ? <p className="text-footnote basis-full text-label-2">{fallback}</p> : null}
      </div>

      <div className="min-[1000px]:grid min-[1000px]:grid-cols-12 min-[1000px]:items-start min-[1000px]:gap-4">
        <div className="flex flex-col gap-4 min-[1000px]:sticky min-[1000px]:top-8 min-[1000px]:col-span-5">
          <Card>
            <WishSort draft={draft} play={sortPlays} onPlayed={onSorted} onRemove={removeSkill} />
          </Card>
          <blockquote className="px-5">
            <p className="text-subhead text-pretty text-label">&ldquo;{draft.yourWords ?? draft.need}&rdquo;</p>
            <p className="text-footnote mt-1.5 text-label-2">In your words. Only your company sees this.</p>
          </blockquote>
        </div>

        <div className="mt-4 flex flex-col gap-4 min-[1000px]:col-span-7 min-[1000px]:mt-0">
          {draft.note ? (
            <p role="note" className="text-subhead flex gap-2.5 rounded-card bg-surface px-5 py-4 text-pretty text-label">
              <Info aria-hidden className="mt-0.5 size-[18px] shrink-0 text-label-2" strokeWidth={1.8} />
              {draft.note}
            </p>
          ) : null}

          <Card tone="raised" className="p-0">
            <article aria-label="The task, as talent will see it" className="p-5 min-[900px]:p-7">
              <p className="text-footnote text-pretty text-label-2">
                Posting for <span className="font-medium text-label">{companyName || "your company"}</span>
                {approvedBy.trim() ? (
                  <>
                    {" · "}approved by <span className="font-medium text-label">{approvedBy.trim()}</span>
                  </>
                ) : null}
              </p>
              <div className="mt-2">
                <InlineEdit
                  label="Title"
                  value={draft.title}
                  onChange={(title) => onDraft({ ...draft, title })}
                  maxLength={120}
                  className="text-[24px] leading-[30px] font-semibold tracking-[-0.02em] text-pretty"
                />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <ProofKindSelect value={draft.proofKind} onChange={(proofKind) => onDraft({ ...draft, proofKind })} />
                <MinutesSelect value={draft.minutes} onChange={(minutes) => onDraft({ ...draft, minutes })} />
              </div>

              <DocSection label="The situation">
                <InlineEdit label="The situation" value={draft.brief} onChange={(brief) => onDraft({ ...draft, brief })} maxLength={LIMITS.brief} multiline className="text-body text-pretty" />
                {draft.material ? <TaskMaterialView material={draft.material} className="mt-3" /> : null}
              </DocSection>

              <DocSection label="What they hand in">
                <InlineEdit
                  label="What they hand in"
                  value={draft.deliverable}
                  onChange={(deliverable) => onDraft({ ...draft, deliverable })}
                  maxLength={LIMITS.brief}
                  className="text-body font-medium text-pretty"
                />
              </DocSection>

              {draft.facts?.length ? (
                <DocSection label="Good to know">
                  <ul className="flex flex-col gap-1">
                    {draft.facts.map((fact) => (
                      <li key={fact} className="text-body text-pretty">
                        {fact}
                      </li>
                    ))}
                  </ul>
                </DocSection>
              ) : null}

              <DocSection label="What your reviewer looks for" note={`A person at ${companyName || "your company"} reads each answer with these in mind. In words: no points, no scores.`} rule>
                <ul className="mt-3 flex flex-col gap-3">
                  {draft.reviewGuide.map((g) => (
                    <li key={g.skillId}>
                      <p className="text-footnote font-medium text-label-2">{skillLabel(g.skillId)}</p>
                      <InlineEdit label={`What to look for: ${skillLabel(g.skillId)}`} value={g.lookFor} onChange={(text) => editGuide(g.skillId, text)} maxLength={LOOK_FOR_MAX} className="text-subhead text-pretty" />
                    </li>
                  ))}
                </ul>
              </DocSection>
            </article>
          </Card>

          <Card>
            <PlacesStepper value={draft.places} onChange={(places) => onDraft({ ...draft, places })} />
          </Card>

          <Card>
            <Field
              label="Approved by"
              value={approvedBy}
              onChange={onApprovedBy}
              placeholder="Your name"
              autoComplete="name"
              maxLength={LIMITS.approvedBy}
              onEnter={waitingFor ? undefined : onPublish}
            />
            <p className="text-footnote mt-2 text-pretty text-label-2">Your name goes on the task. Talent sees that a named person approved it.</p>
            <div className="mt-6 max-[899px]:hidden">
              <PublishAction waitingFor={waitingFor} windowHours={windowHours} busy={busy} errorLine={errorLine} onPublish={onPublish} />
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

/** The answer window the company accepts by publishing, then the primary with its rule. */
export function PublishAction({ waitingFor, windowHours, busy, errorLine, onPublish }: { waitingFor: string | null; windowHours: number | null; busy: boolean; errorLine: ReactNode; onPublish: () => void }) {
  const ruleId = useId();
  return (
    <div>
      <p className="text-subhead flex gap-2.5 text-pretty text-label">
        <Clock aria-hidden className="mt-0.5 size-4 shrink-0 text-label-2" strokeWidth={1.8} />
        <span>
          {answerWindowRule(windowHours)} <span className="text-label-2">Publishing accepts this rule.</span>
        </span>
      </p>
      <div className="mt-4">{errorLine}</div>
      <div className="flex flex-col gap-2 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4">
        <LockedButton locked={waitingFor !== null} busy={busy} reasonId={ruleId} onClick={onPublish} className="w-full min-[900px]:w-auto min-[900px]:px-8">
          Approve and publish
        </LockedButton>
        <p id={ruleId} className={cx("text-footnote text-pretty text-label-2", !waitingFor && "sr-only")}>
          {waitingFor ?? "Talent can start as soon as it is live."}
        </p>
      </div>
    </div>
  );
}

/** One part of the task document, under a quiet heading, split from the part above by a hairline. */
function DocSection({ label, note, rule, children }: { label: string; note?: string; rule?: boolean; children: ReactNode }) {
  return (
    <section className={cx("mt-6", rule && "border-t border-separator pt-6")}>
      <h3 className="text-footnote font-medium text-label-2">{label}</h3>
      {note ? <p className="text-footnote mt-0.5 text-pretty text-label-2">{note}</p> : null}
      <div className="mt-1.5">{children}</div>
    </section>
  );
}
