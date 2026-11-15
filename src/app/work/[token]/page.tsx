import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { SharedWork } from "./shared-work";

export const metadata: Metadata = pageMeta({ title: "Shared work", description: "Work a person chose to share: the task, the work and, if they allow it, the reviewer's score and reason. No name and no contact.", index: false });

/** A link the person made to their work. Public by design, and never indexed. */
export default function SharedWorkPage({ params }: PageProps<"/work/[token]">) {
  return (
    <Suspense fallback={null}>
      <SharedWork params={params} />
    </Suspense>
  );
}
