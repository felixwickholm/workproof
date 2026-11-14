import { Suspense } from "react";
import { ChallengeDetail, DetailSkeleton } from "./challenge-detail";

export default function ChallengePage({ params }: PageProps<"/challenges/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ChallengeDetail params={params} />
    </Suspense>
  );
}
