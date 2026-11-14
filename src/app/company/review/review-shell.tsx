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
const PHONE = "(max-width: 899px)";
const CAPTION = "Arrival order. Workprint never sorts people.";

/** The proof id in the URL, or null on the queue itself. */
function selectedFrom(pathname: string): string | null {
  return pathname.startsWith(`${BASE}/`) ? decodeURIComponent(pathname.slice(BASE.length + 1)) : null;
}

/** The inbox grid: a fixed 384px list beside the open proof, which takes the rest of the column. */
const GRID = "min-[900px]:grid min-[900px]:grid-cols-[384px_minmax(0,1fr)] min-[900px]:items-start min-[900px]:gap-6";
/** From 900px the list scrolls on its own and stays in view while the proof scrolls. */
const LIST = "min-[900px]:sticky min-[900px]:top-6 min-[900px]:max-h-[calc(100dvh-48px)] min-[900px]:overflow-y-auto min-[900px]:overscroll-contain";

/**
 * An inbox. From 900px: the list in a fixed 384px column with its own scroll, the open proof
 * beside it. On a phone one region at a time: the list, then the proof pushed over it with a
 * way back to the same place in the list. Render it inside Suspense: it reads the URL.
 */
export function ReviewShell({ children }: { children: ReactNode }) {
  const selectedId = selectedFrom(usePathname());
  const detail = selectedId !== null;
  const listScroll = useRef(0);

  // On a phone the list and the proof share the page's scroll: going back returns to the row.
  useLayoutEffect(() => {
    if (!detail && window.matchMedia(PHONE).matches) window.scrollTo({ top: listScroll.current });
  }, [detail]);

  return (
    <Screen
      page
      title={<span className={cx(detail && "max-[899px]:sr-only")}>Review</span>}
      subtitle={<span className={cx(detail && "max-[899px]:hidden")}>{CAPTION}</span>}
    >
      <div className={cx(GRID, detail && "max-[899px]:-mt-14")}>
        <aside
          aria-label="Review queue"
          onClickCapture={() => {
            if (window.matchMedia(PHONE).matches) listScroll.current = window.scrollY;
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
                  <ChevronLeft aria-hidden className="size-6" strokeWidth={2} />
                  <span className="text-body -ml-0.5">Queue</span>
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

/** The inbox's frame while the URL-dependent shell streams in: the title, the list rows and the proof. */
export function ReviewShellFallback() {
  return (
    <Screen page title="Review" subtitle={CAPTION}>
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
        <div className="hidden h-[520px] rounded-card bg-surface min-[900px]:block" />
      </div>
    </Screen>
  );
}
