"use client";

import { ChevronLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use, useState, type ReactNode } from "react";
import { TaskMaterialView } from "@/components/proof";
import { fullReason, placesState } from "@/components/proof/places-line";
import { publishedLabel } from "@/components/seeker/challenge-filter";
import { BigButton, GatedAction } from "@/components/seeker/gated-action";
import { SaveButton } from "@/components/seeker/save-button";
import { FORMAT_LINE, FormatIcon } from "@/components/seeker/task-format";
import { CompanyLogo } from "@/components/ui/avatar";
import { cx } from "@/components/ui/cx";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { FORMAT_LABEL } from "@/components/words";
import { api, currentTalentId } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, Company } from "@/lib/domain/types";

const LIST = "/challenges";

/**
 * One challenge, laid out like a job ad: back to the list, the company's logo beside the title, Save and
 * Start, a picture of the work, then "About the challenge" (what it is about, the format and how to do it,
 * the skills scored, the minutes, what you hand in) and a card about the company. No pay is ever shown.
 */
export function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, retry } = useResource(async () => {
    const [challenge, companies, home] = await Promise.all([
      api.challenge(id),
      api.companies().catch(() => []),
      // Places left come with the list; without it the page still works and says nothing about places.
      currentTalentId()
        .then((talentId) => api.seekerHome(talentId))
        .catch(() => null),
    ]);
    const task = home?.tasks.find((t) => t.challenge.id === id);
    return {
      challenge,
      own: companies.filter((c) => challenge.companyIds.includes(c.id)),
      placesLeft: task?.placesLeft,
      mine: task?.mine ?? false,
    };
  }, [id]);

  if (loading && !data) return <DetailSkeleton />;
  if (!data) {
    return (
      <Screen page tone="grey">
        <BackLink />
        <ErrorState error={error} what="this challenge" onRetry={retry} away={{ href: LIST, label: "See the challenges" }} />
      </Screen>
    );
  }

  const { challenge, own, placesLeft, mine } = data;
  const places = placesLeft === undefined ? null : placesState(challenge, placesLeft);
  const companyNames = own.map((c) => c.name).join(" and ");
  const published = publishedLabel(challenge.publishedAt ?? challenge.createdAt);
  const lead = own[0] ?? { name: companyNames || "Company" };

  const start = mine ? (
    <BigButton href="/my-work" variant="secondary" className="w-full">
      See my work
    </BigButton>
  ) : places?.full ? (
    <GatedAction locked reason={fullReason(challenge)} className="w-full">
      Start challenge
    </GatedAction>
  ) : (
    <BigButton href={`/challenges/${challenge.id}/work`} className="w-full" tour="start-challenge">
      Start challenge
    </BigButton>
  );

  return (
    <Screen bottom={start} page phoneBar tone="grey">
      <BackLink />
      <div className="min-[1100px]:grid min-[1100px]:grid-cols-[minmax(0,1fr)_340px] min-[1100px]:items-start min-[1100px]:gap-8">
        <article className="flex min-w-0 flex-col gap-8 rounded-card bg-raised p-5 shadow-[inset_0_0_0_1px_var(--color-separator)] min-[900px]:p-8">
          <header className="rise flex flex-col gap-6">
            <nav aria-label="Breadcrumb" className="text-caption text-label-2">
              <ol className="flex min-w-0 flex-wrap items-center gap-1">
                <li>
                  <Link href={LIST} className="hover:text-label hover:underline">
                    Challenges
                  </Link>
                </li>
                <li aria-hidden>/</li>
                <li aria-current="page" className="min-w-0 truncate text-label">
                  {challenge.title}
                </li>
              </ol>
            </nav>
            <div className="grid grid-cols-[64px_minmax(0,1fr)] items-start gap-4 min-[900px]:grid-cols-[120px_minmax(0,1fr)] min-[900px]:gap-8">
              <CompanyLogo company={lead} size="xl" className="min-[900px]:hidden" />
              <span className="flex justify-center max-[899px]:hidden">
                <CompanyLogo company={lead} size="2xl" />
              </span>
              <div className="min-w-0">
                <h1 className="text-[28px] leading-[36px] text-pretty text-label min-[900px]:text-h1">{challenge.title}</h1>
                <p className="mt-2 text-body text-label-2">
                  <span className="font-medium text-label">{companyNames}</span>
                  {own[0] ? ` · ${own[0].district}` : null}
                </p>
                <p className={cx("tnum text-footnote", places?.few ? "font-medium text-label" : "text-label-2")}>
                  {[published, `${challenge.minutes} min`, mine ? "You did this one" : places?.text].filter(Boolean).join(" · ")}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <SaveButton challengeId={challenge.id} title={challenge.title} variant="pill" className="shrink-0" />
              <div className="min-w-0 flex-1 max-[899px]:hidden">{start}</div>
            </div>
          </header>

          <WorkPicture challenge={challenge} company={lead} />

          <Part title="About the challenge" i={2}>
            <p className="text-body whitespace-pre-wrap text-pretty text-label min-[900px]:text-lead">{challenge.brief}</p>
            <dl className="mt-6 grid grid-cols-1 gap-x-8 gap-y-5 min-[640px]:grid-cols-2">
              <Fact term="Format">
                <span className="flex items-center gap-2 font-medium">
                  <FormatIcon format={challenge.format} className="size-5 text-label-2" />
                  {FORMAT_LABEL[challenge.format]}
                </span>
                <span className="text-label-2">{FORMAT_LINE[challenge.format]}</span>
              </Fact>
              <Fact term="Time">
                <span className="tnum font-medium">{challenge.minutes} minutes</span>
                <span className="text-label-2">You write how you think while you work. No camera.</span>
              </Fact>
              <Fact term="Skills scored">
                <ul className="mt-1 flex flex-wrap gap-1.5">
                  {challenge.coreSkills.map((s) => (
                    <li key={s.id} className="rounded-full bg-surface px-2.5 py-0.5 text-caption text-label">
                      {s.label}
                    </li>
                  ))}
                </ul>
              </Fact>
              <Fact term="You hand in">
                <span>{challenge.deliverable}</span>
              </Fact>
            </dl>
          </Part>

          {challenge.material ? (
            <div className="rise" style={riseAt(4)}>
              <TaskMaterialView material={challenge.material} />
            </div>
          ) : null}

          {challenge.options ? (
            <div className="rise grid grid-cols-1 gap-3 min-[560px]:grid-cols-2" style={riseAt(4)}>
              {challenge.options.map((o) => (
                <div key={o.id} className="rounded-[14px] bg-surface p-5">
                  <p className="text-body font-semibold text-label">
                    {o.id.toUpperCase()}. {o.title}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          {challenge.requirements?.length ? (
            <Part title="Good to know" i={5}>
              <ul className="text-body flex flex-col gap-1 text-label">
                {challenge.requirements.map((fact) => (
                  <li key={fact}>{fact}</li>
                ))}
              </ul>
            </Part>
          ) : null}
        </article>

        <aside className="mt-6 flex flex-col gap-4 min-[1100px]:sticky min-[1100px]:top-9 min-[1100px]:mt-0">
          {own.map((c) => (
            <CompanyCard key={c.id} company={c} />
          ))}
        </aside>
      </div>
    </Screen>
  );
}

function BackLink() {
  return (
    <Link href={LIST} className="press -ml-1 mb-4 inline-flex h-10 w-fit items-center gap-1 text-body font-medium text-label hover:text-link">
      <ChevronLeft aria-hidden className="size-5" strokeWidth={2} />
      Back to challenges
    </Link>
  );
}

/** A photo of this kind of work, 16:9. Until a challenge has one, a calm tile in the same frame keeps the page steady. */
function WorkPicture({ challenge, company }: { challenge: Challenge; company: { name: string; logo?: string } }) {
  // A picture that fails to load falls back to the tile, so a missing file never leaves a broken frame.
  const [failed, setFailed] = useState(false);
  const shown = Boolean(challenge.image) && !failed;
  return (
    <figure className="rise" style={riseAt(1)}>
      <div className="relative aspect-video w-full overflow-hidden rounded-[16px] bg-surface">
        {shown && challenge.image ? (
          <Image src={challenge.image} alt="" fill sizes="(min-width: 1100px) 760px, 100vw" className="object-cover" priority onError={() => setFailed(true)} />
        ) : (
          <div aria-hidden className="flex size-full flex-col items-center justify-center gap-3 text-label-3">
            <CompanyLogo company={company} size="xl" />
            <span className="flex items-center gap-1.5 text-footnote">
              <FormatIcon format={challenge.format} className="size-4" />
              {FORMAT_LABEL[challenge.format]} · {challenge.minutes} min
            </span>
          </div>
        )}
      </div>
      {/* The pictures are made for the demo, so the page says so. */}
      {shown ? <figcaption className="mt-2 text-caption text-label-2">Illustrative picture</figcaption> : null}
    </figure>
  );
}

function CompanyCard({ company }: { company: Company }) {
  return (
    <section aria-label={`About ${company.name}`} className="rise rounded-card bg-raised p-6 shadow-[inset_0_0_0_1px_var(--color-separator)]" style={riseAt(2)}>
      <div className="flex items-center gap-3">
        <CompanyLogo company={company} size="lg" />
        <h2 className="text-h4 text-label">{company.name}</h2>
      </div>
      <p className="mt-4 text-footnote text-pretty text-label">{company.about ?? company.blurb}</p>
      <dl className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-2 text-footnote">
        <dt className="text-label-2">Industry</dt>
        <dd className="text-label">{company.industry ?? company.sector}</dd>
        <dt className="text-label-2">Espoo district</dt>
        <dd className="text-label">{company.district}</dd>
        <dt className="text-label-2">Size</dt>
        <dd className="text-label">{company.size}</dd>
        <dt className="text-label-2">Work language</dt>
        <dd className="text-label">{company.workLanguage}</dd>
      </dl>
    </section>
  );
}

function Fact({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 text-body text-label">
      <dt className="text-footnote text-label-2">{term}</dt>
      <dd className="flex flex-col gap-0.5">{children}</dd>
    </div>
  );
}

function Part({ title, children, i }: { title: string; children: ReactNode; i: number }) {
  return (
    <section className="rise" style={riseAt(i)}>
      <h2 className="mb-3 text-h3 text-label">{title}</h2>
      {children}
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <Screen page tone="grey">
      <BackLink />
      <div aria-busy className="rounded-card bg-raised p-5 min-[900px]:p-8">
        <Skeleton className="h-4 w-56" />
        <div className="mt-6 flex gap-6">
          <Skeleton className="size-16 shrink-0 rounded-[14px] min-[900px]:size-24" />
          <div className="flex-1">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="mt-3 h-5 w-1/2" />
          </div>
        </div>
        <Skeleton className="mt-6 h-12 w-full rounded-full" />
        <div className="mt-8 aspect-video w-full rounded-[16px] bg-surface" />
      </div>
    </Screen>
  );
}
