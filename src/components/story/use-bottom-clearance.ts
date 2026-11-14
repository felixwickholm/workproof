"use client";

import { useEffect, useState, type RefObject } from "react";

/** The nearest ancestor (or self) pinned to the viewport: fixed, or sticky like the review action bar. */
function fixedBox(el: Element | null): HTMLElement | null {
  for (let node = el; node && node !== document.body; node = node.parentElement) {
    const position = getComputedStyle(node).position;
    if (position === "fixed" || position === "sticky") return node as HTMLElement;
  }
  return null;
}

/**
 * How far the coach bar must sit above the bottom edge to clear the page's own fixed bars
 * (action bar, tab bar, sticky decision bar). It samples the bottom edge under the coach bar's width, so it works
 * on any page without knowing its markup. `hidden` is true while a modal sheet is open.
 */
export function useBottomClearance(ref: RefObject<HTMLElement | null>, active: boolean) {
  const [clearance, setClearance] = useState(0);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!active) return;
    const measure = () => {
      const bar = ref.current;
      if (!bar) return;
      setHidden(Boolean(document.querySelector('[aria-modal="true"]')));
      const r = bar.getBoundingClientRect();
      const h = window.innerHeight;
      let top = h;
      for (const x of [r.left + 12, r.left + r.width / 2, r.right - 12]) {
        for (const el of document.elementsFromPoint(x, h - 2)) {
          if (bar.contains(el)) continue;
          const box = fixedBox(el);
          if (!box || bar.contains(box)) continue;
          // A full-width wrapper around a centred bar: only the bar itself counts.
          if (el === box && box.children.length > 0) {
            const covered = Array.from(box.children).some((child) => {
              const c = child.getBoundingClientRect();
              return x >= c.left && x <= c.right;
            });
            if (!covered) continue;
          }
          const rect = box.getBoundingClientRect();
          // Full-screen overlays are not bars.
          if (rect.height < h * 0.5) top = Math.min(top, rect.top);
        }
      }
      const next = Math.max(0, Math.round(h - top));
      setClearance((prev) => (prev === next ? prev : next));
    };
    measure();
    // Measure again in the next frame whenever the page changes, so a bar that appears
    // after loading pushes the coach up at once. The interval catches animated bars.
    let frame = 0;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        measure();
      });
    };
    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
    const id = window.setInterval(measure, 250);
    window.addEventListener("resize", measure);
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.clearInterval(id);
      window.removeEventListener("resize", measure);
    };
  }, [ref, active]);

  return { clearance, hidden };
}
