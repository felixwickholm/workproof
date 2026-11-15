import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { Leaderboard, LeaderboardSkeleton } from "./leaderboard";

export const metadata: Metadata = pageMeta({ title: "Top work", description: "A challenge's top work, sorted by the reviewers' own totals out of 10. Software adds no order of its own." });

export default function ChallengeTopPage({ params }: PageProps<"/employer/challenges/[id]">) {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <Leaderboard params={params} />
    </Suspense>
  );
}
