import type { Metadata } from "next";
import { Suspense } from "react";
import { ReviewProvider } from "./review-context";
import { ReviewShell, ReviewShellFallback } from "./review-shell";

export const metadata: Metadata = { title: "Review · Tryout" };

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
