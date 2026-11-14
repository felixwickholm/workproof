"use client";

import { Play } from "lucide-react";
import { startTour } from "@/components/shell/demo-actions";
import { cx } from "@/components/ui/cx";
import { TOUR_LABEL, TRY_LABEL } from "./copy";
import { ArrowLink, BUTTON } from "./parts";

/** The page's one large button: it starts the one-minute tour. */
function TourButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => startTour("minute")}
      data-primary=""
      data-tour-start="minute"
      className={cx(BUTTON, "bg-accent text-accent-ink hover:brightness-110", className)}
    >
      <Play aria-hidden className="size-5" strokeWidth={2} fill="currentColor" />
      {TOUR_LABEL}
    </button>
  );
}

/** The tour button, then the quiet way to try a challenge yourself. The same pair at the top and at the close. */
export function StartActions({ className, center = false }: { className?: string; center?: boolean }) {
  return (
    <div
      className={cx(
        "flex flex-col gap-y-1 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:gap-x-7",
        center && "items-center min-[480px]:justify-center",
        className,
      )}
    >
      <TourButton className="max-[479px]:w-full" />
      <ArrowLink href="/try" className={cx("text-[17px] font-semibold", !center && "max-[479px]:self-center")}>
        {TRY_LABEL}
      </ArrowLink>
    </div>
  );
}
