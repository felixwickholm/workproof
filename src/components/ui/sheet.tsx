"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cx } from "./cx";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** "full" fills the phone screen for a moment that deserves the whole view. */
  size?: "auto" | "full";
  /** Hide the visible title; it stays as the dialog's name for screen readers. */
  hideTitle?: boolean;
}

const WIDE = "(min-width: 900px)";
const noop = () => () => {};

function subscribeWide(listener: () => void) {
  const query = window.matchMedia(WIDE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/** True from 900px wide, where a sheet becomes a centred dialog. */
function useWide() {
  return useSyncExternalStore(subscribeWide, () => window.matchMedia(WIDE).matches, () => false);
}

/**
 * Bottom sheet on a phone, centred dialog from 900px. It renders at body level, so no blurred
 * parent can make it see-through. Tap the dimmed area or press Escape to close.
 */
export function Sheet({ open, onClose, title, children, size = "auto", hideTitle }: Props) {
  const reduce = useReducedMotion();
  const wide = useWide();
  // The portal needs document.body, so nothing renders on the server.
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  const dialog = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  // Keyboard: focus moves into the sheet, Tab stays inside it, Escape closes, and focus returns after.
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    dialog.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return closeRef.current();
      if (e.key !== "Tab" || !dialog.current) return;
      const items = dialog.current.querySelectorAll<HTMLElement>("button:not(:disabled), input, textarea, a[href]");
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      opener?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  const full = size === "full";
  const motionProps = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: 0.15 } }
    : wide
      ? {
          initial: { opacity: 0, scale: 0.97 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.97 },
          transition: { duration: 0.2, ease: [0.23, 1, 0.32, 1] as const },
        }
      : {
          initial: { y: "100%" },
          animate: { y: 0 },
          exit: { y: "100%" },
          transition: { duration: 0.32, ease: [0.32, 0.72, 0, 1] as const },
        };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40 flex items-end justify-center min-[900px]:items-center min-[900px]:p-6">
          <motion.button
            type="button"
            aria-label="Close"
            tabIndex={-1}
            className="absolute inset-0 bg-black/70"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            ref={dialog}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={cx(
              "highlight relative flex w-full flex-col bg-[#1c1c1e] px-5 outline-none",
              "rounded-t-sheet pt-2 pb-[calc(16px+env(safe-area-inset-bottom,0px))] max-w-[440px]",
              "min-[900px]:max-w-[480px] min-[900px]:rounded-card min-[900px]:pt-6 min-[900px]:pb-6",
              full && "h-[calc(100dvh-12px-env(safe-area-inset-top,0px))] min-[900px]:h-auto min-[900px]:min-h-[560px]",
            )}
            {...motionProps}
          >
            <div aria-hidden className="mx-auto mb-4 h-[5px] w-9 shrink-0 rounded-full bg-label-3 min-[900px]:hidden" />
            {hideTitle ? null : <h2 className="text-title-3 mb-4 font-semibold tracking-[-0.02em]">{title}</h2>}
            <div className={cx(full && "flex min-h-0 flex-1 flex-col")}>{children}</div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
