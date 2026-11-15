import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { Suspense } from "react";
import { ReviewProvider } from "./review-context";
import { ReviewShell, ReviewShellFallback } from "./review-shell";

export const metadata: Metadata = pageMeta({ title: "Score work", description: "Read work without the name. Give 1 to 5 points for each core skill with a written reason, then choose Invite to the event, Not now, or Score only, decide later.", path: "/company/review" });

/** The queue stays mounted while proofs open beside it (desktop) or over it (phone). */
export default function ReviewLayout({ children }: LayoutProps<"/company/review">) {
  return (
    <Suspense fallback={<ReviewShellFallback />}>
      <ReviewProvider>
        <ReviewShell>{children}</ReviewShell>
      </ReviewProvider>
    </Suspense>
  );
}
