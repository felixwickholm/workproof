"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/client/api";
import { useResource } from "@/lib/client/use-resource";
import { RESET_EVENT, useResetDemo } from "../shell/demo-actions";
import { ThemeToggle } from "../theme/theme-toggle";
import { cx } from "../ui/cx";
import { Wordmark } from "../wordmark";
import { Arrivals } from "./arrivals";
import { QrCode } from "./qr-code";
import { isLocalOrigin, joinOrigin, tableCounter, tableJoinUrl, tableShortUrl } from "./table-copy";

/** New proofs and answers show within two seconds, while this screen is in view. */
const POLL_MS = 2000;

const noop = () => () => {};

/** The address this page was opened on; only known in the browser. */
function usePageOrigin() {
  return useSyncExternalStore(noop, () => window.location.origin, () => null);
}

/**
 * The booth's big screen. Left, fixed in place: the question and a code to scan. Right: practice
 * proofs arriving from phones at this table, as labels and tasks, scrolling in their own panel.
 * A name appears only after its person accepted an invitation on their own phone.
 */
export function TableScreen({ publicOrigin }: { publicOrigin: string | null }) {
  const pageOrigin = usePageOrigin();
  const session = useResource(() => api.demoSession(), []);
  const proofs = useResource(() => api.tableProofs(), [], { pollMs: POLL_MS });
  const { reset, busy } = useResetDemo();

  const reload = proofs.reload;
  useEffect(() => {
    const onReset = () => void reload();
    window.addEventListener(RESET_EVENT, onReset);
    return () => window.removeEventListener(RESET_EVENT, onReset);
  }, [reload]);

  const code = session.data?.code ?? null;
  const list = proofs.data ?? [];
  const names = list.filter((p) => p.invite?.status === "accepted").length;
  const origin = pageOrigin ? joinOrigin(pageOrigin, publicOrigin) : null;

  return (
    <div className="flex min-h-dvh flex-col bg-ground min-[1100px]:[@media(min-height:720px)]:h-dvh">
      <header className="flex h-16 shrink-0 items-center justify-between px-6 min-[1100px]:px-12">
        <Wordmark />
        <p className="text-footnote hidden text-label-2 min-[700px]:block">Built for the City of Espoo challenge, Junction 2026.</p>
      </header>

      <main className="grid flex-1 grid-cols-[minmax(0,1fr)] gap-6 px-6 pb-6 min-[1100px]:min-h-0 min-[1100px]:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] min-[1100px]:grid-rows-[minmax(0,1fr)] min-[1100px]:gap-12 min-[1100px]:px-12">
        <section aria-labelledby="table-question" className="flex min-w-0 flex-col pt-2 min-[1100px]:sticky min-[1100px]:top-0 min-[1100px]:self-start min-[1100px]:pt-6">
          <h1 id="table-question" className="font-serif text-[44px] leading-[48px] tracking-[-0.01em] text-balance text-label min-[1100px]:text-[56px] min-[1100px]:leading-[60px]">
            What&apos;s your dream job?
          </h1>
          <p className="mt-3 max-w-[32ch] text-[20px] leading-7 text-pretty text-label-2 min-[1100px]:text-[22px] min-[1100px]:leading-8">
            Scan. Do a 2-minute task. See what a company would see.
          </p>
          <JoinCode origin={origin} code={code} loading={session.loading} />
        </section>

        <section aria-labelledby="arriving" className="flex min-h-[420px] min-w-0 flex-col rounded-card bg-surface p-6 min-[1100px]:min-h-0 min-[1100px]:p-8">
          <div className="mb-5 flex shrink-0 flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 id="arriving" className="text-title font-semibold text-label">
              Arriving now
            </h2>
            <Counter proofs={list.length} names={names} />
          </div>
          <div className="-mx-2 min-h-0 flex-1 overflow-y-auto px-2 pb-1 [scrollbar-gutter:stable]">
            <Arrivals proofs={proofs.data} loading={proofs.loading} onInvited={() => void reload()} />
          </div>
        </section>
      </main>

      <footer className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-2 px-6 pb-4 min-[1100px]:px-12">
        <p className="text-caption flex-1 text-label-2">Demo data. All people and companies are invented.</p>
        <button
          type="button"
          onClick={reset}
          disabled={busy}
          className="press text-footnote flex h-11 items-center gap-2 rounded-full px-3 text-label-2 transition-colors duration-150 hover:bg-fill hover:text-label disabled:text-label-3"
        >
          <RotateCcw aria-hidden className={cx("size-4", busy && "animate-[spin_800ms_linear_infinite] motion-reduce:animate-none")} strokeWidth={1.7} />
          Reset demo
        </button>
        <ThemeToggle />
      </footer>
    </div>
  );
}

/** "3 proofs from this table · 1 name shown, …". The names figure ticks up when a person says yes. */
function Counter({ proofs, names }: { proofs: number; names: number }) {
  const reduce = useReducedMotion();
  const words = tableCounter(proofs, names);
  const [figure, ...rest] = words.names.split(" ");
  return (
    <p aria-live="polite" className="text-subhead text-pretty text-label-2 tnum">
      {words.proofs} ·{" "}
      <span className="relative inline-block overflow-hidden align-bottom">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={figure}
            className="inline-block font-semibold text-label"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(100%)" }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0%)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(-100%)" }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          >
            {figure}
          </motion.span>
        </AnimatePresence>
      </span>{" "}
      {rest.join(" ")}
    </p>
  );
}

/** The QR code and the same link in words. Without a share code, phones cannot join this table, and the screen says so. */
function JoinCode({ origin, code, loading }: { origin: string | null; code: string | null; loading: boolean }) {
  if (!origin || loading) return <div aria-hidden className="mt-8 size-[316px] rounded-card bg-surface" />;

  if (!code) {
    return (
      <div className="mt-8 max-w-[44ch] rounded-card bg-surface p-6">
        <p className="text-title-3 font-semibold text-label">{new URL(origin).host}/try</p>
        <p className="text-subhead mt-2 text-pretty text-label-2">
          This browser keeps no table code, so phones get their own practice space and their proofs do not appear here. Allow cookies for this site and reload to share the table.
        </p>
      </div>
    );
  }

  const url = tableJoinUrl(origin, code);
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="max-w-full rounded-card bg-ground p-2 shadow-[inset_0_0_0_1px_var(--color-separator)] [[data-theme=dark]_&]:bg-label">
          <QrCode value={url} label={`QR code: ${url}`} className="aspect-square h-auto w-[260px] max-w-full min-[1100px]:w-[300px]" />
        </div>
        <div className="min-w-0 pb-2">
          <p className="text-footnote text-label-2">Or type</p>
          <p className="text-title-3 mt-1 font-semibold text-label [overflow-wrap:anywhere]">{tableShortUrl(origin, code)}</p>
          <p className="text-footnote mt-4 text-label-2">Table code</p>
          <p className="mt-1 font-mono text-[28px] leading-8 tracking-[0.12em] text-label">{code}</p>
          <p className="text-subhead mt-5 text-label">No sign-up. No app.</p>
        </div>
      </div>
      {isLocalOrigin(origin) ? (
        <p role="note" className="text-footnote mt-4 flex w-fit max-w-full items-start gap-2 rounded-inner bg-warning-wash px-3 py-2 text-pretty text-warning-ink">
          <TriangleAlert aria-hidden className="mt-px size-4 shrink-0" strokeWidth={1.8} />
          Phones cannot open localhost. Open this page from the site&apos;s public address.
        </p>
      ) : null}
    </div>
  );
}
