"use client";

import { animate, useMotionValue, type MotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Box } from "./placement";

/** Spotlight and card travel: about 400 ms, nearly no overshoot. */
const TOUR_SPRING = { type: "spring", duration: 0.4, bounce: 0.12 } as const;

/** Calls `fn` at most once a frame. */
function frameThrottle(fn: () => void) {
  let frame = 0;
  const run = () => {
    if (!frame) frame = requestAnimationFrame(() => {
      frame = 0;
      fn();
    });
  };
  return { run, cancel: () => cancelAnimationFrame(frame) };
}

/**
 * The part of the page a person sees. On a phone a page that is too wide stretches the layout
 * viewport (and innerWidth) past the screen; the visual viewport stays the screen's size.
 */
export function visibleSize() {
  const v = window.visualViewport;
  return { width: v?.width ?? window.innerWidth, height: v?.height ?? window.innerHeight };
}

/** The visible size, kept current through resizes and page changes that widen the layout. */
export function useViewportSize() {
  const [size, setSize] = useState(visibleSize);
  useEffect(() => {
    const update = frameThrottle(() => {
      const next = visibleSize();
      setSize((prev) => (prev.width === next.width && prev.height === next.height ? prev : next));
    });
    const observer = new ResizeObserver(update.run);
    observer.observe(document.documentElement);
    window.addEventListener("resize", update.run);
    window.visualViewport?.addEventListener("resize", update.run);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update.run);
      window.visualViewport?.removeEventListener("resize", update.run);
      update.cancel();
    };
  }, []);
  return size;
}

/**
 * Where the content starts under the page's sticky bars (the phone's mode bar, a page's own bar
 * with a back link): a target lit under a bar would be half hidden by it.
 */
export function stickyTop(): number {
  let bottom = 0;
  for (const bar of document.querySelectorAll<HTMLElement>(".top-bar")) {
    const style = getComputedStyle(bar);
    if (style.position !== "sticky" && style.position !== "fixed") continue;
    const height = bar.getBoundingClientRect().height;
    if (height > 0) bottom = Math.max(bottom, (parseFloat(style.top) || 0) + height);
  }
  return bottom;
}

/** Height taken at the bottom of the screen by a footer marked `data-sticky-bottom` while it is pinned there. */
export function stickyBottom(): number {
  let taken = 0;
  for (const bar of document.querySelectorAll<HTMLElement>("[data-sticky-bottom]")) {
    if (getComputedStyle(bar).position !== "sticky") continue;
    const r = bar.getBoundingClientRect();
    if (r.height > 0 && r.top < window.innerHeight) taken = Math.max(taken, Math.min(r.height, window.innerHeight - r.top));
  }
  return taken;
}

/** A box on screen, with where the page's sticky bars end at the moment it was measured. */
interface LiveBox extends Box {
  barBottom: number;
}

const sameBox = (a: Box, b: Box) => a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;

/**
 * The element's box on screen, following scroll, resizes and content that loads around it
 * (the page's own size changes then). Null without an element, or once it left the page.
 */
export function useLiveBox(el: HTMLElement | null): LiveBox | null {
  const [seen, setSeen] = useState<{ el: HTMLElement; box: LiveBox } | null>(null);
  // Measured before paint, so a new target never shows for a frame with the card in the middle.
  useLayoutEffect(() => {
    if (!el) return;
    const read = () => {
      const r = el.getBoundingClientRect();
      // A page change removes the old target; it then has no box, rather than one at the corner.
      if (!el.isConnected || (r.width === 0 && r.height === 0)) return setSeen(null);
      const box = { x: r.left, y: r.top, width: r.width, height: r.height, barBottom: stickyTop() };
      setSeen((prev) => (prev?.el === el && sameBox(prev.box, box) && prev.box.barBottom === box.barBottom ? prev : { el, box }));
    };
    read();
    const measure = frameThrottle(read);
    const resize = new ResizeObserver(measure.run);
    resize.observe(el);
    resize.observe(document.body);
    window.addEventListener("scroll", measure.run, { capture: true, passive: true });
    window.addEventListener("resize", measure.run);
    return () => {
      resize.disconnect();
      window.removeEventListener("scroll", measure.run, { capture: true });
      window.removeEventListener("resize", measure.run);
      measure.cancel();
    };
  }, [el]);
  return el && seen?.el === el ? seen.box : null;
}

/**
 * Motion values for a box that springs to a new place when `moveKey` changes and otherwise
 * sticks to it (scrolling, resizing). A move that is still running takes new targets along,
 * keeping its speed, so a smooth scroll during the move stays smooth. Without a box the values
 * stay where they are.
 */
export function useSpringBox(box: Box | null, moveKey: number, reduce: boolean) {
  const x = useMotionValue(box?.x ?? 0);
  const y = useMotionValue(box?.y ?? 0);
  const width = useMotionValue(box?.width ?? 0);
  const height = useMotionValue(box?.height ?? 0);
  const lastKey = useRef(moveKey);
  const moving = useRef(false);
  const moves = useRef(0);

  const bx = box?.x;
  const by = box?.y;
  const bw = box?.width;
  const bh = box?.height;
  // Before paint, so the first frame already shows the card in its place.
  useLayoutEffect(() => {
    if (bx === undefined || by === undefined || bw === undefined || bh === undefined) return;
    const values: [MotionValue<number>, number][] = [
      [x, bx],
      [y, by],
      [width, bw],
      [height, bh],
    ];
    const keyChanged = lastKey.current !== moveKey;
    lastKey.current = moveKey;
    if (reduce || (!keyChanged && !moving.current)) {
      for (const [value, to] of values) value.jump(to);
      return;
    }
    const move = ++moves.current;
    moving.current = true;
    const runs = values.map(([value, to]) => animate(value, to, TOUR_SPRING));
    void Promise.all(runs.map((r) => r.finished)).then(() => {
      if (moves.current === move) moving.current = false;
    });
  }, [bx, by, bw, bh, moveKey, reduce, x, y, width, height]);

  return { x, y, width, height };
}
