"use client";

import { X } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { FormatIcon } from "@/components/seeker/task-format";
import { FORMAT_LABEL } from "@/components/words";
import type { Challenge } from "@/lib/domain/types";

interface Props {
  challenge: Challenge;
  /** The calm time ring. */
  timer: ReactNode;
  /** The recorder pill, the tour's `think-aloud`: in the top bar on a laptop, above the action on a phone. */
  pill: ReactNode;
  /** A "Sample session" label while a scripted demo plays. */
  sample?: boolean;
  /** Left of the main action: the typed think-aloud, or the one line about the recording. */
  aside: ReactNode;
  action: ReactNode;
  children: ReactNode;
}

/**
 * The work session as one full-height workspace: a slim top bar (leave, the challenge, the time, the
 * recorder), the work area, and a bottom bar with the one action. Nothing here scrolls away.
 */
export function SessionView({ challenge, timer, pill, sample, aside, action, children }: Props) {
  return (
    <div data-tour="do-challenge" className="flex min-h-dvh flex-col in-shell:min-h-[calc(100dvh-var(--phone-bar))] min-[900px]:in-shell:min-h-dvh">
      <header className="glass sticky top-0 z-20 shadow-[inset_0_-0.5px_0_var(--color-separator)] max-[899px]:in-shell:top-(--phone-bar)">
        <div className="mx-auto flex h-16 w-full max-w-[1280px] items-center gap-3 px-3 min-[900px]:h-[72px] min-[900px]:gap-5 min-[900px]:px-6">
          <Link href="/seeker" aria-label="Leave the challenge" className="press flex size-11 shrink-0 items-center justify-center rounded-full text-label hover:bg-fill">
            <X aria-hidden className="size-6" strokeWidth={1.75} />
          </Link>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <span className="flex shrink-0 items-center gap-1.5 text-label-2 max-[600px]:hidden">
              <FormatIcon format={challenge.format} className="size-5" />
              <span className="text-body font-medium">{FORMAT_LABEL[challenge.format]}</span>
            </span>
            <h1 className="text-body min-w-0 truncate font-semibold text-label min-[900px]:text-[18px]">{challenge.title}</h1>
            {sample ? <span className="text-footnote shrink-0 rounded-full bg-fill px-3 py-1 font-medium text-label">Sample session</span> : null}
          </div>
          <div className="shrink-0">{timer}</div>
          <div data-tour="think-aloud" className="hidden w-[min(440px,36vw)] shrink-0 min-[900px]:block">
            {pill}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 pt-6 pb-48 min-[900px]:px-6 min-[900px]:pt-10 min-[900px]:pb-36">{children}</main>

      <footer className="glass fixed inset-x-0 bottom-0 z-20 shadow-[inset_0_0.5px_0_var(--color-separator)] min-[900px]:in-shell:left-(--sidebar-width)">
        <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-3 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] min-[900px]:flex-row min-[900px]:items-center min-[900px]:gap-6 min-[900px]:px-6 min-[900px]:py-4">
          <div data-tour="think-aloud" className="min-[900px]:hidden">
            {pill}
          </div>
          <div className="min-w-0 flex-1">{aside}</div>
          <div className="shrink-0 min-[900px]:w-[280px]">{action}</div>
        </div>
      </footer>
    </div>
  );
}
