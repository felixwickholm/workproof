import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";

/** The old address of one piece of work. */
export default function PassportProofPage({ params }: PageProps<"/passport/[proofId]">) {
  return (
    <Suspense fallback={null}>
      <ToMyWork params={params} />
    </Suspense>
  );
}

async function ToMyWork({ params }: { params: Promise<{ proofId: string }> }): Promise<ReactNode> {
  const { proofId } = await params;
  redirect(`/my-work/${encodeURIComponent(proofId)}`);
}
