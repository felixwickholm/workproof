"use client";

import { EyeOff } from "lucide-react";
import { use, type ReactNode } from "react";
import { AttachmentView, BlindCompare, FeedbackQuote, HumanWorkLine, taskMeta } from "@/components/proof";
import { hiddenByKind } from "@/components/seeker/hidden-list";
import { ownerLine, ownersFrom, seenLine } from "@/components/seeker/pass-face";
import { UNNAMED_REVIEWER } from "@/components/seeker/pass-detail";
import { passState, proofTimeline } from "@/components/seeker/pass-state";
import { ProofTimeline } from "@/components/seeker/proof-timeline";
import { SharingCard } from "@/components/seeker/sharing-card";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { WrittenText } from "@/components/seeker/written-text";
import { Panel } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Tag } from "@/components/ui/tag";
import { SpokenBadge } from "@/components/voice";
import { api, ApiError } from "@/lib/client/api";
import type { PassportEntry, SeekerHome } from "@/lib/domain/types";

const back = { href: "/passport", label: "Passport" };

const PICTURE_REMOVED_LINE = "A reviewer reported your picture as possibly identifying. It was removed. Your written answer stays.";

/** One proof as its author sees it: where it stands, both sides of the blind layer, and every answer. */
export function ProofPage({ params }: { params: Promise<{ proofId: string }> }) {
  const { proofId } = use(params);
  const { data, error, loading, retry, reload } = useSeekerData((talentId) => api.seekerHome(talentId), [proofId]);
  const entry = data?.passport.find((e) => e.proof.proofId === proofId);

  if (loading && !data) return <ProofSkeleton />;
  if (!data || !entry) {
    return (
      <Screen back={back} page>
        <ErrorState
          error={data ? new ApiError("Not found", 404) : error}
          what="this proof"
          onRetry={retry}
          away={{ href: "/passport", label: "Open your passport" }}
        />
      </Screen>
    );
  }
  return <ProofBody entry={entry} home={data} onChanged={reload} />;
}

/**
 * Reading order: where the proof stands, then the slider between what the person wrote and what the
 * company reads, their follow-up answers, the reviewer's own words, and who may read it.
 */
function ProofBody({ entry, home, onChanged }: { entry: PassportEntry; home: SeekerHome; onChanged: () => Promise<void> }) {
  const { proof, original, responses } = entry;
  const state = passState(entry);
  const hidden = hiddenByKind(proof.redactions);
  const owners = ownersFrom(home.tasks)(entry);
  const reviewerOf = (companyName: string) =>
    home.invitations.find((i) => i.proofId === proof.proofId && i.companyName === companyName)?.reviewer ?? UNNAMED_REVIEWER;
  const subtitle = `${proof.label} · ${taskMeta(entry.challenge.minutes, proof.proofKind)} · ${ownerLine(entry, owners)}`;

  return (
    <Screen back={back} title={entry.challenge.title} subtitle={subtitle} page>
      <div className="rise -mt-2 mb-6 flex flex-wrap items-center gap-x-3 gap-y-2">
        <Tag tone={state.tone}>{state.label}</Tag>
        <span className="text-subhead tnum text-label-2">{seenLine(entry.seenByHumans)}</span>
      </div>

      <div className="rise rounded-card bg-surface p-5" style={riseAt(1)}>
        <ProofTimeline steps={proofTimeline(entry)} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[900px]:items-start">
        {/* Two walkthrough targets: the whole of her work, and inside it what the company reads. */}
        <section data-tour="own-work" aria-label="Your work" className="rise flex min-w-0 flex-col gap-4" style={riseAt(2)}>
          {entry.pictureRemoved ? (
            <p role="status" className="text-subhead rounded-inner bg-surface px-4 py-3 text-pretty text-label">
              {PICTURE_REMOVED_LINE}
            </p>
          ) : null}
          {proof.spoken ? <SpokenBadge /> : null}
          <div data-tour="blind-proof">
            <BlindCompare original={original.answer} blind={proof.work} hiddenCount={proof.hiddenCount} labels={["What you wrote", "What the company reads"]} initialSide="blind" />
          </div>
          {proof.attachment ? <AttachmentView attachment={proof.attachment} className="rounded-card bg-surface p-5" /> : null}
          <FollowUps entry={entry} hidden={hidden} />
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          <Block i={3}>
            <Panel title="What the reviewer wrote" count={responses.length || undefined}>
              {responses.length ? (
                <ul className="flex flex-col gap-6">
                  {responses.map((r, i) => (
                    <li key={`${r.companyName}-${i}`} className="border-separator not-first:border-t not-first:pt-6">
                      <FeedbackQuote reviewer={reviewerOf(r.companyName)} companyName={r.companyName} feedback={r.feedback} decision={r.decision} viaSecondLook={r.viaSecondLook} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState>
                  {entry.challenge.kind === "event"
                    ? "Every decision comes with a written reason. This one has no answer yet."
                    : "A practice proof. No company reads it, so no one answers it."}
                </EmptyState>
              )}
            </Panel>
          </Block>
          <Block i={4}>
            <Panel title="Who can read it">
              {entry.challenge.kind === "event" ? (
                <SharingCard proofId={proof.proofId} sharing={entry.sharing} sharedWith={entry.sharedWith} onChanged={onChanged} />
              ) : (
                <p className="text-subhead text-label-2">A practice proof. No company reads it.</p>
              )}
              <p className="text-footnote tnum mt-4 border-t border-separator pt-4 text-label-2">
                {seenLine(entry.seenByHumans)}. Your name stays hidden until you accept an invitation.
              </p>
            </Panel>
          </Block>
        </div>
      </div>
    </Screen>
  );
}

/** The person's own follow-up answers, with the details the blind layer hid marked, and what was hidden by kind. */
function FollowUps({ entry, hidden }: { entry: PassportEntry; hidden: string }) {
  const { original, proof } = entry;
  return (
    <div className="rounded-card bg-surface p-5 min-[900px]:p-6">
      {original.explain.length > 0 ? (
        <>
          <h2 className="text-section text-label">Your follow-up answers</h2>
          <ol className="mt-3 flex flex-col gap-5">
            {original.explain.map((e, i) => (
              <li key={i}>
                <p className="text-footnote text-pretty text-label-2">{e.question}</p>
                {e.spoken ? <SpokenBadge className="mt-2" /> : null}
                <WrittenText original={e.answer} blind={proof.explain[i]?.answer ?? e.answer} className="text-body mt-1 text-label" />
              </li>
            ))}
          </ol>
        </>
      ) : null}
      <p className={cx("text-footnote flex items-start gap-2 text-label-2", original.explain.length > 0 && "mt-6 border-t border-separator pt-4")}>
        <EyeOff aria-hidden className="mt-px size-4 shrink-0" strokeWidth={1.7} />
        {hidden ? `Hidden before anyone read it: ${hidden}. The marked words stay with you.` : "No personal details were found to hide."}
      </p>
      {entry.challenge.kind === "event" ? <HumanWorkLine className="mt-3" /> : null}
    </div>
  );
}

function Block({ children, i }: { children: ReactNode; i: number }) {
  return (
    <div className="rise" style={riseAt(i)}>
      {children}
    </div>
  );
}

export function ProofSkeleton() {
  return (
    <Screen back={back} page>
      <div aria-busy>
        <Skeleton className="h-8 w-3/5" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-6 h-7 w-56" />
        <div className="mt-6 h-[92px] rounded-card bg-surface" />
        <div className="mt-4 grid grid-cols-1 gap-4 min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
          <div className="h-[420px] rounded-card bg-surface" />
          <div className="h-[300px] rounded-card bg-surface" />
        </div>
      </div>
    </Screen>
  );
}
