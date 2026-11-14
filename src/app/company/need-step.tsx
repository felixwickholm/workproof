import { Link2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { CompanyLine } from "@/components/company/company-line";
import { LockedButton } from "@/components/controls/locked-button";
import { TextArea } from "@/components/ui/field";
import { VoiceButton } from "@/components/voice";
import type { Company } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { SAMPLE_ADS } from "@/lib/seed/ads";

/** True once the sentence is long enough for the designer to work from. */
export function needReady(need: string): boolean {
  return need.trim().length >= 10;
}

/** True for something that looks like a web link. The server checks the rest. */
export function linkReady(url: string): boolean {
  return /^https?:\/\/\S+\.\S+/i.test(url.trim()) || /^\/ads\/[\w-]+$/.test(url.trim());
}

export const AI_LINE = "AI drafts the challenge. You approve it. Nothing goes live before that.";

interface Props {
  adUrl: string;
  onAdUrl: (url: string) => void;
  need: string;
  onNeed: (need: string) => void;
  companies: Company[] | null;
  companyId: string;
  onCompany: (id: string) => void;
  busy: "ad" | "need" | null;
  errorLine: ReactNode;
  onFromAd: (url?: string) => void;
  onFromNeed: () => void;
}

/** Step 1: the job ad link first, the zero-effort path; one sentence, typed or said, second. */
export function NeedStep({ adUrl, onAdUrl, need, onNeed, companies, companyId, onCompany, busy, errorLine, onFromAd, onFromNeed }: Props) {
  const adRule = useId();
  const needRule = useId();
  const origin = typeof window === "undefined" ? "" : window.location.origin;

  return (
    <>
      <CompanyLine companies={companies} value={companyId} onChange={onCompany} label="Posting as" className="-mt-4 min-[900px]:-mt-6" />

      <section data-tour="job-ad" aria-labelledby="ad-title" className="mt-8 rounded-card bg-surface p-5 min-[900px]:p-7">
        <h2 id="ad-title" className="text-title-3 font-semibold text-label">
          Paste your job ad link
        </h2>
        <form
          className="mt-4 flex flex-col gap-3 min-[900px]:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (linkReady(adUrl)) onFromAd();
          }}
        >
          <label className="relative flex h-14 min-w-0 flex-1 items-center rounded-full bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-label)]">
            <Link2 aria-hidden className="pointer-events-none absolute left-5 size-5 text-label-2" strokeWidth={1.75} />
            <span className="sr-only">Job ad link</span>
            <input
              type="url"
              inputMode="url"
              value={adUrl}
              onChange={(e) => onAdUrl(e.target.value)}
              placeholder="https://"
              aria-describedby={adRule}
              className="h-full w-full rounded-full bg-transparent pr-5 pl-13 text-[18px] text-label outline-none placeholder:text-label-3"
            />
          </label>
          <LockedButton locked={!linkReady(adUrl)} busy={busy === "ad"} reasonId={adRule} onClick={() => onFromAd()} className="h-14 min-[900px]:px-8">
            {busy === "ad" ? "Reading the ad" : "Make my challenge"}
          </LockedButton>
        </form>
        <p id={adRule} className="sr-only">
          {linkReady(adUrl) ? AI_LINE : "Paste a link to your job ad."}
        </p>
        <p className="text-subhead mt-4 text-pretty text-label-2">
          Try a sample ad:{" "}
          {/* The company's own ad first; another company's ad posts as that company, so the draft and the company agree. */}
          {[...SAMPLE_ADS].sort((a, b) => Number(b.companyId === companyId) - Number(a.companyId === companyId)).map((ad, i) => (
            <span key={ad.slug} className="whitespace-nowrap">
              {i > 0 ? <span aria-hidden> · </span> : null}
              <button
                type="button"
                onClick={() => {
                  const url = `${origin}/ads/${ad.slug}`;
                  if (ad.companyId !== companyId && companies?.some((c) => c.id === ad.companyId)) onCompany(ad.companyId);
                  onAdUrl(url);
                  onFromAd(url);
                }}
                className="-mx-0.5 rounded-md px-0.5 py-2 font-medium text-label underline decoration-control underline-offset-4 transition-colors duration-150 hover:decoration-label-2"
              >
                {ad.title}
              </button>
            </span>
          ))}
        </p>
      </section>

      <section aria-labelledby="need-title" className="mt-10">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="need-title" className="text-title-3 font-semibold text-label">
            Or say it in one sentence
          </h2>
          <VoiceButton
            label="Say it"
            title="Say what you need"
            prompt="What do you need this person to do in their first month?"
            maxLength={LIMITS.need}
            onUse={onNeed}
            className="-my-1 -mr-1"
          />
        </div>
        <div className="[&_textarea]:px-5 [&_textarea]:py-4 [&_textarea]:text-[18px] [&_textarea]:leading-[28px]">
          <TextArea
            label="Your need in one sentence"
            hideLabel
            value={need}
            onChange={onNeed}
            placeholder="For example: someone to find what we should automate first in our order handling"
            minRows={3}
            maxLength={LIMITS.need}
          />
        </div>
        <div className="mt-4 flex flex-col gap-2 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4">
          <LockedButton tone="neutral" locked={!needReady(need)} busy={busy === "need"} reasonId={needRule} onClick={onFromNeed} className="w-full min-[900px]:w-auto min-[900px]:px-8">
            {busy === "need" ? "Drafting" : "Make my challenge"}
          </LockedButton>
          <p id={needRule} className="text-footnote text-pretty text-label-2">
            {needReady(need) ? AI_LINE : "Write a few words about the work."}
          </p>
        </div>
      </section>

      {errorLine ? <div className="mt-6">{errorLine}</div> : null}
    </>
  );
}
