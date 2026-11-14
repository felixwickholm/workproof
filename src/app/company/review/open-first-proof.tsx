"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { proofHref } from "@/components/company/format";
import { firstToOpen } from "@/components/company/review-order";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWide } from "@/components/ui/sheet";
import { ReviewSkeleton } from "./[proofId]/proof-review";
import { useReview } from "./review-context";

/**
 * A laptop never shows an empty reading pane: the oldest proof to read opens by itself, and the
 * address names it, so a reload or a shared link lands on the same proof. A phone keeps the list.
 */
export function OpenFirstProof() {
  const { queue } = useReview();
  const router = useRouter();
  const wide = useWide();
  const first = queue ? firstToOpen(queue) : null;

  useEffect(() => {
    if (wide && first) router.replace(proofHref(first));
  }, [wide, first, router]);

  if (queue && !first) {
    return (
      <Card>
        <h2 className="text-headline font-semibold">Nothing to read yet</h2>
        <p className="text-subhead mt-1 text-pretty text-label-2">Work arrives here without a name, in the order it came. Post a task, and the first proof opens here.</p>
        <Button href="/company" size="sm" className="mt-4">
          Post a task
        </Button>
      </Card>
    );
  }
  return <ReviewSkeleton />;
}
