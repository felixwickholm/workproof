import type { ReactNode } from "react";
import { CompanySwitcher, CompanySwitcherSkeleton } from "@/components/company/company-switcher";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { TextArea } from "@/components/ui/field";
import { StepTitle } from "@/components/ui/screen";
import type { Company } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

/** Needs written the way companies write them. The last one is a full wish list, so the trim is visible. */
const examples = [
  {
    label: "ML engineer",
    need: "ML engineer for our pick robots: model evaluation, data quality, code review, Python, 5 years of experience",
  },
  {
    label: "Data engineer",
    need: "Data engineer for our meter data pipelines: pipeline reliability, SQL, error handling, Airflow",
  },
  {
    label: "Backend, 10 wishes",
    need: "Backend developer for our payments API: API design, error handling, security, testing, Kafka, Docker, 8 years of experience, young, native Finnish speaker, top university degree",
  },
];

interface Props {
  need: string;
  onNeed: (need: string) => void;
  companies: Company[] | null;
  companyId: string;
  onCompany: (id: string) => void;
  busy: boolean;
  errorLine: ReactNode;
  onSubmit: () => void;
}

export function needStep({ need, onNeed, companies, companyId, onCompany, busy, errorLine, onSubmit }: Props) {
  const ready = need.trim().length >= 10;
  const content = (
    <>
      <StepTitle sub="Write it the way you would tell a colleague. AI drafts a 20-minute task from it, and you approve it.">
        What do you need?
      </StepTitle>
      <TextArea
        label="Your need"
        hideLabel
        value={need}
        onChange={onNeed}
        placeholder="For example: ML engineer for our pick robots who can check how our grasp model is tested"
        minRows={4}
        maxLength={LIMITS.need}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        {examples.map((e) => (
          <button
            key={e.label}
            type="button"
            onClick={() => onNeed(e.need)}
            aria-pressed={need === e.need}
            className={cx(
              "press text-subhead h-11 rounded-full px-4 font-medium transition-colors duration-150",
              need === e.need ? "bg-white text-black" : "bg-surface text-label",
            )}
          >
            {e.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        <Eyebrow className="mb-2 px-4">Posting for</Eyebrow>
        {companies ? (
          <CompanySwitcher companies={companies} value={companyId} onChange={onCompany} label="Posting for" />
        ) : (
          <CompanySwitcherSkeleton />
        )}
      </div>
    </>
  );
  const bottom = (
    <>
      {errorLine}
      <Button onClick={onSubmit} disabled={!ready} loading={busy}>
        {busy ? "Drafting the task" : "Draft the task"}
      </Button>
    </>
  );
  return { content, bottom };
}
