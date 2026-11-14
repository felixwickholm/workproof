"use client";

import { use, type ReactNode } from "react";
import { CompanyMark, companiesOf } from "@/components/company-mark";
import { companyLine, metaLine, pooledLabel } from "@/components/problem-card";
import { Button } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { Group, Row } from "@/components/ui/group";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import type { Challenge, Company } from "@/lib/domain/types";

const back = { href: "/challenges", label: "Tasks" };

export function ChallengeDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, retry } = useResource(
    async () => {
      const [challenge, companies] = await Promise.all([api.challenge(id), api.companies().catch(() => [])]);
      return { challenge, companies };
    },
    [id],
  );

  if (loading && !data) return <DetailSkeleton />;
  if (!data) {
    return (
      <Screen back={back}>
        <ErrorState error={error} what="this task" onRetry={retry} away={{ href: "/challenges", label: "See open tasks" }} />
      </Screen>
    );
  }

  const { challenge, companies } = data;
  return (
    <Screen back={back} bottom={<Button href={`/challenges/${challenge.id}/work`}>Start · {challenge.minutes} min</Button>}>
      <ChallengeBody challenge={challenge} companies={companies} />
    </Screen>
  );
}

/** Who posted the task, in their words, what to hand in, and what the reviewer looks for. */
export function ChallengeBody({ challenge, companies, action }: { challenge: Challenge; companies: Company[]; action?: ReactNode }) {
  const blurb = companyLine(challenge, companies);
  const pooled = pooledLabel(challenge);
  const skillLabel = (skillId: string) => challenge.coreSkills.find((s) => s.id === skillId)?.label ?? skillId;
  const reviewed = new Set(challenge.reviewGuide.map((g) => g.skillId));
  const unguided = challenge.coreSkills.filter((s) => !reviewed.has(s.id));

  return (
    <>
      <div className="rise mt-2 [--mark-gap:var(--color-ground)]">
        <CompanyMark companies={companiesOf(challenge, companies)} />
        <h1 className="text-title mt-3 font-bold text-balance">{challenge.title}</h1>
        {blurb ? <p className="text-subhead mt-1.5 text-label-2 text-pretty">{blurb}</p> : null}
        <p className="text-subhead tnum mt-1 text-label-2">
          {metaLine(challenge)}
          {pooled ? ` · ${pooled}. Both read your work.` : null}
        </p>
        {action}
      </div>

      <div className="rise" style={riseAt(1)}>
        <h2 className="text-headline mt-7 font-semibold">What the company needs</h2>
        <p className="text-body mt-1 text-label-2 text-pretty">{challenge.need}</p>

        <p className="text-body mt-7 whitespace-pre-wrap text-pretty">{challenge.brief}</p>
        <div className="mt-4 hairline-t pt-4">
          <p className="text-footnote text-label-2">You hand in</p>
          <p className="text-body mt-1 text-pretty">{challenge.deliverable}</p>
        </div>
      </div>

      <div className="rise" style={riseAt(2)}>
        <h2 className="text-headline mt-8 mb-2 px-5 font-semibold">What the reviewer looks for</h2>
        <Group footer="A person at the company reads your work without your name. No AI scores it.">
          {challenge.reviewGuide.map((g) => (
            <Row key={g.skillId} title={skillLabel(g.skillId)} detail={g.lookFor} />
          ))}
          {unguided.map((s) => (
            <Row key={s.id} title={s.label} detail={s.why} />
          ))}
        </Group>
      </div>
    </>
  );
}

export function DetailSkeleton() {
  return (
    <Screen back={back}>
      <div aria-busy className="mt-2">
        <Skeleton className="h-3 w-48" />
        <Skeleton className="mt-3 h-7 w-72" />
        <Skeleton className="mt-3 h-4 w-40" />
        <Skeleton className="mt-10 h-3 w-32" />
        <div className="mt-3 h-28 rounded-card bg-surface" />
        <Skeleton className="mt-8 h-3 w-24" />
        <div className="mt-3 h-40 rounded-card bg-surface" />
      </div>
    </Screen>
  );
}
