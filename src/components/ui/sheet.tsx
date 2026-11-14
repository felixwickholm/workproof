"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, type ReactNode } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

/** Bottom sheet. Slides up with the iOS sheet curve; tap the dimmed area or press Escape to close. */
export function Sheet({ open, onClose, title, children }: Props) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-40">
          <motion.button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="glass highlight absolute inset-x-0 bottom-0 mx-auto w-full max-w-[440px] rounded-t-sheet px-5 pt-2 pb-[calc(16px+env(safe-area-inset-bottom,0px))]"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={{ duration: reduce ? 0.15 : 0.4, ease: [0.32, 0.72, 0, 1] }}
          >
            <div aria-hidden className="mx-auto mb-4 h-[5px] w-9 rounded-full bg-label-3" />
            <h2 className="text-title-3 mb-4 font-bold">{title}</h2>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}
