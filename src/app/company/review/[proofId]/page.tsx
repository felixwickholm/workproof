import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { ProofReview, ReviewSkeleton } from "./proof-review";

export const metadata: Metadata = pageMeta({ title: "Score this work", description: "One piece of work without the name. Give 1 to 5 points for each core skill with a written reason, then decide: Invite to the event, Not now, or Score only, decide later." });

export default function ProofReviewPage({ params }: PageProps<"/company/review/[proofId]">) {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <ProofReview params={params} />
    </Suspense>
  );
}
