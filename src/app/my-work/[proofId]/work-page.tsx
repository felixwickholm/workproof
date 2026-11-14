"use client";

import { use, useState, type ReactNode } from "react";
import { AttachmentView, BlindCompare, BlindText } from "@/components/proof";
import { ScoreView } from "@/components/seeker/score-view";
import { SharingCard } from "@/components/seeker/sharing-card";
import { FORMAT_LABEL, FormatIcon } from "@/components/seeker/task-format";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { workState } from "@/components/seeker/work-state";
import { LocalReplay } from "@/components/think-aloud/local-replay";
import { replayFor } from "@/components/think-aloud/replays";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { api, ApiError } from "@/lib/client/api";
import type { Challenge, Company, PassportEntry } from "@/lib/domain/types";
import { spokenLength } from "@/lib/think-aloud/transcript";

const back = { href: "/my-work", label: "My work" };

/** One piece of the person's work: what the company read, the score a person gave, and who can see it. */
export function WorkPage({ params }: { params: Promise<{ proofId: string }> }) {
  const { proofId } = use(params);
  const { data, error, loading, retry, reload } = useSeekerData(
    async (talentId) => {
      const home = await api.seekerHome(talentId);
      const found = home.passport.find((e) => e.proof.proofId === proofId);
      if (!found) return null;
      const [challenge, companies] = await Promise.all([api.challenge(found.challenge.id).catch(() => null), api.companies().catch(() => [] as Company[])]);
      return { entry: found, challenge, companies };
    },
    [proofId],
  );

  if (loading && !data) return <WorkSkeleton />;
  if (!data) {
    return (
      <Screen back={back} page>
        <ErrorState error={data === null ? new ApiError("Not found", 404) : error} what="this work" onRetry={retry} away={{ href: "/my-work", label: "Open My work" }} />
      </Screen>
    );
  }
  const company = data.challenge ? data.companies.filter((c) => data.challenge!.companyIds.includes(c.id)).map((c) => c.name).join(" and ") : "";
  return <WorkBody entry={data.entry} challenge={data.challenge} company={company || "the company"} onChanged={reload} />;
}

function WorkBody({ entry, challenge, company, onChanged }: { entry: PassportEntry; challenge: Challenge | null; company: string; onChanged: () => Promise<void> }) {
  const { proof, original } = entry;
  const replay = replayFor(proof.proofId);
  const lookFor = Object.fromEntries((challenge?.reviewGuide ?? []).map((g) => [g.skillId, g.lookFor]));
  const scored = entry.responses.filter((r) => r.scores?.length && r.total !== undefined);

  return (
    <Screen back={back} page>
      <header data-tour="own-work" className="rise mb-8">
        <p className="flex items-center gap-2 text-label-2">
          <FormatIcon format={entry.challenge.format} />
          <span className="text-body font-medium">
            {FORMAT_LABEL[entry.challenge.format]} · {company}
          </span>
        </p>
        <h1 className="mt-2 text-[34px] leading-[40px] font-semibold tracking-[-0.02em] text-balance text-label">{entry.challenge.title}</h1>
        <p className="mt-2 text-[20px] leading-[28px] text-label">{workState(entry)}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[900px]:items-start min-[900px]:gap-8">
        <Part title="What the company read" tour="blind-work" i={1}>
          <CompanyRead entry={entry} />
          {proof.thinkAloud?.transcript ? (
            <div className="mt-8 border-t border-separator pt-6">
              <h3 className="text-[20px] leading-[26px] font-semibold text-label">What I said while working</h3>
              <p className="text-footnote mt-1 text-label-2">{spokenLength(proof.thinkAloud.seconds)} of thinking aloud, as text.</p>
              <BlindText text={proof.thinkAloud.transcript} bars className="text-body mt-3 text-label" />
            </div>
          ) : null}
          {replay ? <LocalReplay replay={replay} className="mt-6" /> : null}
          {original.explain.length ? (
            <ol className="mt-8 flex flex-col gap-5 border-t border-separator pt-6">
              {proof.explain.map((e, i) => (
                <li key={i}>
                  <p className="text-footnote text-pretty text-label-2">{e.question}</p>
                  <BlindText text={e.answer} bars className="text-body mt-1 text-label" />
                </li>
              ))}
            </ol>
          ) : null}
        </Part>

        <div className="flex min-w-0 flex-col gap-6">
          <Part title="My score" tour="my-score" i={2}>
            {scored.length ? (
              <div className="flex flex-col gap-8">
                {scored.map((r, i) => (
                  <div key={`${r.companyName}-${i}`} className="border-separator not-first:border-t not-first:pt-8">
                    <ScoreView total={r.total!} scores={r.scores!} lookFor={lookFor} />
                    <blockquote className="mt-6 font-serif text-[22px] leading-[30px] text-pretty text-label">&ldquo;{r.feedback}&rdquo;</blockquote>
                    <p className="text-body mt-2 text-label-2">
                      {r.reviewer}, {r.companyName}
                    </p>
                  </div>
                ))}
                <p className="text-body border-t border-separator pt-4 font-medium text-label">A person scored this. The AI never does.</p>
              </div>
            ) : entry.responses.length ? (
              entry.responses.map((r, i) => (
                <div key={i}>
                  <blockquote className="font-serif text-[22px] leading-[30px] text-pretty text-label">&ldquo;{r.feedback}&rdquo;</blockquote>
                  <p className="text-body mt-2 text-label-2">
                    {r.reviewer}, {r.companyName}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-body text-pretty text-label">A person at {company} will score it. You will see the score and the reason here.</p>
            )}
          </Part>

          <Part title="Who can see it" i={3}>
            {entry.challenge.kind === "event" ? (
              <>
                <ul className="text-body mb-5 flex flex-col gap-1.5 text-label">
                  <li>{company} sees the work, not your name.</li>
                  {entry.recommendedTo.map((r) => (
                    <li key={`${r.to}-${r.by}`}>
                      Shared with {r.to} by {r.by}.
                    </li>
                  ))}
                  {entry.sharedWith.map((name) => (
                    <li key={name}>{name} can see it too.</li>
                  ))}
                </ul>
                <SharingCard proofId={proof.proofId} sharing={entry.sharing} onChanged={onChanged} />
              </>
            ) : (
              <p className="text-body text-label-2">A practice challenge. No company sees it.</p>
            )}
          </Part>
        </div>
      </div>
    </Screen>
  );
}

/** The work as the company read it, with grey bars; the switch shows the person's own words beside it. */
function CompanyRead({ entry }: { entry: PassportEntry }) {
  const [mine, setMine] = useState(false);
  const { proof, original } = entry;
  return (
    <>
      <div className="mb-5 flex items-center justify-between gap-4">
        <p className="text-body text-label-2">{mine ? "Drag the handle to compare." : "Bars cover what we removed."}</p>
        <label className="flex items-center gap-3">
          <span className="text-body font-medium text-label">Show what I wrote</span>
          <Switch checked={mine} onChange={setMine} label="Show what I wrote" />
        </label>
      </div>
      {mine ? (
        <BlindCompare original={original.answer} blind={proof.work} hiddenCount={proof.hiddenCount} labels={["What I wrote", "What the company read"]} />
      ) : (
        <BlindText text={proof.work} bars className="text-[18px] leading-[28px] text-label" />
      )}
      {entry.pictureRemoved ? <p className="text-body mt-4 text-label-2">A reviewer saw something personal in your picture. It was removed. Your words stay.</p> : null}
      {proof.attachment ? <AttachmentView attachment={proof.attachment} className="mt-6" /> : null}
    </>
  );
}

function Part({ title, tour, i, children }: { title: string; tour?: string; i: number; children: ReactNode }) {
  return (
    <section data-tour={tour} aria-label={title} className="rise min-w-0 rounded-card bg-surface p-6 min-[900px]:p-8" style={riseAt(i)}>
      <h2 className="mb-5 text-[24px] leading-[30px] font-semibold text-label">{title}</h2>
      {children}
    </section>
  );
}

export function WorkSkeleton() {
  return (
    <Screen back={back} page>
      <div aria-busy>
        <Skeleton className="h-5 w-48" />
        <Skeleton className="mt-3 h-9 w-3/5" />
        <Skeleton className="mt-3 h-6 w-40" />
        <div className="mt-8 grid grid-cols-1 gap-6 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="h-[480px] rounded-card bg-surface" />
          <div className="h-[420px] rounded-card bg-surface" />
        </div>
      </div>
    </Screen>
  );
}
