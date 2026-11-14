import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Wordmark } from "../wordmark";
import { TabBar } from "../tab-bar";
import { cx } from "./cx";
import { TopBar } from "./top-bar";

type Back = { href: string; label?: string } | { onBack: () => void; label?: string };

interface Props {
  children: ReactNode;
  /** Large, left-aligned title like an iOS large title. */
  title?: ReactNode;
  /** Muted line under the title. */
  subtitle?: ReactNode;
  back?: Back;
  /** Centre of the top bar, for example a step progress. */
  center?: ReactNode;
  /** Right side of the top bar, for example a timer. */
  right?: ReactNode;
  /** Sticky glass bar with the screen's main action. */
  bottom?: ReactNode;
  /** Show the talent tab bar (Tasks, My proofs). */
  tabs?: boolean;
  /** From 900px wide the page grows to two panes; the bottom bar's action sits over the right pane. */
  wide?: boolean;
}

export function Screen({ children, title, subtitle, back, center, right, bottom, tabs, wide }: Props) {
  return (
    <div className={cx("mx-auto flex min-h-dvh w-full max-w-[440px] flex-col", wide && "min-[900px]:max-w-[1120px] min-[900px]:px-6")}>
      <TopBar>
        <div className="grid h-11 grid-cols-[auto_1fr_auto] items-center gap-3 px-2">
          <div className="flex min-w-11 items-center">{back ? <BackButton back={back} /> : <Wordmark className="px-3" />}</div>
          <div className="flex min-w-0 justify-center">{center}</div>
          <div className="flex min-w-11 items-center justify-end pr-2">{right}</div>
        </div>
      </TopBar>

      <main
        className={cx(
          // Clip sideways so a step sliding in never widens the page on a phone.
          "flex flex-1 flex-col overflow-x-clip px-5 pt-3",
          // Below 360px two-button bars stack, so they need more room.
          bottom
            ? "pb-[calc(112px+env(safe-area-inset-bottom,0px))] max-[359px]:pb-[calc(176px+env(safe-area-inset-bottom,0px))]"
            : tabs ? "pb-[calc(96px+env(safe-area-inset-bottom,0px))]" : "pb-10",
        )}
      >
        {title ? (
          <div className="rise mb-6">
            <h1 className="text-large-title font-bold text-balance">{title}</h1>
            {subtitle ? <p className="text-body text-label-2 mt-2 text-pretty">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>

      {bottom ? <BottomBar wide={wide}>{bottom}</BottomBar> : null}
      {tabs && !bottom ? <TabBar /> : null}
    </div>
  );
}

/** Question-style title used inside step flows. */
export function StepTitle({ children, sub, long }: { children: ReactNode; sub?: ReactNode; long?: boolean }) {
  return (
    <div className="mt-2 mb-6">
      <h1 className={cx(long ? "text-title-3" : "text-title", "font-bold text-pretty")}>{children}</h1>
      {sub ? <p className="text-body mt-2 text-label-2 text-pretty">{sub}</p> : null}
    </div>
  );
}

export function BottomBar({ children, wide }: { children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20">
      <div className={cx("glass highlight mx-auto w-full max-w-[440px] px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]", wide && "min-[900px]:max-w-[1120px] min-[900px]:px-11")}>
        {wide ? <div className="min-[900px]:ml-auto min-[900px]:w-[420px]">{children}</div> : children}
      </div>
    </div>
  );
}

/** Two panes from 900px: the task and its material on the left, the answer on the right and in view while scrolling. */
export function TwoPane({ task, answer }: { task: ReactNode; answer: ReactNode }) {
  return (
    <div className="min-[900px]:grid min-[900px]:grid-cols-[minmax(0,1fr)_420px] min-[900px]:items-start min-[900px]:gap-10">
      <div className="min-w-0">{task}</div>
      <div className="mt-5 min-[900px]:sticky min-[900px]:top-[68px] min-[900px]:mt-2">{answer}</div>
    </div>
  );
}

function BackButton({ back }: { back: Back }) {
  const inner = (
    <>
      <ChevronLeft aria-hidden className="size-7" strokeWidth={2.2} />
      {back.label ? <span className="text-body -ml-1">{back.label}</span> : null}
    </>
  );
  const classes = "press flex h-11 min-w-11 items-center pr-2 text-label";
  if ("href" in back) {
    return (
      <Link href={back.href} className={classes} aria-label={back.label ? undefined : "Back"}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={back.onBack} className={classes} aria-label={back.label ? undefined : "Back"}>
      {inner}
    </button>
  );
}
