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
const NARROW = "(max-width: 1299px)";
const CAPTION = "Oldest first.";

/** The proof id in the URL, or null on the queue itself. */
function selectedFrom(pathname: string): string | null {
  return pathname.startsWith(`${BASE}/`) ? decodeURIComponent(pathname.slice(BASE.length + 1)) : null;
}

/** From 1300px: a fixed 232px list beside the open work, which takes the rest of the column. */
const GRID = "min-[1300px]:grid min-[1300px]:grid-cols-[232px_minmax(0,1fr)] min-[1300px]:items-start min-[1300px]:gap-6";
/** From 1300px the list scrolls on its own and stays in view while the work scrolls. */
const LIST = "min-[1300px]:sticky min-[1300px]:top-6 min-[1300px]:max-h-[calc(100dvh-48px)] min-[1300px]:overflow-y-auto min-[1300px]:overscroll-contain";

/**
 * Scoring as an inbox. From 1300px: the list in a fixed column with its own scroll, the open work
 * beside it. Narrower, one region at a time: the list, then the work pushed over it with a way back
 * to the same place in the list. Render it inside Suspense: it reads the URL.
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
      title={<span className={cx(detail && "max-[1299px]:sr-only")}>Score work</span>}
      subtitle={<span className={cx(detail && "max-[1299px]:hidden")}>{CAPTION}</span>}
    >
      <div className={cx(GRID, detail && "max-[1299px]:-mt-14")}>
        <aside
          data-tour="queue"
          aria-label="Work to score"
          onClickCapture={() => {
            if (window.matchMedia(NARROW).matches) listScroll.current = window.scrollY;
          }}
          className={cx(detail && "max-[1299px]:hidden", LIST)}
        >
          <QueueList selectedId={selectedId} />
        </aside>
        <div className={cx("min-w-0", !detail && "max-[1299px]:hidden")}>
          {detail ? (
            <TopBar className="-mx-4 mb-2 min-[1300px]:hidden min-[900px]:mx-0">
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
      <div aria-busy className={GRID}>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-4 w-56" />
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 px-3 py-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
          ))}
        </div>
        <div className="hidden h-[520px] rounded-card bg-surface min-[1300px]:block" />
      </div>
    </Screen>
  );
}
