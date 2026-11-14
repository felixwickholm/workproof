"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useSyncExternalStore } from "react";

interface Note {
  id: number;
  text: string;
}

const SHOW_MS = 3200;

let current: Note | null = null;
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

/** Shows one short confirmation at the bottom of the screen. A new one replaces the last. */
export function toast(text: string) {
  current = { id: nextId++, text };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Mounted once in the root layout. Announced politely to screen readers. */
export function Toaster() {
  const note = useSyncExternalStore(subscribe, () => current, () => null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!note) return;
    const id = window.setTimeout(() => {
      if (current?.id === note.id) {
        current = null;
        emit();
      }
    }, SHOW_MS);
    return () => window.clearTimeout(id);
  }, [note]);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(24px+env(safe-area-inset-bottom,0px))] z-50 flex justify-center px-4 max-[899px]:in-shell:bottom-[calc(80px+env(safe-area-inset-bottom,0px))] min-[900px]:bottom-8 min-[900px]:in-shell:pl-(--sidebar-width)"
    >
      <AnimatePresence>
        {note ? (
          <motion.p
            key={note.id}
            role="status"
            className="text-subhead shadow-float max-w-[420px] rounded-full bg-raised px-5 py-3 font-medium text-label"
            initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(8px) scale(0.98)" }}
            animate={{ opacity: 1, transform: "translateY(0px) scale(1)" }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
          >
            {note.text}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
