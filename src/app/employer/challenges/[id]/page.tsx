import type { Metadata } from "next";
import { Suspense } from "react";
import { Leaderboard, LeaderboardSkeleton } from "./leaderboard";

export const metadata: Metadata = { title: "Top work" };

export default function ChallengeTopPage({ params }: PageProps<"/employer/challenges/[id]">) {
  return (
    <Suspense fallback={<LeaderboardSkeleton />}>
      <Leaderboard params={params} />
    </Suspense>
  );
}
