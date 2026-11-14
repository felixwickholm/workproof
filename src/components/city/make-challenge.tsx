"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { errorText } from "@/lib/client/api";
import type { ChallengeDraft, Company } from "@/lib/domain/types";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Sheet } from "../ui/sheet";
import { CopySheet } from "./copy-sheet";
import { formatLabel } from "./impact";
import { CITY_ACTOR, citySource } from "./source";

/** A sample job ad on this site, so the demo never depends on a real company's page. */
export const SAMPLE_AD_PATH = "/ads/financial-analyst";

const control =
  "text-body h-12 w-full rounded-inner bg-fill px-4 text-label outline-none placeholder:text-label-3 shadow-[inset_0_0_0_1px_transparent] transition-shadow duration-150 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]";

/** The draft as a short document: what the person will do, and the skills the company will score. */
function DraftDocument({ draft }: { draft: ChallengeDraft }) {
  return (
    <div className="rounded-[16px] bg-surface p-4">
      <p className="text-headline font-semibold text-label">{draft.title}</p>
      <p className="text-footnote mt-1 text-label-2">
        {formatLabel(draft.format)} · {draft.minutes} minutes
      </p>
      <p className="text-body mt-3 text-pretty text-label">{draft.brief}</p>
      <p className="text-footnote mt-4 text-label-2">The company scores</p>
      <ul className="text-body mt-1 text-label">
        {draft.coreSkills.map((s) => (
          <li key={s.id}>{s.label}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The zero-effort path for a company: the city pastes the company's job-ad link, gets a draft challenge,
 * publishes it for the company and copies a ready message to send from its own mail.
 */
export function MakeChallenge({ companies }: { companies: Company[] }) {
  const [url, setUrl] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [busy, setBusy] = useState<"draft" | "publish" | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [draft, setDraft] = useState<ChallengeDraft | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const company = companies.find((c) => c.id === companyId);

  const make = async () => {
    if (!url.trim()) return setProblem("Paste a link to a job ad, or write one sentence about the job.");
    if (!company) return setProblem("Pick the company.");
    setProblem(null);
    setBusy("draft");
    try {
      setDraft(await citySource.draft(url.trim()));
    } catch (e) {
      setProblem(e instanceof Error && e.message && !e.message.startsWith("Request failed") ? e.message : errorText(e));
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (!draft || !company) return;
    setBusy("publish");
    try {
      const published = await citySource.publishForCompany({ companyId: company.id, draft, by: CITY_ACTOR });
      setDraft(null);
      setUrl("");
      setMessage(published.message);
    } catch (e) {
      setProblem(errorText(e));
      setDraft(null);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card>
      <h2 className="text-section text-label">Make a challenge for a company</h2>
      <p className="text-body mt-1 text-label-2">The company does nothing. You paste its job ad.</p>
      <div className="mt-4 grid grid-cols-1 gap-3 min-[900px]:grid-cols-[minmax(0,1fr)_260px_auto]">
        <label className="block">
          <span className="sr-only">Paste the company&apos;s job ad link</span>
          <input
            type="text"
            inputMode="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void make()}
            placeholder="Paste the company's job ad link"
            className={control}
          />
        </label>
        <label className="relative block">
          <span className="sr-only">Company</span>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className={`${control} appearance-none pr-10`}>
            <option value="">Pick a company</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-label-2" strokeWidth={1.75} />
        </label>
        <Button onClick={make} loading={busy === "draft"} className="h-12 min-[900px]:w-auto">
          Make the challenge
        </Button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-x-4">
        <button
          type="button"
          onClick={() => setUrl(`${window.location.origin}${SAMPLE_AD_PATH}`)}
          className="text-subhead h-11 font-medium text-label-2 hover:text-label"
        >
          Use a sample ad
        </button>
        {problem ? (
          <p role="alert" className="text-subhead text-negative">
            {problem}
          </p>
        ) : null}
      </div>

      <Sheet open={draft !== null} onClose={() => setDraft(null)} title="The draft challenge">
        {draft ? <DraftDocument draft={draft} /> : null}
        <p className="text-footnote mt-3 text-label-2">The company can change it when it opens it.</p>
        <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row-reverse">
          <Button onClick={publish} loading={busy === "publish"} className="min-[480px]:w-auto min-[480px]:flex-1">
            Publish for {company?.name ?? "the company"}
          </Button>
          <Button variant="secondary" onClick={() => setDraft(null)} className="min-[480px]:w-auto min-[480px]:flex-1">
            Not now
          </Button>
        </div>
      </Sheet>

      <CopySheet open={message !== null} title={`Message to ${company?.name ?? "the company"}`} text={message ?? ""} onClose={() => setMessage(null)}>
        <p className="text-body mb-4 text-label">The challenge is live. Send this message to the company.</p>
      </CopySheet>
    </Card>
  );
}
