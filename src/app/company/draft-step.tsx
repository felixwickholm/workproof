import { X } from "lucide-react";
import { useId, type ReactNode } from "react";
import { designerLine } from "@/components/company/ai-designer";
import { InlineEdit } from "@/components/company/inline-edit";
import { PlacesStepper } from "@/components/company/places-stepper";
import { FormatSelect, MinutesSelect } from "@/components/company/task-pickers";
import { wishRows, withoutSkill } from "@/components/company/wish-list";
import { LockedButton } from "@/components/controls/locked-button";
import { TaskMaterialView } from "@/components/proof";
import { cx } from "@/components/ui/cx";
import { Field } from "@/components/ui/field";
import type { ChallengeDraft } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

/** The API's limit for one "look for" line. */
const LOOK_FOR_MAX = 400;
const MIN_SKILLS = 3;

interface Props {
  draft: ChallengeDraft;
  onDraft: (draft: ChallengeDraft) => void;
  companyName: string;
  /** Where the draft came from: the job ad link, the role the company picked, or the company's own hand. */
  source: { kind: "ad"; url: string } | { kind: "role"; role: string } | { kind: "hand"; role: string };
  /** Why the built-in designer wrote this draft, when a live model is configured. */
  fallback: string | null;
  approvedBy: string;
  onApprovedBy: (name: string) => void;
  busy: boolean;
  errorLine: ReactNode;
  onPublish: () => void;
}

/** What still stands between the draft and publishing, in words, or null when it can go live. */
function publishWaitsFor(draft: ChallengeDraft, approvedBy: string): string | null {
  if (draft.title.trim().length < 3) return "Give the challenge a title.";
  if (draft.brief.trim().length < 10) return "Say what the person does, in a sentence or two.";
  if (draft.deliverable.trim().length < 5) return "Say what the person hands in.";
  if (approvedBy.trim().length === 0) return "Add your name to approve it.";
  return null;
}

/**
 * Step 2: the draft as one short document the company edits in place: how it is done and how long,
 * the task, what the person hands in, the skills a person scores with what to look for, and the
 * wishes set aside with the reason. One click approves and publishes it.
 */
export function DraftStep({ draft, onDraft, companyName, source, fallback, approvedBy, onApprovedBy, busy, errorLine, onPublish }: Props) {
  const ruleId = useId();
  const waitingFor = publishWaitsFor(draft, approvedBy);
  const lookFor = (skillId: string) => draft.reviewGuide.find((g) => g.skillId === skillId)?.lookFor ?? "";
  const editLookFor = (skillId: string, text: string) =>
    onDraft({ ...draft, reviewGuide: draft.reviewGuide.map((g) => (g.skillId === skillId ? { ...g, lookFor: text } : g)) });
  const aside = wishRows(draft).aside;
  const canRemove = draft.coreSkills.length > MIN_SKILLS;

  return (
    <div data-tour="draft" className="flex flex-col gap-6">
      <p className="text-subhead text-pretty text-label-2">{sourceLine(draft, source, fallback)}</p>
      {draft.note ? <p className="text-body rounded-inner bg-surface px-5 py-4 text-pretty text-label">{draft.note}</p> : null}

      <article aria-label="Your challenge" className="rounded-card border border-separator bg-surface p-5 min-[900px]:p-8">
        <p className="text-subhead text-label-2">For {companyName || "your company"}</p>
        <InlineEdit
          label="Title"
          placeholder="Name the challenge"
          value={draft.title}
          onChange={(title) => onDraft({ ...draft, title })}
          maxLength={120}
          className="mt-1 text-h2 text-pretty"
        />
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <FormatSelect value={draft.format} onChange={(format) => onDraft({ ...draft, format })} />
          <MinutesSelect value={draft.minutes} onChange={(minutes) => onDraft({ ...draft, minutes })} />
        </div>

        <DocPart label="The task">
          <InlineEdit label="The task" placeholder="Write the situation, like a message from your team." value={draft.brief} onChange={(brief) => onDraft({ ...draft, brief })} maxLength={LIMITS.brief} multiline className="text-body text-pretty" />
          {draft.options ? (
            <ul className="mt-3 grid gap-3 min-[700px]:grid-cols-2">
              {draft.options.map((o) => (
                <li key={o.id} className="rounded-inner bg-raised p-4">
                  <p className="text-body font-semibold">
                    {o.id.toUpperCase()}: {o.title}
                  </p>
                  <p className="text-subhead mt-1 text-pretty text-label-2">{o.body}</p>
                </li>
              ))}
            </ul>
          ) : null}
          {draft.material ? <TaskMaterialView material={draft.material} className="mt-3" /> : null}
        </DocPart>

        <DocPart label="What the person hands in">
          <InlineEdit label="What the person hands in" placeholder="For example: a short plan in five lines" value={draft.deliverable} onChange={(deliverable) => onDraft({ ...draft, deliverable })} maxLength={LIMITS.brief} className="text-body text-pretty" />
        </DocPart>

        <DocPart label={`Skills you score (${draft.coreSkills.length})`} note="A person at your company scores each skill from 1 to 5. The AI never scores.">
          <ul className="mt-4 flex flex-col gap-4">
            {draft.coreSkills.map((skill) => (
              <li key={skill.id} className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-headline font-semibold text-label">{skill.label}</p>
                  <InlineEdit label={`Look for: ${skill.label}`} value={lookFor(skill.id)} onChange={(text) => editLookFor(skill.id, text)} maxLength={LOOK_FOR_MAX} className="text-subhead text-pretty text-label-2" />
                </div>
                {canRemove ? (
                  <button
                    type="button"
                    aria-label={`Remove ${skill.label}`}
                    onClick={() => onDraft(withoutSkill(draft, skill.id))}
                    className="press -mr-2 flex size-11 shrink-0 items-center justify-center rounded-full text-label-2 transition-colors duration-150 hover:bg-fill hover:text-label"
                  >
                    <X aria-hidden className="size-5" strokeWidth={1.75} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        </DocPart>

        {draft.facts?.length ? (
          <DocPart label="Good to know">
            <p className="text-body text-pretty">{draft.facts.join(" · ")}</p>
          </DocPart>
        ) : null}

        {aside.length > 0 ? (
          <DocPart label="Set aside" note="These wishes stay with you. People do not see them.">
            <ul className="flex flex-col gap-2">
              {aside.map((row) => (
                <li key={row.key} className="text-subhead text-pretty">
                  <span className="text-label line-through decoration-label-3">{row.text}</span> <span className="text-label-2">{row.reason}</span>
                </li>
              ))}
            </ul>
          </DocPart>
        ) : null}
      </article>

      <div className="rounded-card border border-separator bg-surface p-5 min-[900px]:p-6">
        <PlacesStepper value={draft.places} onChange={(places) => onDraft({ ...draft, places })} />
      </div>

      <div className="rounded-card border border-separator bg-surface p-5 min-[900px]:p-6">
        <Field label="Approved by" value={approvedBy} onChange={onApprovedBy} placeholder="Your name" autoComplete="name" maxLength={LIMITS.approvedBy} onEnter={waitingFor ? undefined : onPublish} />
        <p className="text-footnote mt-2 text-pretty text-label-2">Your name goes on the challenge.</p>
        <div className="mt-5">{errorLine}</div>
        <div className="flex flex-col gap-2 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4">
          <LockedButton locked={waitingFor !== null} busy={busy} reasonId={ruleId} onClick={onPublish} className="w-full min-[900px]:w-auto min-[900px]:px-8">
            Approve and publish
          </LockedButton>
          <p id={ruleId} className={cx("text-footnote text-pretty text-label-2", !waitingFor && "sr-only")}>
            {waitingFor ?? "People can start as soon as it is live."}
          </p>
        </div>
      </div>
    </div>
  );
}

/** Where the draft came from, in one line, and that nothing is public before a person approves it. */
function sourceLine(draft: ChallengeDraft, source: Props["source"], fallback: string | null): string {
  const approve = "You approve it before anyone sees it.";
  if (source.kind === "hand") return `You write this challenge for the ${source.role} role. The skills come from the shared list. ${approve}`;
  const from = source.kind === "ad" ? "from your job ad" : `for the ${source.role} role`;
  return `${designerLine(draft.draftedBy)} ${from}. ${approve}${fallback ? ` ${fallback}` : ""}`;
}

/** One part of the challenge document, under a quiet label, split from the part above by a hairline. */
function DocPart({ label, note, children }: { label: string; note?: string; children: ReactNode }) {
  return (
    <section className="mt-7 border-t border-separator pt-6">
      <h3 className="text-subhead font-semibold text-label">{label}</h3>
      {note ? <p className="text-footnote mt-0.5 text-pretty text-label-2">{note}</p> : null}
      <div className="mt-2">{children}</div>
    </section>
  );
}
