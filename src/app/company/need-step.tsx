import { Check } from "lucide-react";
import { useId, type ReactNode } from "react";
import { CompanyLine } from "@/components/company/company-line";
import { LockedButton } from "@/components/controls/locked-button";
import { cx } from "@/components/ui/cx";
import { TextArea } from "@/components/ui/field";
import { VoiceButton } from "@/components/voice";
import type { Company } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";

/**
 * Needs written the way companies write them, for three degree-level roles. Each one is a wish
 * list with things that describe a person, so the trim on the next screen has work to do.
 */
const examples = [
  {
    role: "Care team coordinator",
    sample: "Plans the day's home visits when nurses are off sick",
    need: "Care team coordinator for our home-care visits: plans the day when nurses are off sick, calm with families, clear handover notes for the evening shift, native Finnish speaker, under 35, 5 years of experience",
  },
  {
    role: "Backend developer",
    sample: "Builds and secures our payments API",
    need: "Backend developer for our payments API: API design, error handling, security, testing, 8 years of experience, young, native Finnish speaker, top university degree",
  },
  {
    role: "Data analyst",
    sample: "Explains a forecast miss to the operations team",
    need: "Data analyst for our energy forecasts: explains a forecast miss to the operations team, cleans meter data, SQL, Python, native Finnish speaker, top university, under 30",
  },
];

/** True once the need is long enough for the designer to work from. */
export function needReady(need: string): boolean {
  return need.trim().length >= 10;
}

export const NEED_RULE = "Write at least a few words about the work.";
export const AI_LINE = "AI drafts the task. You approve it. Nothing goes live before that.";

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

/** Step 1: the need in the company's own words, typed, spoken or started from an example. */
export function NeedStep({ need, onNeed, companies, companyId, onCompany, busy, errorLine, onSubmit }: Props) {
  const ruleId = useId();
  const ready = needReady(need);
  return (
    <>
      <CompanyLine companies={companies} value={companyId} onChange={onCompany} label="Posting as" className="-mt-4 min-[900px]:-mt-6" />

      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span aria-hidden className="text-section text-label">
            Your need
          </span>
          <VoiceButton
            label="Say it instead"
            title="Say what you need"
            prompt="What do you need this person to do in their first month?"
            maxLength={LIMITS.need}
            onUse={onNeed}
            className="-my-1 -mr-1"
          />
        </div>
        <div className="[&_textarea]:min-h-[164px] [&_textarea]:px-5 [&_textarea]:py-4 [&_textarea]:text-[18px] [&_textarea]:leading-[28px]">
          <TextArea
            label="Your need"
            hideLabel
            value={need}
            onChange={onNeed}
            placeholder="For example: someone to plan our home-care visits when nurses are off sick"
            minRows={5}
            maxLength={LIMITS.need}
          />
        </div>
      </div>

      <div className="mt-8">
        <p className="text-section text-label">Or start from an example</p>
        <ul className="mt-3 flex flex-col gap-2">
          {examples.map((e) => {
            const on = need === e.need;
            return (
              <li key={e.role}>
                <button
                  type="button"
                  onClick={() => onNeed(e.need)}
                  aria-pressed={on}
                  className={cx(
                    "press flex min-h-16 w-full items-center gap-3 rounded-inner px-4 py-2.5 text-left transition-[background-color,box-shadow] duration-150",
                    on ? "bg-fill shadow-[inset_0_0_0_1.5px_var(--color-label)]" : "bg-surface hover:bg-fill",
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span className="text-subhead block font-semibold text-label">{e.role}</span>
                    <span className="text-footnote block truncate text-label-2">{e.sample}</span>
                  </span>
                  <Check aria-hidden className={cx("size-[18px] shrink-0 text-label transition-opacity duration-150", on ? "opacity-100" : "opacity-0")} strokeWidth={2.2} />
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-10 max-[899px]:hidden">
        <DraftAction ready={ready} busy={busy} ruleId={ruleId} errorLine={errorLine} onSubmit={onSubmit} />
      </div>
    </>
  );
}

/** The AI line right above the primary, and the rule beside the primary while it waits. */
export function DraftAction({ ready, busy, ruleId, errorLine, onSubmit }: { ready: boolean; busy: boolean; ruleId: string; errorLine: ReactNode; onSubmit: () => void }) {
  return (
    <div>
      {errorLine}
      <p className="text-[15px] leading-[21px] text-pretty text-label">{AI_LINE}</p>
      <div className="mt-3 flex flex-col gap-2 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4">
        <LockedButton locked={!ready} busy={busy} reasonId={ruleId} onClick={onSubmit} className="w-full min-[900px]:w-auto min-[900px]:px-8">
          {busy ? "Drafting the task" : "Draft the task"}
        </LockedButton>
        <p id={ruleId} className={cx("text-footnote text-pretty text-label-2", ready && "sr-only")}>
          {ready ? "AI drafts the task from your words." : NEED_RULE}
        </p>
      </div>
    </div>
  );
}
