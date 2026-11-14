"use client";

import { useState } from "react";
import { TaskCard } from "@/components/proof";
import { KindChips } from "@/components/seeker/kind-chips";
import { arrangeTasks, countByKind, countLine, filterByKind, type KindFilter } from "@/components/seeker/task-filter";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PROOF_KIND_LABEL } from "@/components/ui/proof-kind";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import type { SeekerTask } from "@/lib/domain/types";

/**
 * Every open task as a card, newest first and the same for everyone, narrowed by kind of proof.
 * Full tasks come after the ones you can start, and work you already sent waits at the end.
 */
export function ChallengeList() {
  const { data, error, loading, retry } = useSeekerData((talentId) => api.seekerHome(talentId).then((home) => home.tasks));
  const [kind, setKind] = useState<KindFilter>("all");

  return (
    <Screen title="Tasks" subtitle={data ? `${countLine(data)}. Each takes a limited number of answers, so a person reads every one.` : " "} page>
      {loading && !data ? (
        <ListSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} what="the tasks" onRetry={retry} />
      ) : data ? (
        <>
          <div className="glass sticky top-[calc(var(--phone-bar)+env(safe-area-inset-top,0px))] z-20 -mx-4 px-4 pt-2 pb-1 min-[900px]:static min-[900px]:mx-0 min-[900px]:bg-transparent min-[900px]:p-0">
            <KindChips value={kind} onChange={setKind} counts={countByKind(data)} bleed="page" />
          </div>
          <p className="text-footnote mt-2 mb-4 text-label-2">Newest first. The same list for everyone: no profile, no match score.</p>
          <TaskGroups tasks={filterByKind(data, kind)} kind={kind} />
        </>
      ) : null}
    </Screen>
  );
}

function TaskGroups({ tasks, kind }: { tasks: SeekerTask[]; kind: KindFilter }) {
  if (tasks.length === 0) {
    return (
      <EmptyState>
        {kind === "all" ? "No tasks are open yet. Check back closer to the event." : `No ${PROOF_KIND_LABEL[kind].toLowerCase()} task is open today. Try another kind.`}
      </EmptyState>
    );
  }
  const { open, full, sent } = arrangeTasks(tasks);
  return (
    <>
      <TaskGrid tasks={[...open, ...full]} />
      {sent.length ? (
        <section aria-labelledby="sent-title" className="mt-10">
          <SectionHeader title={<span id="sent-title">Already sent</span>} count={sent.length} className="mb-3" />
          <TaskGrid tasks={sent} offset={open.length + full.length} />
        </section>
      ) : null}
    </>
  );
}

function TaskGrid({ tasks, offset = 0 }: { tasks: SeekerTask[]; offset?: number }) {
  return (
    <ul className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
      {tasks.map((t, i) => (
        <li key={t.challenge.id} className="rise flex" style={riseAt(Math.min(offset + i, 8))}>
          <TaskCard
            className="w-full"
            challenge={t.challenge}
            companies={t.companies}
            href={`/challenges/${t.challenge.id}`}
            proofsSent={t.proofsSent}
            medianReplyHours={t.medianReplyHours}
            mine={t.mine}
            placesLeft={t.placesLeft}
          />
        </li>
      ))}
    </ul>
  );
}

function ListSkeleton() {
  return (
    <div aria-busy>
      <div className="flex gap-1.5">
        {[56, 64, 52, 60, 88].map((width, i) => (
          <span key={i} className="h-8 rounded-full bg-fill" style={{ width }} />
        ))}
      </div>
      <Skeleton className="mt-3 mb-4 h-3.5 w-80" />
      <div className="grid grid-cols-1 gap-4 min-[900px]:grid-cols-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[238px] overflow-hidden rounded-card bg-surface">
            <div className="h-10 bg-fill" />
            <div className="p-5">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="mt-3 h-5 w-4/5" />
              <Skeleton className="mt-6 h-3.5 w-48" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
