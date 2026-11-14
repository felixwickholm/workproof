"use client";

import { Play } from "lucide-react";
import { startTour } from "@/components/shell/demo-actions";
import { cx } from "@/components/ui/cx";
import { ArrowLink, BUTTON } from "./parts";

/** The two walkthroughs: about one minute through every core function, or Olena's longer story. */
type TourKind = "minute" | "story";

/** Starts a walkthrough by kind. */
const start = (kind: TourKind) => startTour(kind);

/** The page's main action: one large button that starts the one-minute walkthrough. */
export function StartButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => start("minute")}
      data-primary=""
      data-tour-start="minute"
      className={cx(BUTTON, "bg-accent text-accent-ink hover:brightness-110", className)}
    >
      <Play aria-hidden className="size-5" strokeWidth={2} fill="currentColor" />
      Start · 1 minute
    </button>
  );
}

const TEXT_ACTION = "press inline-flex min-h-11 items-center gap-1.5 text-[16px] font-semibold text-label underline-offset-4 hover:underline";

/**
 * The big Start button, then the two quieter ways in: Olena's whole story as a walkthrough, and
 * trying a task yourself. The same three at the top and at the close.
 */
export function StartActions({ className, center = false }: { className?: string; center?: boolean }) {
  return (
    <div className={cx("flex flex-col gap-y-2 min-[480px]:flex-row min-[480px]:flex-wrap min-[480px]:items-center min-[480px]:gap-x-6", center && "items-center min-[480px]:justify-center", className)}>
      <StartButton className="max-[479px]:w-full" />
      <div className={cx("flex flex-wrap items-center gap-x-5", center && "justify-center")}>
        <button type="button" onClick={() => start("story")} className={TEXT_ACTION}>
          Olena&apos;s story · 2 min
        </button>
        <ArrowLink href="/try" className="text-[16px] font-semibold">
          Try a task yourself
        </ArrowLink>
      </div>
    </div>
  );
}
