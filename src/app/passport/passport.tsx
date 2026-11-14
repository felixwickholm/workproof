"use client";

import { PassDetail } from "@/components/seeker/pass-detail";
import { ownersFrom, PASS_PX, STRIP_PX } from "@/components/seeker/pass-face";
import { passportCounts } from "@/components/seeker/pass-state";
import { PassStack } from "@/components/seeker/pass-stack";
import { NoPasses, usePassStack } from "@/components/seeker/passport-panel";
import { useSeekerData } from "@/components/seeker/use-seeker-data";
import { ErrorState } from "@/components/ui/error-state";
import { riseAt } from "@/components/ui/rise";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/client/api";
import type { SeekerHome } from "@/lib/domain/types";

/** Every proof the person handed in, as a wallet of passes, with the pass in front read beside it. */
export function Passport() {
  const { data, error, loading, retry } = useSeekerData((talentId) => api.seekerHome(talentId));
  return (
    <Screen title="Your proof passport" subtitle={data?.passport.length ? "Every proof you handed in. Tap a pass to bring it to the front." : "Every proof you hand in collects here."} page>
      {loading && !data ? (
        <PassportSkeleton />
      ) : error && !data ? (
        <ErrorState error={error} what="your proofs" onRetry={retry} />
      ) : data && data.passport.length === 0 ? (
        <div className="min-[900px]:max-w-[560px]">
          <NoPasses />
        </div>
      ) : data ? (
        <Wallet home={data} />
      ) : null}
    </Screen>
  );
}

function Wallet({ home }: { home: SeekerHome }) {
  const { entries, front, open, setFront } = usePassStack(home.passport);
  const ownersOf = ownersFrom(home.tasks);
  const reviewerOf = (companyName: string) =>
    open ? home.invitations.find((i) => i.proofId === open.proof.proofId && i.companyName === companyName)?.reviewer : undefined;

  return (
    <>
      <p className="rise text-greeting tnum mb-6 text-label min-[900px]:mb-8">{passportCounts(home.passport)}</p>
      <div className="grid grid-cols-1 gap-x-12 gap-y-6 min-[900px]:grid-cols-[560px_minmax(0,1fr)] min-[900px]:items-start">
        <div className="rise" style={riseAt(1)}>
          <PassStack entries={entries} front={front} onFront={setFront} ownersOf={ownersOf} />
        </div>
        {open ? (
          <section aria-label="The pass in front" className="rise rounded-card bg-surface p-5 min-[900px]:sticky min-[900px]:top-9 min-[900px]:p-6" style={riseAt(2)}>
            <PassDetail key={open.proof.proofId} entry={open} owners={ownersOf(open)} reviewerOf={reviewerOf} />
          </section>
        ) : null}
      </div>
    </>
  );
}

function PassportSkeleton() {
  return (
    <div aria-busy>
      <Skeleton className="h-9 w-[min(520px,90%)] min-[900px]:h-12" />
      <div className="mt-6 grid grid-cols-1 gap-x-12 gap-y-6 min-[900px]:mt-8 min-[900px]:grid-cols-[560px_minmax(0,1fr)]">
        <div className="relative" style={{ height: 2 * STRIP_PX + PASS_PX }}>
          {[0, 1, 2].map((i) => (
            <div key={i} className="absolute inset-x-0 rounded-card bg-surface shadow-[0_-1px_0_var(--color-ground)]" style={{ top: i * STRIP_PX, height: PASS_PX }} />
          ))}
        </div>
        <div className="h-[420px] rounded-card bg-surface" />
      </div>
    </div>
  );
}
