"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import { Screen } from "@/components/ui/screen";
import { Skeleton } from "@/components/ui/skeleton";
import { TopBar } from "@/components/ui/top-bar";
import { QueueList } from "./queue-list";

const BASE = "/company/review";
/** Below this width the list and the open work take turns, one region at a time. */
const NARROW = "(max-width: 899px)";
const CAPTION = "Oldest first.";

/** The proof id in the URL, or null on the queue itself. */
function selectedFrom(pathname: string): string | null {
  return pathname.startsWith(`${BASE}/`) ? decodeURIComponent(pathname.slice(BASE.length + 1)) : null;
}

/** From 900px the list is a switcher above the open work, so the work gets the page's full width. */
const STACK = "min-[900px]:flex min-[900px]:flex-col min-[900px]:gap-14";
/** From 900px the list sits in its own grey band, one line per work. */
const LIST = "min-[900px]:rounded-card min-[900px]:bg-surface min-[900px]:px-8 min-[900px]:pt-5 min-[900px]:pb-7";

/**
 * Scoring as an inbox. From 900px: the list as a switcher band above the open work, which reads at
 * full width with the score beside it. On a phone, one region at a time: the list, then the work
 * pushed over it with a way back to the same place in the list. Render it inside Suspense: it reads the URL.
 */
export function ReviewShell({ children }: { children: ReactNode }) {
  const selectedId = selectedFrom(usePathname());
  const detail = selectedId !== null;
  const listScroll = useRef(0);

  // When the list and the work take turns, they share the page's scroll: going back returns to the row.
  useLayoutEffect(() => {
    if (!detail && window.matchMedia(NARROW).matches) window.scrollTo({ top: listScroll.current });
  }, [detail]);

  return (
    <Screen
      page
      title={<span className={cx(detail && "max-[899px]:sr-only")}>Score work</span>}
      subtitle={<span className={cx(detail && "max-[899px]:hidden")}>{CAPTION}</span>}
    >
      <div className={cx(STACK, detail && "max-[899px]:-mt-14")}>
        <aside
          data-tour="queue"
          aria-label="Work to score"
          onClickCapture={() => {
            if (window.matchMedia(NARROW).matches) listScroll.current = window.scrollY;
          }}
          className={cx(detail && "max-[899px]:hidden", LIST)}
        >
          <QueueList selectedId={selectedId} />
        </aside>
        <div className={cx("min-w-0", !detail && "max-[899px]:hidden")}>
          {detail ? (
            <TopBar className="-mx-4 mb-2 min-[900px]:hidden">
              <div className="flex h-11 items-center px-2">
                <Link href={BASE} className="press flex h-11 items-center pr-3 text-label">
                  <ChevronLeft aria-hidden className="size-6" strokeWidth={1.75} />
                  <span className="text-body -ml-0.5">All work</span>
                </Link>
              </div>
            </TopBar>
          ) : null}
          {children}
        </div>
      </div>
    </Screen>
  );
}

/** The inbox's frame while the URL-dependent shell streams in: the title, the list rows and the work. */
export function ReviewShellFallback() {
  return (
    <Screen page title="Score work" subtitle={CAPTION}>
      <div aria-busy className={STACK}>
        <div className={cx("flex flex-col gap-3 min-[900px]:flex-row min-[900px]:flex-wrap", LIST)}>
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 px-4 py-4 min-[900px]:p-0">
              <Skeleton className="h-4 w-40 min-[900px]:h-12 min-[900px]:w-36 min-[900px]:rounded-full" />
              <Skeleton className="h-3 w-56 min-[900px]:hidden" />
            </div>
          ))}
        </div>
        <div className="hidden h-[520px] rounded-card bg-surface min-[900px]:block" />
      </div>
    </Screen>
  );
}
