import type { Metadata } from "next";
import { Suspense } from "react";
import { ChallengeSkeleton, CityChallengeView } from "./challenge-view";

export const metadata: Metadata = { title: "Challenge results" };

export default function CityChallengePage({ params }: PageProps<"/city/challenges/[id]">) {
  return (
    <Suspense fallback={<ChallengeSkeleton />}>
      <CityChallengeView params={params} />
    </Suspense>
  );
}
