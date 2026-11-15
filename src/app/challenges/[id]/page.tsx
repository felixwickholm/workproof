import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { ChallengeDetail, DetailSkeleton } from "./challenge-detail";

export const metadata: Metadata = pageMeta({ title: "Challenge", description: "One challenge from an Espoo company: the task, its 3 to 5 core skills, the time it takes, the places left and the facts under \"Good to know\"." });

export default function ChallengePage({ params }: PageProps<"/challenges/[id]">) {
  return (
    <Suspense fallback={<DetailSkeleton />}>
      <ChallengeDetail params={params} />
    </Suspense>
  );
}
