"use client";

import { animate, motion, useMotionValue, useMotionValueEvent } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ComponentProps, type CSSProperties } from "react";
import { cardWidth, placeCard, type Arrow, type Box } from "./placement";
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
const EASE_OUT = [0.23, 1, 0.32, 1] as const;
/** A second layer of dim over a page being drawn under the card: enough to soften it, not to blank it. */
const VEIL = 0.8;

/** The cut-out closing between two pages: quick, so it is shut before the new page is drawn. */
const CLOSE = { duration: 0.22, ease: EASE_OUT };

/** A box shrunk to nothing at its middle: where the cut-out closes to between two pages. */
const toPoint = (box: Box): Box => ({ x: box.x + box.width / 2, y: box.y + box.height / 2, width: 0, height: 0 });
/** The caret is a square turned 45°; this is its side, so it stands out 7px from the card. */
const CARET = 14;

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
 * card beside it with a caret that points at the target. On a phone the card docks on the bottom
 * edge and the ring alone marks the target. Everything under the layer is inert while it is open.
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
  const phone = width === view.width;
  const maxHeight = phone ? view.height - Math.max(top, 16) : view.height - safeBottom - 32 - (placement.side === "docked" ? 0 : top);

  // While the next page opens, the old target is gone: the card waits where it was, the cut-out
  // closes to its own middle and a soft veil covers the page as it is drawn. Once the new target is
  // found the cut-out opens from there to it, so the eye is led across the page change.
  const waiting = card.busy && !box;
  const hole = useSpringBox(placement.spot, moveKey, card.reduce);
  const { x: holeX, y: holeY, width: holeW, height: holeH } = hole;
  const cardPos = useSpringBox(waiting ? null : { ...placement.card, width, height: 0 }, moveKey, card.reduce);
  useEffect(() => {
    if (!waiting || card.reduce || holeW.get() <= 0) return;
    const to = toPoint({ x: holeX.get(), y: holeY.get(), width: holeW.get(), height: holeH.get() });
    const runs = [animate(holeX, to.x, CLOSE), animate(holeY, to.y, CLOSE), animate(holeW, 0, CLOSE), animate(holeH, 0, CLOSE)];
    return () => runs.forEach((run) => run.stop());
  }, [waiting, card.reduce, holeX, holeY, holeW, holeH]);
  const lit = useMotionValue(0);
  const shown = Boolean(placement.spot || waiting);
  useEffect(() => {
    const controls = animate(lit, shown ? 1 : 0, { duration: 0.2, ease: EASE_OUT });
    return () => controls.stop();
  }, [lit, shown]);
  const veil = useMotionValue(0);
  useEffect(() => {
    const controls = animate(veil, waiting && !card.reduce ? VEIL : 0, { duration: waiting ? 0.18 : 0.32, ease: EASE_OUT });
    return () => controls.stop();
  }, [veil, waiting, card.reduce]);

  // The mask and ring are SVG attributes, so they are written directly as the springs move.
  const holeRef = useRef<SVGRectElement>(null);
  const ringRef = useRef<SVGRectElement>(null);
  const paint = () => {
    for (const el of [holeRef.current, ringRef.current]) {
      if (!el) continue;
      el.setAttribute("x", String(hole.x.get()));
      el.setAttribute("y", String(hole.y.get()));
      el.setAttribute("width", String(Math.max(0, hole.width.get())));
      el.setAttribute("height", String(Math.max(0, hole.height.get())));
      el.setAttribute("opacity", String(lit.get()));
    }
  };
  useMotionValueEvent(hole.x, "change", paint);
  useMotionValueEvent(hole.y, "change", paint);
  useMotionValueEvent(hole.width, "change", paint);
  useMotionValueEvent(hole.height, "change", paint);
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
      transition={{ duration: 0.2, ease: EASE_OUT }}
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
        <motion.rect width="100%" height="100%" className="fill-(--tour-dim)" style={{ opacity: veil }} />
        <rect ref={ringRef} data-tour-ring rx="20" ry="20" fill="none" strokeWidth="2" className="stroke-accent" />
      </svg>
      <motion.div className="absolute top-0 left-0" style={{ x: cardPos.x, y: cardPos.y, width }}>
        <motion.div
          className="relative"
          initial={{ opacity: 0, scale: card.reduce ? 1 : 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.24, ease: EASE_OUT }}
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
