import type { Metadata } from "next";
import { Suspense } from "react";
import { SharedWork } from "./shared-work";

export const metadata: Metadata = {
  title: "Shared work",
  robots: { index: false, follow: false },
};

/** A link the person made to their work. Public by design, and never indexed. */
export default function SharedWorkPage({ params }: PageProps<"/work/[token]">) {
  return (
    <Suspense fallback={null}>
      <SharedWork params={params} />
    </Suspense>
  );
}
