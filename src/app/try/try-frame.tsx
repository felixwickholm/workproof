"use client";

import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import { TopBar } from "@/components/ui/top-bar";
import { stepWords } from "./try-copy";
import { useKeyboardInset } from "./use-keyboard-inset";

export type Back = { href: string } | { onBack: () => void };

interface Props {
  children: ReactNode;
  back?: Back;
  /** One-based step and the number of steps: a 4px bar and "Step 2 of 5" in words. */
  progress?: { current: number; total: number };
  /** Right of the top bar: the timer. */
  right?: ReactNode;
  /** The step's main action, in a bar that stays above the keyboard. */
  action?: ReactNode;
}

/** The pinned action bar's height, so the page always scrolls clear of it, however tall the bar grows. */
function useHeight(): [(element: HTMLDivElement | null) => void, number] {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    if (!element) return;
    const observer = new ResizeObserver(() => setHeight(element.offsetHeight));
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, height];
}

/**
 * One question per screen, phone first: a 480px column on any screen, an opaque bar on top with the
 * progress, and the main action pinned to the bottom. When the keyboard opens, the bar rides on top
 * of it, so the next step is always one tap away.
 */
export function TryFrame({ children, back, progress, right, action }: Props) {
  const keyboard = useKeyboardInset();
  const [measureBar, barHeight] = useHeight();
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[480px] flex-col in-shell:min-h-0">
      {back || progress || right ? (
        <TopBar className="bg-ground">
          <div className="grid h-12 grid-cols-[auto_1fr_auto] items-center gap-3 px-2">
            <div className="min-w-11">{back ? <BackButton back={back} /> : null}</div>
            <p className="text-footnote text-center font-medium text-label-2 tnum">{progress ? stepWords(progress.current, progress.total) : null}</p>
            <div className="flex min-w-11 items-center justify-end">{right}</div>
          </div>
          {progress ? (
            <div
              role="progressbar"
              aria-label={stepWords(progress.current, progress.total)}
              aria-valuemin={1}
              aria-valuemax={progress.total}
              aria-valuenow={progress.current}
              className="mx-4 h-1 overflow-hidden rounded-full bg-fill"
            >
              <div
                className="h-full origin-left rounded-full bg-label transition-transform duration-300 ease-(--ease-out)"
                style={{ transform: `scaleX(${progress.current / progress.total})` }}
              />
            </div>
          ) : null}
        </TopBar>
      ) : null}
      <main
        style={{ "--action-h": `${barHeight}px` } as CSSProperties}
        className={cx("flex flex-1 flex-col overflow-x-clip px-4 pt-4", action ? "pb-[calc(var(--action-h)+24px)] min-[900px]:flex-none min-[900px]:pb-6" : "pb-12")}
      >
        {children}
      </main>
      {action ? (
        <div ref={measureBar} className="fixed inset-x-0 bottom-0 z-20 min-[900px]:static" style={keyboard ? { transform: `translateY(-${keyboard}px)` } : undefined}>
          <div
            className={cx(
              "glass mx-auto w-full max-w-[480px] px-4 pt-3 shadow-[inset_0_0.5px_0_var(--color-separator)] min-[900px]:bg-transparent min-[900px]:pt-0 min-[900px]:pb-16 min-[900px]:shadow-none min-[900px]:backdrop-blur-none",
              keyboard ? "pb-3" : "pb-[calc(12px+env(safe-area-inset-bottom,0px))]",
            )}
          >
            {action}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function BackButton({ back }: { back: Back }) {
  const classes = "press flex size-11 items-center justify-center rounded-full text-label transition-colors duration-150 hover:bg-fill";
  const icon = <ChevronLeft aria-hidden className="size-6" strokeWidth={2} />;
  if ("href" in back) {
    return (
      <Link href={back.href} aria-label="Back" className={classes}>
        {icon}
      </Link>
    );
  }
  return (
    <button type="button" onClick={back.onBack} aria-label="Back" className={classes}>
      {icon}
    </button>
  );
}
