import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, EyeOff, Mic } from "lucide-react";
import type { ImpactCounts } from "@/lib/domain/types";
import { cx } from "@/components/ui/cx";
import { DOORS, type DoorId } from "./copy";
import type { LandingData, StorySkill } from "./data";

/** Bar heights of the think-aloud wave: a voice, drawn, not recorded. */
const WAVE = [6, 14, 22, 12, 28, 18, 9, 24, 16, 30, 12, 20, 8, 15, 6] as const;

/** The small card each door's picture sits on: the app's raised tone, one size for all three. */
const PICTURE = "flex h-[80px] w-[176px] rounded-[16px] bg-ground px-3.5 py-3";

/** Looking for work: the person talks while they work. A recording microphone and a voice wave, no camera. */
function ThinkAloudWave() {
  return (
    <span className={cx(PICTURE, "items-center gap-3")}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-label text-ground">
        <Mic className="size-4" strokeWidth={2} />
      </span>
      <span className="flex h-8 items-center gap-[3px]">
        {WAVE.map((h, i) => (
          <span key={i} className="w-[3px] rounded-full bg-label/60" style={{ height: h }} />
        ))}
      </span>
    </span>
  );
}

/** An illustration of a reviewer's points, used until the story decision carries real ones. */
const SAMPLE_POINTS = [4, 3, 5] as const;

/**
 * Hiring: a proof whose name is covered, and the points a person gave each skill, 1 to 5. The
 * points are the story decision's own when it has them.
 */
function ScoredProof({ skills }: { skills: StorySkill[] }) {
  const points = skills.slice(0, 3).map((s, i) => s.points ?? SAMPLE_POINTS[i] ?? 3);
  return (
    <span className={cx(PICTURE, "flex-col justify-between")}>
      <span className="flex items-center gap-2">
        <EyeOff className="size-4 shrink-0 text-label-2" strokeWidth={2} />
        <span className="h-3 flex-1 rounded-[4px] bg-label/80" />
      </span>
      {points.map((n, row) => (
        <span key={row} className="flex items-center justify-between gap-1">
          <span className="h-1.5 w-12 rounded-full bg-label/10" />
          <span className="flex gap-1">
          {[1, 2, 3, 4, 5].map((p) => (
            <span key={p} className={cx("size-2.5 rounded-full", p <= n ? "bg-label" : "bg-label/15")} />
          ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * The city: the event's steps as columns (took, scored, invited, met, follow-up), on a square-root
 * scale so the later, smaller steps stay visible.
 */
function ImpactColumns({ impact }: { impact: ImpactCounts }) {
  const steps = [impact.took, impact.scored, impact.invited, impact.met, impact.followUps];
  const most = Math.max(1, impact.took);
  return (
    <span className={cx(PICTURE, "items-end gap-2")}>
      {steps.map((n, i) => (
        <span key={i} className="flex-1 rounded-[4px] bg-label" style={{ height: `${Math.max(8, Math.sqrt(n / most) * 100)}%`, opacity: 1 - i * 0.15 }} />
      ))}
    </span>
  );
}

/**
 * The three ways in, the main thing on the page. Each whole panel is one link; on a laptop each
 * carries a small picture of its view, built from the demo event; on a phone the panels stack.
 */
export function Doors({ data, className }: { data: LandingData; className?: string }) {
  const pictures: Record<DoorId, ReactNode> = {
    seeker: <ThinkAloudWave />,
    employer: <ScoredProof skills={data.story.skills} />,
    city: <ImpactColumns impact={data.impact} />,
  };
  return (
    <nav aria-label="Choose who you are" className={className}>
      <ul className="grid gap-3 min-[1024px]:grid-cols-3 min-[1024px]:gap-4">
        {DOORS.map((door) => (
          <li key={door.id} className="flex">
            <Link
              href={door.href}
              data-door={door.id}
              className="group press relative flex w-full items-center gap-4 min-h-24 rounded-[28px] bg-surface px-5 py-4 transition-[box-shadow,background-color] duration-200 ease-(--ease-out) hover:shadow-[inset_0_0_0_1.5px_var(--color-control)] active:scale-[0.98] min-[640px]:px-6 min-[1024px]:min-h-[232px] min-[1024px]:flex-col min-[1024px]:items-stretch min-[1024px]:justify-start min-[1024px]:gap-6 min-[1024px]:p-6 min-[1100px]:min-h-[272px] min-[1100px]:gap-8 min-[1100px]:p-7"
            >
              <span aria-hidden className="hidden min-[640px]:flex min-[1024px]:h-20 min-[1024px]:items-start">
                {pictures[door.id]}
              </span>
              <span className="flex min-w-0 flex-1 flex-col min-[1024px]:flex-none">
                <span className="text-[26px] leading-[30px] font-semibold tracking-[-0.025em] text-balance text-label min-[400px]:text-[28px] min-[400px]:leading-[32px] min-[1100px]:text-[32px] min-[1100px]:leading-[36px]">
                  {door.label}
                </span>
                <span className="mt-1 text-[17px] leading-[23px] text-pretty text-label-2 min-[1024px]:mt-2 min-[1024px]:pr-12 min-[1100px]:text-[18px] min-[1100px]:leading-[25px]">
                  {door.line}
                </span>
              </span>
              <span
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ground text-label transition-colors duration-200 group-hover:bg-label group-hover:text-ground min-[1024px]:absolute min-[1024px]:right-6 min-[1024px]:bottom-6 min-[1024px]:size-11 min-[1100px]:right-7 min-[1100px]:bottom-7"
              >
                <ArrowRight className="size-5 transition-transform duration-200 ease-(--ease-out) group-hover:translate-x-0.5" strokeWidth={2} />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
