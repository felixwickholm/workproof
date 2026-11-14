"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { TabBar } from "../tab-bar";
import { cx } from "../ui/cx";
import { Toaster } from "../ui/toast";
import { useScrolled } from "../ui/top-bar";
import { AccountCard } from "./account-menu";
import { ModeSwitcher } from "./mode-switcher";
import { PartnerLine } from "./partner-line";
import { Brand } from "./brand";
import { SiteLinks } from "./site-links";
import { activeNavItem, isNavRoot, modeForPath, type Mode, type NavItem } from "./modes";
import { ShellContext, useShell } from "./shell-context";

/** A switch that never lands (a failed navigation) still brings the content back. */
const SWITCH_TIMEOUT_MS = 1500;

/**
 * The frame around the three views (Job seeker, Company, City of Espoo): a sidebar on a laptop, a
 * top bar and tab bar on a phone. "/" is the job seeker home, so the app opens inside this frame.
 * It lives in the root layout, so it stays put while pages change under it. Only the chrome reads
 * the URL (inside Suspense); the page itself never waits for it. Pages outside the views
 * (/for-judges, /how-it-works, /try) render without a frame.
 */
export function AppShell({ children }: { children: ReactNode }) {
  const [switching, setSwitching] = useState(false);
  const timer = useRef(0);
  const endSwitch = useCallback(() => {
    window.clearTimeout(timer.current);
    setSwitching(false);
  }, []);
  const beginSwitch = useCallback(() => {
    setSwitching(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setSwitching(false), SWITCH_TIMEOUT_MS);
  }, []);
  const api = useMemo(() => ({ beginSwitch, endSwitch }), [beginSwitch, endSwitch]);

  return (
    <ShellContext.Provider value={api}>
      <div className="shell-root min-h-dvh">
        <Suspense fallback={null}>
          <ShellChrome />
        </Suspense>
        <div className="shell-content min-[900px]:in-shell:pl-(--sidebar-width)" data-switching={switching || undefined}>
          {children}
        </div>
        <Toaster />
      </div>
    </ShellContext.Provider>
  );
}

function ShellChrome() {
  const path = usePathname();
  const mode = modeForPath(path);
  const { endSwitch } = useShell();
  const modeId = mode?.id;
  useEffect(() => {
    endSwitch();
  }, [modeId, endSwitch]);

  if (!mode) return null;
  const active = activeNavItem(path, mode.nav);
  // One destination needs no tab bar; pages pushed deeper (a task, a proof) hide it, like iOS.
  const tabs = mode.nav.length > 1 && isNavRoot(path, mode.nav);
  return (
    <div data-shell-on className="contents">
      <Sidebar mode={mode} active={active} />
      <PhoneBar mode={mode} />
      {tabs ? <TabBar items={mode.nav} activeHref={active?.href} label={mode.label} /> : null}
    </div>
  );
}

const navRow = "press flex h-10 items-center gap-2.5 rounded-[10px] px-3 text-subhead transition-colors duration-150";

/**
 * Laptop: only places people go. The view switcher on top, the view's pages, then one account card
 * (the rarely used demo actions sit in its menu), "for City of Espoo" and one quiet line of links to
 * the pages around the app at the foot.
 */
function Sidebar({ mode, active }: { mode: Mode; active: NavItem | null }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-(--sidebar-width) flex-col bg-ground px-3 pt-6 pb-4 shadow-[inset_-1px_0_0_var(--color-separator)] min-[900px]:flex">
      <Brand className="mx-3" />
      <ModeSwitcher mode={mode} variant="sidebar" className="mt-6" />
      <nav aria-label={mode.label} className="mt-4 flex flex-col gap-0.5">
        {mode.nav.map((item) => {
          const on = item.href === active?.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={on ? "page" : undefined}
              className={cx(navRow, on ? "bg-fill font-semibold text-label" : "font-medium text-label-2 hover:bg-fill hover:text-label")}
            >
              <item.Icon aria-hidden className="size-4 shrink-0" strokeWidth={1.75} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4">
        <AccountCard mode={mode} />
        <PartnerLine className="px-3" />
        <SiteLinks className="px-3" />
      </div>
    </aside>
  );
}

/** Phone: Business Espoo and WorkProof on the left, the view switcher on the right. Clear at rest, glass once content scrolls under it. */
function PhoneBar({ mode }: { mode: Mode }) {
  const scrolled = useScrolled();
  return (
    <header data-scrolled={scrolled || undefined} className="top-bar pt-safe sticky top-0 z-30 min-[900px]:hidden">
      <div className="flex h-(--phone-bar) items-center justify-between gap-3 pr-2 pl-4">
        {/* Under 360px the view switcher needs the whole bar. */}
        <Brand compact className="max-[359px]:hidden" />
        <ModeSwitcher mode={mode} variant="bar" />
      </div>
    </header>
  );
}
