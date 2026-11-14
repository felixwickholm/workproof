"use client";

import Link from "next/link";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useState } from "react";
import { errorText } from "@/lib/client/api";
import type { Challenge, ChallengeDraft, Company } from "@/lib/domain/types";
import { SAMPLE_ADS, type SampleAd } from "@/lib/seed/ads";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Sheet } from "../ui/sheet";
import { FORMAT_LABEL } from "../words";
import { CopySheet } from "./copy-sheet";
import { CITY_ACTOR, citySource } from "./source";

/** The challenge the city already made from this ad, if any: its stored ad link ends with the ad's path. */
export function madeFrom(ad: Pick<SampleAd, "slug">, challenges: readonly Challenge[]): Challenge | undefined {
  return challenges.find((c) => c.onBehalf?.adUrl?.endsWith(`/ads/${ad.slug}`));
}

/** The draft as a short document: what the person will do, and the skills the company will score. */
function DraftDocument({ draft }: { draft: ChallengeDraft }) {
  return (
    <div data-tour="city-draft" className="rounded-[16px] bg-surface p-4">
      <p className="text-headline font-semibold text-label">{draft.title}</p>
      <p className="text-footnote mt-1 text-label-2">
        {FORMAT_LABEL[draft.format]} · {draft.minutes} minutes
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
 * Companies hiring right now, from their public job ads. The city picks one, WorkProof drafts a challenge
 * from the ad, the city publishes it for the company and copies a ready invitation to send from its own mail.
 * The ads here are the five sample ads served under /ads, labelled as such.
 */
export function HiringNow({ companies, challenges }: { companies: readonly Company[]; challenges: readonly Challenge[] }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [problem, setProblem] = useState<{ slug: string; text: string } | null>(null);
  const [draft, setDraft] = useState<{ ad: SampleAd; draft: ChallengeDraft } | null>(null);
  const [invite, setInvite] = useState<{ company: string; message: string } | null>(null);
  const ads = SAMPLE_ADS.filter((ad) => companies.some((c) => c.id === ad.companyId));
  // The walkthrough points at the first ad still without a challenge, or the first row once all have one.
  const target = Math.max(0, firstOpen(ads, challenges));

  const make = async (ad: SampleAd) => {
    setProblem(null);
    setBusy(ad.slug);
    try {
      setDraft({ ad, draft: await citySource.draft(`${window.location.origin}/ads/${ad.slug}`) });
    } catch (e) {
      setProblem({ slug: ad.slug, text: errorText(e) });
    } finally {
      setBusy(null);
    }
  };

  const publish = async () => {
    if (!draft) return;
    setBusy("publish");
    try {
      const published = await citySource.publishForCompany({ companyId: draft.ad.companyId, draft: draft.draft, by: CITY_ACTOR });
      setInvite({ company: draft.ad.company, message: published.message });
      setDraft(null);
    } catch (e) {
      setProblem({ slug: draft.ad.slug, text: errorText(e) });
      setDraft(null);
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card tour="city-hiring-now" className="min-[900px]:p-8">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-section text-label">Companies hiring right now</h2>
          <p className="text-subhead mt-1 text-pretty text-label-2">From public job ads. Pick one and WorkProof drafts a challenge from the ad.</p>
        </div>
        <span className="text-footnote shrink-0 whitespace-nowrap rounded-full bg-fill px-2.5 py-0.5 text-label-2">Sample ads</span>
      </div>

      <ul className="mt-4">
        {ads.map((ad, i) => {
          const made = madeFrom(ad, challenges);
          return (
            <li key={ad.slug} className="flex flex-col gap-3 py-3.5 [&+&]:hairline-t min-[560px]:flex-row min-[560px]:items-center min-[560px]:justify-between">
              <div className="min-w-0">
                <p className="text-body font-semibold text-label">{ad.company}</p>
                <p className="text-subhead text-label">{ad.title}</p>
                <p className="text-footnote mt-0.5 flex flex-wrap items-center gap-x-3 text-label-2">
                  <span>{ad.facts.split(".")[0]}</span>
                  <a
                    href={`/ads/${ad.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-8 items-center gap-0.5 font-medium text-link hover:underline"
                  >
                    Sample ad
                    <ArrowUpRight aria-hidden className="size-3.5" strokeWidth={1.75} />
                  </a>
                </p>
                {problem?.slug === ad.slug ? (
                  <p role="alert" className="text-subhead mt-1 text-negative">
                    {problem.text}
                  </p>
                ) : null}
              </div>
              <span data-tour={i === target ? "city-make-challenge" : undefined} className="shrink-0 self-start min-[560px]:self-auto">
              {made ? (
                <Link
                  href={`/city/challenges/${encodeURIComponent(made.id)}`}
                  className="press text-subhead inline-flex h-11 items-center gap-1 rounded-full bg-fill px-4 font-semibold text-label hover:bg-label/10"
                >
                  Challenge made
                  <ChevronRight aria-hidden className="size-4" strokeWidth={1.75} />
                </Link>
              ) : (
                <Button variant="secondary" onClick={() => void make(ad)} loading={busy === ad.slug} disabled={busy !== null && busy !== ad.slug} size="sm" className="h-11 w-auto px-4">
                  Make a challenge
                </Button>
              )}
              </span>
            </li>
          );
        })}
      </ul>

      <Sheet open={draft !== null} onClose={() => setDraft(null)} title={`A challenge for ${draft?.ad.company ?? "the company"}`}>
        {draft ? <DraftDocument draft={draft.draft} /> : null}
        <p className="text-footnote mt-3 text-label-2">Drafted from the job ad for {draft?.ad.title ?? "the role"}. The company can change it when it opens it.</p>
        <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row-reverse">
          <Button onClick={publish} loading={busy === "publish"} className="min-[480px]:w-auto min-[480px]:flex-1">
            Publish and invite
          </Button>
          <Button variant="secondary" onClick={() => setDraft(null)} className="min-[480px]:w-auto min-[480px]:flex-1">
            Not now
          </Button>
        </div>
      </Sheet>

      <CopySheet open={invite !== null} title={`Invite ${invite?.company ?? "the company"}`} text={invite?.message ?? ""} onClose={() => setInvite(null)}>
        <p className="text-body mb-4 text-label">The challenge is live. Send this invitation to the company.</p>
      </CopySheet>
    </Card>
  );
}

/** The first ad without a challenge yet: the one the walkthrough points at. */
function firstOpen(ads: readonly SampleAd[], challenges: readonly Challenge[]): number {
  return ads.findIndex((ad) => !madeFrom(ad, challenges));
}
