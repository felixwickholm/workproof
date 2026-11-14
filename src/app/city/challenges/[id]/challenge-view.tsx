"use client";

import { use, useState } from "react";
import { CopySheet } from "@/components/city/copy-sheet";
import { taskState } from "@/components/city/impact";
import { ImpactFunnel } from "@/components/city/impact-funnel";
import { CITY_ACTOR, citySource } from "@/components/city/source";
import { MatchPicker, TopWorkList } from "@/components/city/top-work";
import { useLive } from "@/components/city/use-live-city";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Sheet } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { FORMAT_LABEL, workLabel } from "@/components/words";
import { errorText } from "@/lib/client/api";
import type { CityTaskView } from "@/lib/domain/types";

const back = { href: "/city", label: "City" };

const RULE = "The other company sees the work without the name. It does not see the scores. Sharing needs the person's yes.";

export function ChallengeSkeleton() {
  return (
    <Screen page back={back}>
      <div aria-busy aria-label="Loading the challenge">
        <Skeleton className="h-9 w-full max-w-[560px]" />
        <Skeleton className="mt-3 h-4 w-64" />
        <div className="mt-8 h-[260px] rounded-card bg-surface" />
        <div className="mt-4 grid grid-cols-1 gap-4 min-[1000px]:grid-cols-12">
          <div className="h-[360px] rounded-card bg-surface min-[1000px]:col-span-7" />
          <div className="h-[360px] rounded-card bg-surface min-[1000px]:col-span-5" />
        </div>
      </div>
    </Screen>
  );
}

/** One challenge for the city: its own funnel, its top work as labels and scores, and sharing with another company. */
export function CityChallengeView({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, retry, reload } = useLive(() => citySource.task(id), [id]);
  const { data: matches } = useLive(() => citySource.matches(id), [id]);
  const { data: actions } = useLive(citySource.actions);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [toCompany, setToCompany] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [sending, setSending] = useState(false);
  const [offered, setOffered] = useState<Record<string, string[]>>({});
  const [reminding, setReminding] = useState(false);

  if (loading && !data) return <ChallengeSkeleton />;
  if (!data) {
    return (
      <Screen page back={back}>
        <ErrorState error={error} what="this challenge" onRetry={retry} away={{ href: "/city", label: "Back to the city" }} />
      </Screen>
    );
  }

  // What this page offered shows at once, before the next poll brings it back from the server.
  const top: CityTaskView["top"] = data.top.map((t) => ({ ...t, sharedWith: [...new Set([...t.sharedWith, ...(offered[t.proofId] ?? [])])] }));
  const picked = top.filter((t) => selected.has(t.proofId));
  const target = matches?.find((m) => m.companyId === toCompany) ?? null;
  const reminder = actions?.reminders.find((r) => data.companies.includes(r.companyName)) ?? null;
  const waiting = data.took - data.scored;

  const toggle = (proofId: string) =>
    setSelected((now) => {
      const next = new Set(now);
      if (next.has(proofId)) next.delete(proofId);
      else next.add(proofId);
      return next;
    });

  const offer = async () => {
    if (!target) return;
    setSending(true);
    try {
      // A row the company already has is left out; sending it again would only be refused.
      const fresh = picked.filter((entry) => !entry.sharedWith.includes(target.name));
      for (const entry of fresh) await citySource.recommend({ proofId: entry.proofId, toCompanyId: target.companyId, by: CITY_ACTOR });
      setOffered((now) => {
        const next = { ...now };
        for (const entry of fresh) next[entry.proofId] = [...(next[entry.proofId] ?? []), target.name];
        return next;
      });
      toast(`Offered to ${target.name}.`);
      setSelected(new Set());
      setConfirming(false);
      void reload();
    } catch (e) {
      toast(errorText(e));
    } finally {
      setSending(false);
    }
  };

  const people = picked.length === 1 ? "1 person" : `${picked.length} people`;

  return (
    <Screen
      page
      back={back}
      title={data.title}
      subtitle={[data.companies.join(" and "), FORMAT_LABEL[data.challenge.format], `${data.challenge.minutes} minutes`].join(" · ")}
    >
      <div className="flex flex-col gap-4">
        <Card className="min-[900px]:p-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-section text-label">What came of this challenge</h2>
            <span className="text-footnote shrink-0 whitespace-nowrap rounded-full bg-fill px-2.5 py-0.5 text-label-2">Demo data</span>
          </div>
          <ImpactFunnel counts={data} size="small" className="mt-6" />
          <div className="mt-6 flex flex-col gap-3 hairline-t pt-5 min-[700px]:flex-row min-[700px]:items-center min-[700px]:justify-between">
            <p className="text-body text-label-2">{taskState(data, reminder?.tasks.length === 1 ? reminder.oldestHours : null)}</p>
            {waiting > 0 && reminder ? (
              <Button variant="secondary" size="sm" onClick={() => setReminding(true)} className="self-start min-[700px]:self-auto">
                Remind the company
              </Button>
            ) : null}
          </div>
        </Card>

        <div className="grid grid-cols-1 items-start gap-4 min-[1000px]:grid-cols-12">
          <Card className="min-[1000px]:col-span-7">
            <h2 className="text-section text-label">Top work</h2>
            <p className="text-subhead mt-1 text-label-2">Best score first. The company scored each one. No names.</p>
            <div className="mt-3">
              <TopWorkList top={top} selected={selected} onToggle={toggle} />
            </div>
          </Card>

          <Card className="min-[1000px]:col-span-5">
            <h2 className="text-section text-label">Offer these people to another company</h2>
            <p className="text-subhead mt-1 text-label-2">
              {!top.some((t) => t.canShare)
                ? "No scored work can be shared yet. Sharing needs the person's yes."
                : picked.length > 0
                  ? `${people} picked.`
                  : "Pick work in the list first."}
            </p>
            {top.some((t) => t.canShare) ? (
              <>
                <h3 className="text-footnote mt-5 mb-2 font-medium text-label-2">Companies with the same need</h3>
                <MatchPicker matches={matches ?? []} value={toCompany} onChange={setToCompany} />
                <p className="text-footnote mt-4 text-pretty text-label-2">{RULE}</p>
                <Button onClick={() => setConfirming(true)} disabled={picked.length === 0 || !target} className="mt-5">
                  {target && picked.length > 0 ? `Offer ${people} to ${target.name}` : "Offer to the company"}
                </Button>
              </>
            ) : null}
          </Card>
        </div>
      </div>

      <Sheet open={confirming} onClose={() => setConfirming(false)} title={target ? `Offer ${people} to ${target.name}?` : "Offer"}>
        <ul className="rounded-[16px] bg-surface px-4 py-2">
          {picked.map((entry) => (
            <li key={entry.proofId} className="text-body tnum py-1.5 text-label">
              {workLabel(entry.proofLabel)}
            </li>
          ))}
        </ul>
        <p className="text-footnote mt-3 text-pretty text-label-2">{RULE}</p>
        <div className="mt-5 flex flex-col gap-2 min-[480px]:flex-row-reverse">
          <Button onClick={offer} loading={sending} className="min-[480px]:w-auto min-[480px]:flex-1">
            Offer
          </Button>
          <Button variant="secondary" onClick={() => setConfirming(false)} className="min-[480px]:w-auto min-[480px]:flex-1">
            Not now
          </Button>
        </div>
      </Sheet>

      <CopySheet open={reminding} title={reminder ? `Reminder to ${reminder.companyName}` : "Reminder"} text={reminder?.text ?? ""} onClose={() => setReminding(false)} />
    </Screen>
  );
}
