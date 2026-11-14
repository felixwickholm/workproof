"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "@/components/ui/cx";
import { TopBar } from "@/components/ui/top-bar";
import { Wordmark } from "@/components/wordmark";
import { QueueList } from "./queue-list";

const BASE = "/company/review";

/**
 * Phone: the queue, or one proof with a back link. From 900px wide: the queue on the left
 * and the open proof on the right, like a mail client. Render it inside Suspense: it reads the URL.
 */
export function ReviewShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const selectedId = pathname.startsWith(`${BASE}/`) ? decodeURIComponent(pathname.slice(BASE.length + 1)) : null;
  const detail = selectedId !== null;

  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar>
        <div className="mx-auto grid h-11 w-full max-w-[440px] grid-cols-[auto_1fr_auto] items-center gap-3 px-2 min-[900px]:max-w-[1280px]">
          <div className="flex min-w-11 items-center">
            {detail ? (
              <Link href={BASE} className="press flex h-11 min-w-11 items-center pr-2 text-label min-[900px]:hidden">
                <ChevronLeft aria-hidden className="size-7" strokeWidth={2.2} />
                <span className="text-body -ml-1">Queue</span>
              </Link>
            ) : null}
            <Wordmark className={cx("px-3", detail && "hidden min-[900px]:flex")} />
          </div>
          <div />
          <Link
            href="/company"
            className="press text-subhead flex h-11 items-center gap-1 rounded-full pr-3 pl-2 font-semibold text-label-2 active:text-label"
          >
            <Plus aria-hidden className="size-[18px]" strokeWidth={2.2} />
            New task
          </Link>
        </div>
      </TopBar>

      <div className="mx-auto w-full max-w-[440px] flex-1 min-[900px]:grid min-[900px]:max-w-[1280px] min-[900px]:grid-cols-[400px_minmax(0,1fr)]">
        <aside className={cx(detail && "hidden", "min-[900px]:sticky min-[900px]:block min-[900px]:top-11 min-[900px]:h-[calc(100dvh-44px)] min-[900px]:overflow-y-auto min-[900px]:shadow-[inset_-0.5px_0_0_var(--color-separator)]")}>
          <QueueList selectedId={selectedId} />
        </aside>
        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}

/** The bar alone, shown while the URL-dependent shell streams in. */
export function ReviewShellFallback() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar>
        <div className="mx-auto flex h-11 w-full max-w-[440px] items-center px-2 min-[900px]:max-w-[1280px]">
          <Wordmark className="px-3" />
        </div>
      </TopBar>
    </div>
  );
}
