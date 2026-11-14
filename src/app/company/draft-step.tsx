import type { ReactNode } from "react";
import { ApproveBar } from "@/components/company/approve-bar";
import { InlineEdit } from "@/components/company/inline-edit";
import { ReviewGuide } from "@/components/company/review-guide";
import { CoreSkillList, SetAsideList, TrimHeadline } from "@/components/company/wish-trim";
import { metaLine } from "@/components/problem-card";
import { Card, Eyebrow, Section } from "@/components/ui/card";
import { CodeBlock } from "@/components/ui/code-block";
import { TextArea } from "@/components/ui/field";
import { AiTag } from "@/components/ui/tag";
import type { ChallengeDraft } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

interface Props {
  draft: ChallengeDraft;
  onDraft: (draft: ChallengeDraft) => void;
  companyName: string;
  approvedBy: string;
  onApprovedBy: (name: string) => void;
  busy: boolean;
  errorLine: ReactNode;
  onPublish: () => void;
}

/** The AI draft of the task. A person edits it and approves it before anyone sees it. */
export function draftStep({ draft, onDraft, companyName, approvedBy, onApprovedBy, busy, errorLine, onPublish }: Props) {
  const removeSkill = (id: string) =>
    onDraft({
      ...draft,
      coreSkills: draft.coreSkills.filter((s) => s.id !== id),
      reviewGuide: draft.reviewGuide.filter((g) => g.skillId !== id),
      setAside: [`${draft.coreSkills.find((s) => s.id === id)?.label}: removed by you`, ...draft.setAside],
    });
  const draftReady = draft.title.trim().length >= 3 && draft.brief.trim().length >= 10;

  const content = (
    <>
      <div className="rise mt-2">
        <AiTag />
      </div>
      <div className="rise mt-3">
        <InlineEdit
          label="Title"
          value={draft.title}
          onChange={(title) => onDraft({ ...draft, title })}
          maxLength={120}
          className="text-title font-bold text-pretty"
        />
        <p className="text-subhead tnum mt-1 text-label-2">{metaLine({ ...draft, id: "", companyIds: [], createdAt: "" })}</p>
        <p className="text-subhead mt-1 text-label-2 text-pretty">From your words. Edit anything before you approve.</p>
      </div>

      <Section label="The trim">
        <TrimHeadline skills={draft.coreSkills} setAside={draft.setAside} />
      </Section>

      <Section label="Core skills">
        <CoreSkillList skills={draft.coreSkills} onRemove={removeSkill} />
        <p className="text-footnote mt-2 px-4 text-label-2">Keep 3 to 5. Remove one if it is not the job.</p>
      </Section>

      <Section label="Set aside">
        <SetAsideList setAside={draft.setAside} />
      </Section>

      <Section label="In your words">
        <Card>
          <p className="text-body text-pretty">&ldquo;{draft.need}&rdquo;</p>
        </Card>
      </Section>

      <Section label="The task">
        <TextArea label="Brief" hideLabel value={draft.brief} onChange={(brief) => onDraft({ ...draft, brief })} minRows={3} maxLength={LIMITS.brief} />
        {draft.material ? (
          <div className="mt-3">
            {draft.material.kind === "code" ? (
              <CodeBlock title={draft.material.title} code={draft.material.body} />
            ) : (
              <Card className="p-4">
                <p className="text-footnote font-medium text-label-2">{draft.material.title}</p>
                <p className="text-body mt-2 whitespace-pre-wrap text-pretty">{draft.material.body}</p>
              </Card>
            )}
          </div>
        ) : null}
        <div className="mt-5 px-4">
          <Eyebrow>Talent hands in</Eyebrow>
          <p className="text-headline mt-2 font-semibold text-pretty">{draft.deliverable}</p>
        </div>
      </Section>

      <Section label="How your reviewer will judge the work">
        <ReviewGuide guide={draft.reviewGuide} skills={draft.coreSkills} />
        <p className="text-footnote mt-2 px-4 text-label-2">
          A person at {companyName || "your company"} reads each answer with these in mind. No points, no scores.
        </p>
      </Section>
    </>
  );

  const bottom = (
    <ApproveBar
      approvedBy={approvedBy}
      onApprovedBy={onApprovedBy}
      canPublish={draftReady}
      busy={busy}
      errorLine={errorLine}
      onPublish={onPublish}
    />
  );
  return { content, bottom };
}
