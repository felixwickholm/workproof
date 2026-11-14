"use client";

import { use, type ReactNode } from "react";
import { TaskMaterialView } from "@/components/proof";
import { fullReason, placesState } from "@/components/proof/places-line";
import { BigButton, GatedAction } from "@/components/seeker/gated-action";
import { FORMAT_LABEL, FORMAT_LINE, FormatIcon } from "@/components/seeker/task-format";
import { cx } from "@/components/ui/cx";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api, currentTalentId } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

const back = { href: "/seeker", label: "Challenges" };

/**
 * One challenge, so it is clear what the company asks for, in this order: the task, who the company is,
 * the material, the situation, what you hand in, facts about the job, the minutes, the places left, and Start.
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
      <Screen back={back}>
        <ErrorState error={error} what="this challenge" onRetry={retry} away={{ href: "/seeker", label: "See the challenges" }} />
      </Screen>
    );
  }

  const { challenge, own, placesLeft, mine } = data;
  const places = placesLeft === undefined ? null : placesState(challenge, placesLeft);
  const start = mine ? (
    <BigButton href="/my-work" variant="secondary" className="w-full">
      See my work
    </BigButton>
  ) : places?.full ? (
    <GatedAction locked reason={fullReason(challenge)}>
      Start
    </GatedAction>
  ) : (
    <BigButton href={`/challenges/${challenge.id}/work`} className="w-full" tour="start-challenge">
      Start · {challenge.minutes} min
    </BigButton>
  );

  return (
    <Screen back={back} bottom={start} page phoneBar>
      <div className="min-[900px]:grid min-[900px]:grid-cols-[minmax(0,760px)_280px] min-[900px]:items-start min-[900px]:justify-between min-[900px]:gap-10">
        <article className="flex min-w-0 flex-col gap-8 pt-2">
          <header className="rise">
            <p className="flex items-center gap-2 text-label-2">
              <FormatIcon format={challenge.format} />
              <span className="text-body font-medium">
                {FORMAT_LABEL[challenge.format]} · {FORMAT_LINE[challenge.format]}
              </span>
            </p>
            <h1 className="mt-3 text-[32px] leading-[38px] font-semibold tracking-[-0.02em] text-pretty text-label min-[900px]:text-[40px] min-[900px]:leading-[46px]">
              {challenge.title}
            </h1>
            <p className={cx("text-body tnum mt-3 min-[900px]:hidden", places?.few ? "font-medium text-label" : "text-label-2")}>
              {[`${challenge.minutes} min`, places?.text].filter(Boolean).join(" · ")}
            </p>
          </header>

          {own.length ? (
            <Part title={own.map((c) => c.name).join(" and ")} i={1}>
              {own.map((c) => (
                <p key={c.id} className="text-body text-pretty text-label">
                  {c.blurb}{" "}
                  <span className="text-label-2">
                    {c.sector}, {c.district}.
                  </span>
                </p>
              ))}
            </Part>
          ) : null}

          <Part title="The situation" i={2}>
            <p className="text-[18px] leading-[28px] whitespace-pre-wrap text-pretty text-label">{challenge.brief}</p>
          </Part>

          {challenge.material ? (
            <div className="rise" style={riseAt(3)}>
              <TaskMaterialView material={challenge.material} />
            </div>
          ) : null}

          {challenge.options ? (
            <div className="rise grid grid-cols-1 gap-3 min-[560px]:grid-cols-2" style={riseAt(3)}>
              {challenge.options.map((o) => (
                <div key={o.id} className="rounded-card bg-surface p-5">
                  <p className="text-body font-semibold text-label">
                    {o.id.toUpperCase()}. {o.title}
                  </p>
                </div>
              ))}
            </div>
          ) : null}

          <Part title="You hand in" i={4}>
            <p className="text-[18px] leading-[28px] text-pretty text-label">{challenge.deliverable}</p>
            <p className="text-body mt-2 text-label-2">You think aloud while you work. No camera.</p>
          </Part>

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
        <aside className="hidden flex-col gap-3 rounded-card bg-surface p-5 min-[900px]:sticky min-[900px]:top-9 min-[900px]:mt-2 min-[900px]:flex">
          <p className="text-[28px] leading-[34px] font-normal tnum text-label">{challenge.minutes} min</p>
          {mine ? <p className="text-body text-label">You did this one.</p> : places ? <p className={cx("text-body tnum", places.few ? "font-medium text-label" : "text-label-2")}>{places.text}</p> : null}
          {start}
        </aside>
      </div>
    </Screen>
  );
}

function Part({ title, children, i }: { title: string; children: ReactNode; i: number }) {
  return (
    <section className="rise" style={riseAt(i)}>
      <h2 className="mb-2 text-[20px] leading-[26px] font-semibold text-label">{title}</h2>
      {children}
    </section>
  );
}

export function DetailSkeleton() {
  return (
    <Screen back={back}>
      <div aria-busy className="pt-2">
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mt-4 h-9 w-full" />
        <Skeleton className="mt-2 h-9 w-3/4" />
        <Skeleton className="mt-8 h-5 w-40" />
        <Skeleton className="mt-3 h-5 w-full" />
        <Skeleton className="mt-2 h-5 w-5/6" />
        <div className="mt-8 h-40 rounded-card bg-surface" />
      </div>
    </Screen>
  );
}
