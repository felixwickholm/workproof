"use client";

import { ChevronRight, Link2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { CardControls } from "@/components/portfolio/portfolio-card";
import { PortfolioView } from "@/components/portfolio/portfolio-view";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/toast";
import { api, currentTalentId, errorText } from "@/lib/client/api";
import type { PassportEntry, Portfolio } from "@/lib/domain/types";

/** Copies a shared link as a full address. */
function copyLink(link: string) {
  const url = new URL(link, window.location.origin).toString();
  navigator.clipboard?.writeText(url).then(
    () => toast("Link copied"),
    () => toast(url),
  );
}

/**
 * "My work": the person's portfolio. Every task they finished at an Espoo event, newest first, with what
 * each company wrote back. Private by default; the person makes a link to one task or to all of it.
 */
export function MyWorkList() {
  const { data, error, loading, retry, reload } = useSeekerData(
    async (talentId) => {
      const [portfolio, home] = await Promise.all([
        api.portfolio(talentId),
        api.seekerHome(talentId),
      ]);
      return {
        portfolio,
        practice: home.passport.filter((e) => e.challenge.kind === "taster"),
      };
    },
  );
  const [failure, setFailure] = useState<string | null>(null);

  async function change(run: (talentId: string) => Promise<unknown>) {
    setFailure(null);
    try {
      await run(await currentTalentId());
      await reload();
    } catch (e) {
      setFailure(errorText(e));
    }
  }

  const controlsFor = (cardId: string): CardControls => ({
    onLink: (on) => change((t) => api.setPortfolioLink(t, cardId, on)),
    onDecisionShown: (shown) =>
      change((t) => api.setDecisionShown(t, cardId, shown)),
    onCopy: copyLink,
  });

  const empty =
    data && data.portfolio.cards.length === 0 && data.practice.length === 0;
  return (
    <Screen
      title="My work"
      subtitle="Every challenge you finished at an Espoo event, newest first, with each reviewer's score and words. Private until you share it."
      page
    >
      {loading && !data ? (
        <div aria-busy className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-[128px] rounded-card" />
            ))}
          </div>
          <Skeleton className="h-[420px] rounded-card" />
        </div>
      ) : error && !data ? (
        <ErrorState error={error} what="your work" onRetry={retry} />
      ) : empty ? (
        <EmptyState
          action={
            <Button href="/seeker" size="sm">
              See the challenges
            </Button>
          }
        >
          Nothing here yet. Do a challenge, and it shows here.
        </EmptyState>
      ) : data ? (
        <div data-tour="own-work-list">
          {failure ? (
            <p
              role="alert"
              className="text-subhead mb-4 rounded-inner bg-negative-wash px-4 py-3 text-negative-ink"
            >
              {failure}
            </p>
          ) : null}
          <PortfolioView
            portfolio={data.portfolio}
            controlsFor={controlsFor}
            aside={
              <>
                <ShareAll
                  portfolio={data.portfolio}
                  onChange={(on) =>
                    change((t) => api.setPortfolioLink(t, null, on))
                  }
                />
                {data.practice.length ? (
                  <Practice entries={data.practice} />
                ) : null}
              </>
            }
          />
        </div>
      ) : null}
    </Screen>
  );
}

const LABEL = "Share all my work by link";

/** One link to the whole portfolio. It shows the work and the written answers, never the name. */
function ShareAll({
  portfolio,
  onChange,
}: {
  portfolio: Portfolio;
  onChange: (on: boolean) => Promise<void>;
}) {
  return (
    <section
      aria-label="Share"
      className="rise rounded-card bg-surface p-5 min-[900px]:p-6"
    >
      <div className="flex items-center gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-body font-medium text-label">{LABEL}</p>
          <p className="text-footnote mt-0.5 text-pretty text-label-2">
            {portfolio.link
              ? "Anyone with the link sees every task here and the written answers. Not your name or contact."
              : "Off. Each task is private unless you share it."}
          </p>
        </div>
        <Switch
          checked={Boolean(portfolio.link)}
          onChange={(on) => void onChange(on)}
          label={LABEL}
        />
      </div>
      {portfolio.link ? (
        <button
          type="button"
          onClick={() => copyLink(portfolio.link!)}
          className="text-subhead press mt-2 inline-flex h-11 items-center gap-2 font-medium text-link"
        >
          <Link2 aria-hidden className="size-4" strokeWidth={1.75} />
          Copy the link
        </button>
      ) : null}
    </section>
  );
}

/** Practice tasks have no company, so they are not in the portfolio. They stay one tap away. */
function Practice({ entries }: { entries: PassportEntry[] }) {
  return (
    <section
      aria-labelledby="practice-title"
      className="rise rounded-card bg-surface p-5 min-[900px]:p-6"
    >
      <h2 id="practice-title" className="text-section text-label">
        Practice
      </h2>
      <p className="text-footnote mt-1 text-label-2">No company sees these.</p>
      <ul className="mt-3 flex flex-col">
        {entries.map((e) => (
          <li
            key={e.proof.proofId}
            className="border-separator not-first:border-t"
          >
            <Link
              href={`/my-work/${e.proof.proofId}`}
              className="text-subhead group flex min-h-11 items-center justify-between gap-3 py-2 font-medium text-label"
            >
              {e.challenge.title}
              <ChevronRight
                aria-hidden
                className="size-4 shrink-0 text-label-2 transition-transform duration-150 group-hover:translate-x-0.5"
                strokeWidth={1.75}
              />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
