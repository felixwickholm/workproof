import type { Metadata } from "next";
import { Suspense } from "react";
import { ProofPage, ProofSkeleton } from "./proof-page";

export const metadata: Metadata = { title: "Your proof" };

export default function PassportProofPage({ params }: PageProps<"/passport/[proofId]">) {
  return (
    <Suspense fallback={<ProofSkeleton />}>
      <ProofPage params={params} />
    </Suspense>
  );
}
