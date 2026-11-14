"use client";

import { use } from "react";
import { companyLine, metaLine, pooledLabel } from "@/components/problem-card";
import { Button } from "@/components/ui/button";
import { Card, Section } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Group, Row } from "@/components/ui/group";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";

const back = { href: "/challenges", label: "Challenges" };

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
        <ErrorState error={error} what="this challenge" onRetry={retry} away={{ href: "/challenges", label: "See open challenges" }} />
      </Screen>
    );
  }

  const { challenge, companies } = data;
  const blurb = companyLine(challenge, companies);
  const pooled = pooledLabel(challenge);
  const skillLabel = (skillId: string) => challenge.coreSkills.find((s) => s.id === skillId)?.label ?? skillId;

  return (
    <Screen back={back} bottom={<Button href={`/challenges/${challenge.id}/work`}>Start, {challenge.minutes} min</Button>}>
      <div className="rise mt-2">
        {blurb ? <p className="text-footnote text-label-2">{blurb}</p> : null}
        <h1 className="text-title mt-1 font-bold text-balance">{challenge.title}</h1>
        <p className="text-subhead tnum mt-2 text-label-2">{metaLine(challenge)}</p>
        {pooled ? (
          <p className="text-subhead mt-1 text-label-2">{pooled}. Both read your work.</p>
        ) : null}
      </div>

      <div className="rise" style={riseAt(1)}>
        <Section label="In the company's words">
          <Card>
            <p className="text-body text-pretty">&ldquo;{challenge.need}&rdquo;</p>
          </Card>
        </Section>

        <Section label="The task">
          <Card>
            <p className="text-body whitespace-pre-wrap text-pretty">{challenge.brief}</p>
            <p className="text-footnote mt-4 text-label-2">You hand in</p>
            <p className="text-body mt-1 text-pretty">{challenge.deliverable}</p>
          </Card>
        </Section>
      </div>

      <div className="rise" style={riseAt(2)}>
        <Section label="Core skills">
          <Group>
            {challenge.coreSkills.map((s) => (
              <Row key={s.id} title={s.label} detail={s.why} />
            ))}
          </Group>
        </Section>

        <Section label="How a human will review this">
          <Group footer="A person at the company reads your work without your name. No AI scores it.">
            {challenge.reviewGuide.map((g) => (
              <Row key={g.skillId} title={skillLabel(g.skillId)} detail={g.lookFor} />
            ))}
          </Group>
        </Section>
      </div>
    </Screen>
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
