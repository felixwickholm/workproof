import { Link2 } from "lucide-react";
import { useId, type ReactNode } from "react";
import { CompanyLine } from "@/components/company/company-line";
import { RoleChips } from "@/components/company/role-chips";
import { LockedButton } from "@/components/controls/locked-button";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { VoiceButton } from "@/components/voice";
import type { Company } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { SAMPLE_ADS } from "@/lib/seed/ads";

/** True for something that looks like a web link. The server checks the rest. */
function linkReady(url: string): boolean {
  return /^https?:\/\/\S+\.\S+/i.test(url.trim()) || /^\/ads\/[\w-]+$/.test(url.trim());
}

const AI_LINE = "The AI drafts the challenge. You approve it. Nothing goes live before that.";

/** The room the role's own sentence takes in the need, so the company's words never push it over the limit. */
const WORDS_MAX = LIMITS.need - 140;

interface Props {
  roleId: string | null;
  onRole: (id: string) => void;
  words: string;
  onWords: (words: string) => void;
  adUrl: string;
  onAdUrl: (url: string) => void;
  companies: Company[] | null;
  companyId: string;
  onCompany: (id: string) => void;
  busy: "ad" | "role" | null;
  errorLine: ReactNode;
  onFromRole: () => void;
  onByHand: () => void;
  onFromAd: (url?: string) => void;
}

/**
 * Step 1: who the company is looking for. A role chip and, if they like, a sentence about the work;
 * the AI drafts from that, or the company writes the challenge itself. A job ad link is the other way in.
 */
export function StartStep({ roleId, onRole, words, onWords, adUrl, onAdUrl, companies, companyId, onCompany, busy, errorLine, onFromRole, onByHand, onFromAd }: Props) {
  const rolesTitle = useId();
  const roleRule = useId();
  const adRule = useId();
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const picked = roleId !== null;

  return (
    <>
      <CompanyLine companies={companies} value={companyId} onChange={onCompany} label="Posting as" className="-mt-4 min-[900px]:-mt-6" />

      <section data-tour="company-looking-for" aria-labelledby={rolesTitle} className="mt-8 rounded-card border border-separator bg-surface p-5 min-[900px]:p-8">
        <h2 id={rolesTitle} className="text-title-3 font-semibold text-label">
          Who are you looking for?
        </h2>
        <p className="text-subhead mt-1 text-pretty text-label-2">Pick one. The same roles job seekers pick, so your challenge reaches the right people.</p>
        <div className="mt-5">
          <RoleChips value={roleId} onChange={onRole} labelledBy={rolesTitle} />
        </div>

        <div className="mt-7 border-t border-separator pt-6">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-subhead min-w-0 flex-1 font-semibold text-label">
              What would they do in the first month? <span className="font-normal text-label-2">Optional</span>
            </p>
            <VoiceButton
              label="Say it"
              title="Say what you need"
              prompt="What do you need this person to do in their first month?"
              maxLength={WORDS_MAX}
              onUse={onWords}
              className="-my-1 -mr-1 shrink-0 whitespace-nowrap"
            />
          </div>
          <TextArea
            label="What they would do"
            hideLabel
            value={words}
            onChange={onWords}
            placeholder="For example: find what we should automate first in our order handling"
            minRows={2}
            maxLength={WORDS_MAX}
          />
        </div>

        <div className="mt-6 flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-4">
          <LockedButton locked={!picked} busy={busy === "role"} reasonId={roleRule} onClick={onFromRole} className="w-full min-[900px]:w-auto min-[900px]:px-8">
            {busy === "role" ? "Drafting" : "Draft my challenge"}
          </LockedButton>
          <Button variant="quiet" size="sm" onClick={onByHand} disabled={!picked || busy !== null} className="self-center min-[900px]:self-auto">
            Write it yourself
          </Button>
        </div>
        <p id={roleRule} className="text-footnote mt-3 text-pretty text-label-2">
          {picked ? AI_LINE : "Pick who you are looking for first."}
        </p>
      </section>

      <p aria-hidden className="text-footnote my-8 flex items-center gap-3 text-label-2 before:h-px before:flex-1 before:bg-separator after:h-px after:flex-1 after:bg-separator">
        or
      </p>

      <section data-tour="job-ad" aria-labelledby="ad-title" className="rounded-card border border-separator bg-surface p-5 min-[900px]:p-8">
        <h2 id="ad-title" className="text-title-3 font-semibold text-label">
          Start from your job ad
        </h2>
        <p className="text-subhead mt-1 text-pretty text-label-2">Paste the link. The AI reads the ad and drafts the challenge.</p>
        <form
          className="mt-5 flex flex-col gap-3 min-[900px]:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (linkReady(adUrl)) onFromAd();
          }}
        >
          <label className="relative flex h-[52px] w-full min-w-0 shrink-0 items-center min-[900px]:w-auto min-[900px]:flex-1 rounded-full bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)] focus-within:shadow-[inset_0_0_0_1.5px_var(--color-label)]">
            <Link2 aria-hidden className="pointer-events-none absolute left-5 size-5 text-label-2" strokeWidth={1.75} />
            <span className="sr-only">Job ad link</span>
            <input
              type="url"
              inputMode="url"
              value={adUrl}
              onChange={(e) => onAdUrl(e.target.value)}
              placeholder="https://"
              aria-describedby={adRule}
              className="h-full w-full rounded-full bg-transparent pr-5 pl-13 text-[17px] text-label outline-none placeholder:text-label-3"
            />
          </label>
          <LockedButton tone="neutral" locked={!linkReady(adUrl)} busy={busy === "ad"} reasonId={adRule} onClick={() => onFromAd()} className="min-[900px]:px-8">
            {busy === "ad" ? "Reading the ad" : "Make my challenge"}
          </LockedButton>
        </form>
        <p id={adRule} className="sr-only">
          {linkReady(adUrl) ? AI_LINE : "Paste a link to your job ad."}
        </p>
        <div className="mt-5">
          <p className="text-footnote font-semibold tracking-wide text-label-2 uppercase">Try a sample ad</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {/* The company's own ad first; another company's ad posts as that company, so the draft and the company agree. */}
            {[...SAMPLE_ADS].sort((a, b) => Number(b.companyId === companyId) - Number(a.companyId === companyId)).map((ad) => (
              <li key={ad.slug}>
                <button
                  type="button"
                  disabled={busy !== null}
                  onClick={() => {
                    const url = `${origin}/ads/${ad.slug}`;
                    if (ad.companyId !== companyId && companies?.some((c) => c.id === ad.companyId)) onCompany(ad.companyId);
                    onAdUrl(url);
                    onFromAd(url);
                  }}
                  className="press text-subhead inline-flex min-h-11 items-center rounded-full bg-fill px-4 text-left font-medium text-label transition-colors duration-150 hover:bg-label/10"
                >
                  {ad.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {errorLine ? <div className="mt-6">{errorLine}</div> : null}
    </>
  );
}
