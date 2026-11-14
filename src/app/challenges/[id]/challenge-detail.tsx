"use client";

import { use, type ReactNode } from "react";
import { CompanyFacts, TaskMaterialView, taskMeta } from "@/components/proof";
import { fullReason, placesState } from "@/components/proof/places-line";
import { AiAllowedLine } from "@/components/seeker/ai-line";
import { BigButton, GatedAction } from "@/components/seeker/gated-action";
import { CompanyMark } from "@/components/ui/avatar";
import { SectionHeader } from "@/components/ui/card";
import { cx } from "@/components/ui/cx";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api, currentTalentId } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, Company } from "@/lib/domain/types";
import { roleOf } from "./role";

const back = { href: "/challenges", label: "Tasks" };

export function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, retry } = useResource(
    async () => {
      const [challenge, companies, home] = await Promise.all([
        api.challenge(id),
        api.companies().catch(() => []),
        // Places left come with the feed; without it the page still works and says nothing about places.
        currentTalentId()
          .then((talentId) => api.seekerHome(talentId))
          .catch(() => null),
      ]);
      const task = home?.tasks.find((t) => t.challenge.id === id);
      return { challenge, own: companies.filter((c) => challenge.companyIds.includes(c.id)), placesLeft: task?.placesLeft };
    },
    [id],
  );

  if (loading && !data) return <DetailSkeleton />;
  if (!data) {
    return (
      <Screen back={back} page>
        <ErrorState error={error} what="this task" onRetry={retry} away={{ href: "/challenges", label: "See open tasks" }} />
      </Screen>
    );
  }

  const { challenge, own, placesLeft } = data;
  const places = placesLeft === undefined ? null : placesState(challenge, placesLeft);
  const label = `Start · ${challenge.minutes} min`;
  const start = places?.full ? (
    <GatedAction locked reason={fullReason(challenge)}>
      {label}
    </GatedAction>
  ) : (
    <BigButton href={`/challenges/${challenge.id}/work`} className="w-full">
      {label}
    </BigButton>
  );
  const subtitle = [taskMeta(challenge.minutes, challenge.proofKind), own.map((c) => c.name).join(" and ")].filter(Boolean).join(" · ");

  return (
    <Screen
      back={back}
      title={challenge.title}
      subtitle={subtitle}
      page
      tall
      phoneBar
      bottom={
        <>
          {challenge.aiAllowed ? <AiAllowedLine className="mb-2.5 text-center" /> : null}
          {start}
        </>
      }
    >
      <div className="min-[900px]:grid min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[900px]:items-start min-[900px]:gap-10">
        <article className="min-w-0">
          {places && !places.full ? (
            <p className={cx("text-subhead tnum -mt-2 mb-4 min-[900px]:hidden", places.few ? "font-medium text-label" : "text-label-2")}>{places.text}</p>
          ) : null}
          <Companies companies={own} />
          <Brief challenge={challenge} />
        </article>

        <aside className="rise mt-8 min-[900px]:sticky min-[900px]:top-9 min-[900px]:mt-0" style={riseAt(1)}>
          <div className="rounded-card bg-surface p-5 min-[900px]:p-6">
            <ReviewerLooksFor challenge={challenge} />
            <div className="mt-5 hidden flex-col gap-3 border-t border-separator pt-5 min-[900px]:flex">
              {places ? (
                <p className={cx("text-subhead tnum", places.few ? "font-medium text-label" : "text-label-2")}>
                  {places.full ? "Full: every place is taken" : places.text}
                </p>
              ) : null}
              {challenge.aiAllowed ? <AiAllowedLine /> : null}
              {start}
              <p className="text-footnote text-center text-label-2">Your draft saves on this device. The clock never stops you.</p>
            </div>
          </div>
        </aside>
      </div>
    </Screen>
  );
}

function Section({ title, children, i }: { title: string; children: ReactNode; i: number }) {
  return (
    <section className="rise mt-8" style={riseAt(i)}>
      <h2 className="text-headline font-semibold text-label">{title}</h2>
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** The brief in reading order: the role, the situation, the material, what to hand in, and what is good to know. */
function Brief({ challenge }: { challenge: Challenge }) {
  const role = roleOf(challenge.need);
  const requirements = challenge.requirements ?? [];
  return (
    <>
      <Section title={role ? `The role: ${role}` : "What the company needs"} i={1}>
        {role ? null : <p className="text-body text-pretty text-label">{challenge.need}</p>}
        <ul className={cx("flex flex-col gap-3", !role && "mt-4")}>
          {challenge.coreSkills.map((s) => (
            <li key={s.id}>
              <p className="text-subhead font-medium text-label">{s.label}</p>
              <p className="text-subhead text-pretty text-label-2">{s.why}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="The situation" i={2}>
        <p className="text-body whitespace-pre-wrap text-pretty text-label">{challenge.brief}</p>
        {challenge.material ? <TaskMaterialView material={challenge.material} className="mt-4" /> : null}
      </Section>

      <Section title="You hand in" i={3}>
        <p className="text-body text-pretty text-label">{challenge.deliverable}</p>
        <p className="text-footnote mt-1 text-label-2">You can also write it or say it instead.</p>
      </Section>

      {requirements.length ? (
        <Section title="Good to know" i={4}>
          <ul className="flex flex-col gap-1.5">
            {requirements.map((r) => (
              <li key={r} className="text-body text-pretty text-label">
                {r}
              </li>
            ))}
          </ul>
        </Section>
      ) : null}
    </>
  );
}

/** How the work is read: the review guide, one line per core skill, and no points anywhere. */
function ReviewerLooksFor({ challenge }: { challenge: Challenge }) {
  const skillLabel = (skillId: string) => challenge.coreSkills.find((s) => s.id === skillId)?.label ?? skillId;
  return (
    <>
      <SectionHeader title="What the reviewer looks for" className="mb-3" />
      <ul className="flex flex-col gap-3">
        {challenge.reviewGuide.map((g) => (
          <li key={g.skillId}>
            <p className="text-subhead font-medium text-label">{skillLabel(g.skillId)}</p>
            <p className="text-subhead text-pretty text-label-2">{g.lookFor}</p>
          </li>
        ))}
      </ul>
      <p className="text-subhead mt-4 text-pretty text-label">No points. A person reads your work and decides, always with a written reason.</p>
    </>
  );
}

/** Who posted the task, with the four facts a newcomer asks before spending 20 minutes on it. */
function Companies({ companies }: { companies: Company[] }) {
  if (companies.length === 0) return null;
  return (
    <div className="rise flex flex-col gap-3">
      {companies.length > 1 ? <p className="text-footnote text-label-2">{companies.length} companies, one task. Both read your work.</p> : null}
      {companies.map((c) => (
        <div key={c.id} className="rounded-card bg-surface p-5">
          <div className="flex items-center gap-3">
            <CompanyMark company={c} />
            <div className="min-w-0">
              <p className="text-subhead font-semibold text-label">{c.name}</p>
              <p className="text-footnote text-label-2">
                {c.sector} · {c.district} · {c.size}
              </p>
            </div>
          </div>
          <CompanyFacts company={c} className="mt-4 border-t border-separator pt-4 min-[640px]:grid-cols-4" />
        </div>
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <Screen back={back} page>
      <div aria-busy>
        <Skeleton className="h-8 w-[min(640px,90%)]" />
        <Skeleton className="mt-3 h-4 w-64" />
        <div className="mt-8 min-[900px]:grid min-[900px]:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] min-[900px]:gap-10">
          <div>
            <div className="h-36 rounded-card bg-surface" />
            <Skeleton className="mt-10 h-4 w-48" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-5/6" />
          </div>
          <div className="mt-8 h-96 rounded-card bg-surface min-[900px]:mt-0" />
        </div>
      </div>
    </Screen>
  );
}
