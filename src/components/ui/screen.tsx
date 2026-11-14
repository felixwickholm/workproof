import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { Wordmark } from "../wordmark";
import { cx } from "./cx";
import { TopBar } from "./top-bar";

type Back = { href: string; label?: string } | { onBack: () => void; label?: string };

interface Props {
  children: ReactNode;
  /**
   * The page's h1, at Proven's sizes. A view's home sets it as the greeting (serif, 48px on a laptop
   * and 36px on a phone); every other page sets a sans 36px/600 title. Both sit 64px from the top
   * on a laptop.
   */
  title?: ReactNode;
  /** Muted line under the title: the finding or the scope, never instructions. */
  subtitle?: ReactNode;
  /** Set the title as the mode home's greeting, in the serif. */
  greeting?: boolean;
  back?: Back;
  /** Centre of the top bar, for example a step progress. */
  center?: ReactNode;
  /** Right side of the top bar, for example a timer. */
  right?: ReactNode;
  /** Sticky glass bar with the screen's main action. */
  bottom?: ReactNode;
  /** From 900px wide the page grows to two panes; the bottom bar's action sits over the right pane. */
  wide?: boolean;
  /** From 900px wide the page grows to the full 76rem column for a table, a list beside its detail, or a grid. */
  page?: boolean;
  /** The bottom bar holds two stacked buttons. */
  tall?: boolean;
  /** The bottom bar is for phones only; from 900px the page places its actions itself. */
  phoneBar?: boolean;
  /** "grey": the page sits on the light grey surface, so a white list or card reads as on a job board. */
  tone?: "grey";
}

/**
 * A phone screen that grows up on a laptop: from 900px it is a centred 560px column with its
 * action inline after the content, or Proven's full 76rem column for two panes, a table or a grid.
 * Inside the app frame the frame names the product, so the bar here only appears when the page
 * has something of its own to put in it (a back link, a progress, a timer).
 */
export function Screen({ children, title, subtitle, greeting, back, center, right, bottom, wide, page, tall, phoneBar, tone }: Props) {
  const column = !wide && !page;
  const ownBar = Boolean(back || center || right);
  return (
    <div
      data-page-tone={tone}
      className={cx(
        "mx-auto flex min-h-dvh w-full max-w-[440px] flex-col in-shell:min-h-0",
        (wide || page) && "min-[900px]:max-w-(--page-width) min-[900px]:px-8",
        column && "min-[900px]:max-w-[592px] min-[900px]:px-4",
      )}
    >
      <TopBar className={cx(!ownBar && "in-shell:hidden")}>
        <div className="grid h-11 grid-cols-[auto_1fr_auto] items-center gap-3 px-2 min-[900px]:h-14">
          <div className="flex min-w-11 items-center">{back ? <BackButton back={back} /> : <Wordmark className="px-2" />}</div>
          <div className="flex min-w-0 justify-center">{center}</div>
          <div className="flex min-w-11 items-center justify-end pr-2">{right}</div>
        </div>
      </TopBar>

      <main
        className={cx(
          // Clip sideways so a step sliding in never widens the page on a phone.
          "flex flex-1 flex-col overflow-x-clip px-4 pt-3 min-[900px]:px-0",
          ownBar ? "min-[900px]:pt-6" : "min-[900px]:pt-12 in-shell:pt-6 min-[900px]:in-shell:pt-16",
          // Below 360px two-button bars stack, so they need more room.
          bottom
            ? tall
              ? "pb-[calc(160px+env(safe-area-inset-bottom,0px))]"
              : "pb-[calc(96px+env(safe-area-inset-bottom,0px))] max-[359px]:pb-[calc(160px+env(safe-area-inset-bottom,0px))]"
            : "pb-12",
          (column || page) && "min-[900px]:flex-none min-[900px]:pb-12",
        )}
      >
        {title ? (
          <div className={cx("rise", greeting ? "mb-8 min-[900px]:mb-10" : "mb-6 min-[900px]:mb-8")}>
            <h1
              className={cx(
                "text-balance text-label",
                greeting ? "text-greeting max-w-[28ch]" : "text-[32px] leading-[40px] font-normal min-[900px]:text-h1",
              )}
            >
              {title}
            </h1>
            {subtitle ? <p className="text-body mt-3 max-w-[60ch] text-pretty text-label-2 min-[900px]:text-lead">{subtitle}</p> : null}
          </div>
        ) : null}
        {children}
      </main>

      {bottom ? (
        <div data-bottom-bar className={cx(phoneBar && "min-[900px]:hidden")}>
          <BottomBar wide={wide} inline={column || page}>
            {bottom}
          </BottomBar>
        </div>
      ) : null}
    </div>
  );
}

/** The screen's main action: a glass bar on a phone; on a laptop column it sits inline after the content. */
function BottomBar({ children, wide, inline }: { children: ReactNode; wide?: boolean; inline?: boolean }) {
  return (
    <div className={cx("fixed inset-x-0 bottom-0 z-20 min-[900px]:in-shell:left-(--sidebar-width)", inline && "min-[900px]:static min-[900px]:mb-16")}>
      <div
        className={cx(
          "glass mx-auto w-full max-w-[440px] px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom,0px))] shadow-[inset_0_0.5px_0_var(--color-separator)]",
          wide && "min-[900px]:max-w-(--page-width) min-[900px]:px-8",
          inline && "min-[900px]:max-w-none min-[900px]:bg-transparent min-[900px]:px-0 min-[900px]:pt-0 min-[900px]:shadow-none min-[900px]:backdrop-blur-none",
        )}
      >
        {wide ? <div className="min-[900px]:ml-auto min-[900px]:w-[420px]">{children}</div> : children}
      </div>
    </div>
  );
}

function BackButton({ back }: { back: Back }) {
  const inner = (
    <>
      <ChevronLeft aria-hidden className="size-6" strokeWidth={1.75} />
      {back.label ? <span className="text-body -ml-0.5">{back.label}</span> : null}
    </>
  );
  const classes = "press flex h-11 min-w-11 items-center pr-2 text-label transition-colors duration-150 hover:text-label-2";
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
