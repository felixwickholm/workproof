import type { Metadata } from "next";
import { Suspense } from "react";
import { WorkPage, WorkSkeleton } from "./work-page";

export const metadata: Metadata = { title: "My work" };

export default function MyWorkProofPage({ params }: PageProps<"/my-work/[proofId]">) {
  return (
    <Suspense fallback={<WorkSkeleton />}>
      <WorkPage params={params} />
    </Suspense>
  );
}
