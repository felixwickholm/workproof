"use client";

import { useEffect } from "react";

/** Keys that scroll a page by themselves. The arrows are the tour's own keys, handled elsewhere. */
const SCROLL_KEYS = new Set(["PageUp", "PageDown", "Home", "End", " ", "ArrowUp", "ArrowDown"]);

/** True when the event happens inside a part of the tour that may scroll on its own (the card's text). */
const inScrollable = (event: Event) => event.target instanceof Element && event.target.closest("[data-tour-scroll]") !== null;

/**
 * Holds the page still while the tour is open: wheel, touch and keyboard scrolling are swallowed,
 * so only the tour moves the page. The page keeps its scrollbar, so nothing shifts sideways, and
 * the tour's own scrolling (a script call) still works.
 */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const stop = (event: Event) => {
      if (!inScrollable(event)) event.preventDefault();
    };
    const stopKeys = (event: KeyboardEvent) => {
      if (!SCROLL_KEYS.has(event.key) || inScrollable(event)) return;
      // Space still presses a focused button.
      if (event.key === " " && event.target instanceof HTMLElement && event.target.closest("button")) return;
      event.preventDefault();
    };
    const options = { passive: false, capture: true } as const;
    window.addEventListener("wheel", stop, options);
    window.addEventListener("touchmove", stop, options);
    window.addEventListener("keydown", stopKeys, { capture: true });
    const root = document.documentElement;
    const before = root.style.overscrollBehavior;
    root.style.overscrollBehavior = "none";
    return () => {
      window.removeEventListener("wheel", stop, options);
      window.removeEventListener("touchmove", stop, options);
      window.removeEventListener("keydown", stopKeys, { capture: true });
      root.style.overscrollBehavior = before;
    };
  }, [locked]);
}
