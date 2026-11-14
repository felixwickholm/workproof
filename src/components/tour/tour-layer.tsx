"use client";

import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import { cardWidth, placeCard, type Arrow } from "./placement";
import { TourCard } from "./tour-card";
import { useLiveBox, useSpringBox, useViewportSize } from "./use-geometry";

type CardProps = Omit<ComponentProps<typeof TourCard>, "ref" | "maxHeight">;

interface Props extends CardProps {
  /** The element in the spotlight, or null for a card in the middle. */
  target: HTMLElement | null;
  /** The step's `data-tour` id while it is lit, for checks that read which part of the page is meant. */
  targetId: string;
  /** Changes on every settled step, so the spotlight and card travel instead of jumping. */
  moveKey: number;
  /** Reports the card's height, which the scroll needs to leave room for it. */
  onCardHeight: (height: number) => void;
}

const MASK_ID = "tour-spotlight";
/** The caret is a square turned 45°; this is its side, so it stands out 7px from the card. */
const CARET = 14;
/** The gap a connector needs before it is worth drawing between a docked card and its target. */
const CONNECTOR_MIN = 12;

/** Where the caret sits on the card, as a transform, so it travels with the card's own transition. */
function caretStyle(arrow: Arrow, width: number, height: number): CSSProperties {
  const half = CARET / 2;
  const at = {
    left: [-half, arrow.offset - half],
    right: [width - half, arrow.offset - half],
    top: [arrow.offset - half, -half],
    bottom: [arrow.offset - half, height - half],
  }[arrow.edge];
  return { width: CARET, height: CARET, transform: `translate(${at[0]}px, ${at[1]}px) rotate(45deg)` };
}

/**
 * The dimmed page with one rounded cut-out over the target, a thin accent ring around it, and the
 * card beside it with a caret that points at the target. On a phone the card docks at the bottom
 * and a hairline connects it to the target above. Everything under the layer is inert while it is open.
 */
export function TourLayer({ target, targetId, moveKey, onCardHeight, ...card }: Props) {
  const view = useViewportSize();
  const box = useLiveBox(target);
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardHeight, setCardHeight] = useState(0);
  const safeRef = useRef<HTMLDivElement>(null);
  const [safeBottom, setSafeBottom] = useState(0);

  useLayoutEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const measure = () => {
      setCardHeight(el.offsetHeight);
      onCardHeight(el.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [onCardHeight]);

  useLayoutEffect(() => {
    setSafeBottom(safeRef.current?.offsetHeight ?? 0);
  }, [view.height]);

  const width = cardWidth(view.width);
  // A target is lit below the page's sticky bars, which differ from page to page.
  const top = box?.barBottom ?? 0;
  const placement = placeCard({ width: view.width, height: view.height, top, bottom: safeBottom }, box, { width, height: cardHeight });
  // The card never grows past the screen: its text scrolls inside and the buttons stay in view.
  const maxHeight = view.height - safeBottom - 32 - (placement.side === "docked" ? 0 : top);

  // Without a target the cut-out fades where it was, so the next one opens from there.
  const hole = useSpringBox(placement.spot, moveKey, card.reduce);
  // While the next page loads, the old target is gone: the card waits where it was, its spotlight fades.
  const waiting = card.busy && !box;
  const cardPos = useSpringBox(waiting ? null : { ...placement.card, width, height: 0 }, moveKey, card.reduce);
  const lit = useMotionValue(0);
  useEffect(() => {
    const controls = animate(lit, placement.spot ? 1 : 0, { duration: 0.2, ease: [0.23, 1, 0.32, 1] });
    return () => controls.stop();
  }, [lit, placement.spot]);

  // The mask, ring and connector are SVG attributes, so they are written directly as the springs move.
  const holeRef = useRef<SVGRectElement>(null);
  const ringRef = useRef<SVGRectElement>(null);
  const lineRef = useRef<SVGLineElement>(null);
  const docked = placement.side === "docked" && placement.arrow !== null;
  const caretX = placement.arrow?.offset ?? 0;
  const paint = () => {
    for (const el of [holeRef.current, ringRef.current]) {
      if (!el) continue;
      el.setAttribute("x", String(hole.x.get()));
      el.setAttribute("y", String(hole.y.get()));
      el.setAttribute("width", String(Math.max(0, hole.width.get())));
      el.setAttribute("height", String(Math.max(0, hole.height.get())));
      el.setAttribute("opacity", String(lit.get()));
    }
    const line = lineRef.current;
    if (!line) return;
    const x = cardPos.x.get() + caretX;
    const from = hole.y.get() + hole.height.get();
    const to = cardPos.y.get() - CARET / 2;
    line.setAttribute("x1", String(x));
    line.setAttribute("x2", String(x));
    line.setAttribute("y1", String(from));
    line.setAttribute("y2", String(to));
    line.setAttribute("opacity", String(docked && to - from > CONNECTOR_MIN ? lit.get() : 0));
  };
  useMotionValueEvent(hole.x, "change", paint);
  useMotionValueEvent(hole.y, "change", paint);
  useMotionValueEvent(hole.width, "change", paint);
  useMotionValueEvent(hole.height, "change", paint);
  useMotionValueEvent(cardPos.x, "change", paint);
  useMotionValueEvent(cardPos.y, "change", paint);
  useMotionValueEvent(lit, "change", paint);
  useLayoutEffect(paint);

  return (
    <motion.div
      className="fixed inset-0 z-[70]"
      data-spotlight={targetId}
      data-side={placement.side}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
    >
      <div ref={safeRef} aria-hidden className="pointer-events-none invisible absolute h-[env(safe-area-inset-bottom,0px)] w-px" />
      <svg aria-hidden className="absolute inset-0 size-full">
        <defs>
          <mask id={MASK_ID} maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="white" />
            <rect ref={holeRef} rx="20" ry="20" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" mask={`url(#${MASK_ID})`} className="fill-(--tour-dim)" />
        <rect ref={ringRef} data-tour-ring rx="20" ry="20" fill="none" strokeWidth="2" className="stroke-accent" />
        <line ref={lineRef} strokeWidth="1.5" strokeDasharray="3 4" strokeLinecap="round" className="stroke-accent" />
      </svg>
      <motion.div className="absolute top-0 left-0" style={{ x: cardPos.x, y: cardPos.y, width }}>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: card.reduce ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
        >
          {placement.arrow && !waiting ? (
            <span
              aria-hidden
              data-tour-caret={placement.arrow.edge}
              className="absolute top-0 left-0 rounded-[3px] bg-raised transition-transform duration-300 ease-(--ease-out) motion-reduce:transition-none"
              style={caretStyle(placement.arrow, width, cardHeight)}
            />
          ) : null}
          <TourCard ref={cardRef} maxHeight={maxHeight} {...card} />
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
