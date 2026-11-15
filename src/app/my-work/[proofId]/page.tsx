import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { WorkPage, WorkSkeleton } from "./work-page";

export const metadata: Metadata = pageMeta({ title: "Your work", description: "One piece of your work: what the company read, what was hidden, and the reviewer's points and written reason." });

export default function MyWorkProofPage({ params }: PageProps<"/my-work/[proofId]">) {
  return (
    <Suspense fallback={<WorkSkeleton />}>
      <WorkPage params={params} />
    </Suspense>
  );
}
