import { Suspense } from "react";
import { ProofReview, ReviewSkeleton } from "./proof-review";

export default function ProofReviewPage({ params }: PageProps<"/company/review/[proofId]">) {
  return (
    <Suspense fallback={<ReviewSkeleton />}>
      <ProofReview params={params} />
    </Suspense>
  );
}
