"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useRef, type ReactNode, type RefObject } from "react";
import { cx } from "./cx";

interface Props {
  id: string;
  open: boolean;
  onClose: () => void;
  trigger: RefObject<HTMLButtonElement | null>;
  children: ReactNode;
  /** "below" grows down from the trigger's top-left corner; "above" grows up from its bottom-left corner. */
  placement?: "below" | "above";
  className?: string;
}

/** A spring that settles fast, with no visible bounce: menus feel physical without wobbling. */
const SPRING = { type: "spring", stiffness: 520, damping: 38, mass: 0.8 } as const;

/**
 * A menu anchored to its trigger. It springs from the trigger's corner and closes on Escape, Tab or a
 * click outside. Focus starts on the current item (`data-current`), else the first menu item.
 */
export function Popover({ id, open, onClose, trigger, children, placement = "below", className }: Props) {
  const reduce = useReducedMotion();
  const panel = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  useEffect(() => {
    closeRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const button = trigger.current;
    (panel.current?.querySelector<HTMLElement>("[data-current]") ?? panel.current?.querySelector<HTMLElement>("[role^='menuitem']"))?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeRef.current();
        button?.focus();
      } else if (e.key === "Tab") closeRef.current();
    };
    const onPointer = (e: PointerEvent) => {
      const target = e.target as Node;
      if (!panel.current?.contains(target) && !button?.contains(target)) closeRef.current();
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onPointer);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onPointer);
    };
  }, [open, trigger]);

  const above = placement === "above";
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          ref={panel}
          id={id}
          className={cx(
            "shadow-float absolute left-0 z-50 w-[312px] rounded-[20px] bg-raised p-2",
            above ? "bottom-[calc(100%+8px)] origin-bottom-left" : "top-[calc(100%+8px)] origin-top-left",
            className,
          )}
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, transition: { duration: 0.12 } }}
          transition={reduce ? { duration: 0.12 } : SPRING}
        >
          {children}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
