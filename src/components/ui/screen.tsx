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
  /** From 900px wide the page grows to 1040px for a list beside its detail, or a grid. */
  page?: boolean;
  /** The bottom bar holds two stacked buttons. */
  tall?: boolean;
  /** The bottom bar is for phones only; from 900px the page places its actions itself. */
  phoneBar?: boolean;
}

/**
 * A phone screen that grows up on a laptop: from 900px it is a centred 560px column with larger
 * type and its action inline after the content, or a wider page for two panes or a grid.
 */
export function Screen({ children, title, subtitle, back, center, right, bottom, tabs, wide, page, tall, phoneBar }: Props) {
  const column = !wide && !page;
  return (
    <div
      className={cx(
        "mx-auto flex min-h-dvh w-full max-w-[440px] flex-col",
        wide && "min-[900px]:max-w-[1120px] min-[900px]:px-6",
        page && "min-[900px]:max-w-[1040px] min-[900px]:px-6",
        column && "min-[900px]:max-w-[560px]",
      )}
    >
      <TopBar>
        <div className="grid h-11 grid-cols-[auto_1fr_auto] items-center gap-3 px-2">
          <div className="flex min-w-11 items-center">{back ? <BackButton back={back} /> : <Wordmark className="px-3" />}</div>
          <div className="flex min-w-0 justify-center">{center}</div>
          <div className="flex min-w-11 items-center justify-end pr-2">
            {right}
            {tabs ? <TabLinks /> : null}
          </div>
        </div>
      </TopBar>

      <main
        className={cx(
          // Clip sideways so a step sliding in never widens the page on a phone.
          "flex flex-1 flex-col overflow-x-clip px-5 pt-3 min-[900px]:pt-8",
          // Below 360px two-button bars stack, so they need more room.
          bottom
            ? tall
              ? "pb-[calc(176px+env(safe-area-inset-bottom,0px))]"
              : "pb-[calc(112px+env(safe-area-inset-bottom,0px))] max-[359px]:pb-[calc(176px+env(safe-area-inset-bottom,0px))]"
            : tabs ? "pb-[calc(96px+env(safe-area-inset-bottom,0px))]" : "pb-10",
          (column || page) && "min-[900px]:flex-none min-[900px]:pb-10",
        )}
      >
        {title ? (
          <div className="rise mb-6 min-[900px]:mb-8">
            <h1 className="text-large-title font-bold text-balance min-[900px]:text-[44px] min-[900px]:leading-[48px]">{title}</h1>
            {subtitle ? <p className="text-body text-label-2 mt-2 text-pretty min-[900px]:text-[19px] min-[900px]:leading-[27px]">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>

      {bottom ? (
        <div className={cx(phoneBar && "min-[900px]:hidden")}>
          <BottomBar wide={wide} inline={column || page}>
            {bottom}
          </BottomBar>
        </div>
      ) : null}
      {tabs && !bottom ? (
        <div className="min-[900px]:hidden">
          <TabBar />
        </div>
      ) : null}
    </div>
  );
}

/** On a laptop the two talent tabs sit in the top bar instead of a phone tab bar. */
function TabLinks() {
  return (
    <div className="hidden min-[900px]:flex">
      <TabBar inline />
    </div>
  );
}

/** Question-style title used inside step flows. */
export function StepTitle({ children, sub, long }: { children: ReactNode; sub?: ReactNode; long?: boolean }) {
  return (
    <div className="mt-2 mb-6">
      <h1 className={cx(long ? "text-title-3 min-[900px]:text-[26px] min-[900px]:leading-[32px]" : "text-title min-[900px]:text-[34px] min-[900px]:leading-[40px]", "font-bold text-pretty")}>
        {children}
      </h1>
      {sub ? <p className="text-body mt-2 text-label-2 text-pretty">{sub}</p> : null}
    </div>
  );
}

/** The screen's main action: a glass bar on a phone; on a laptop column it sits inline after the content. */
function BottomBar({ children, wide, inline }: { children: ReactNode; wide?: boolean; inline?: boolean }) {
  return (
    <div className={cx("fixed inset-x-0 bottom-0 z-20", inline && "min-[900px]:static min-[900px]:mb-16")}>
      <div
        className={cx(
          "glass highlight mx-auto w-full max-w-[440px] px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))]",
          wide && "min-[900px]:max-w-[1120px] min-[900px]:px-11",
          inline && "min-[900px]:max-w-[560px] min-[900px]:bg-transparent min-[900px]:shadow-none min-[900px]:backdrop-blur-none min-[900px]:pt-0",
        )}
      >
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
