import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { ChallengeSkeleton, CityChallengeView } from "./challenge-view";

export const metadata: Metadata = pageMeta({ title: "Challenge results", description: "What came of one challenge for the City of Espoo: work handed in, scored, invited, talked and hired. Counts only, never names." });

export default function CityChallengePage({ params }: PageProps<"/city/challenges/[id]">) {
  return (
    <Suspense fallback={<ChallengeSkeleton />}>
      <CityChallengeView params={params} />
    </Suspense>
  );
}
