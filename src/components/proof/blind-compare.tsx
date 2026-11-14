"use client";

import { ChevronsLeftRight, EyeOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react";
import { cx } from "../ui/cx";
import { hiddenLine } from "./format";
import { markHidden, type Segment } from "./mark-hidden";

interface Props {
  /** What the person wrote. */
  original: string;
  /** The same text after the blind layer, with `[hidden]` tokens. */
  blind: string;
  hiddenCount: number;
  /** The two layer labels: what was written, and what the company reads. */
  labels?: [string, string];
  /** Walkthrough targets: the card, and the handle (or the tab switch on a phone). */
  tour?: [string, string];
  /**
   * The side the reader meets first. On a phone it picks the open tab; on a laptop it sets where
   * the handle rests after the first-view glide ("blind" leaves most of the card as the company reads it).
   */
  initialSide?: "written" | "blind";
  className?: string;
}

const SIDE_BY_SIDE = "(min-width: 640px)";
/** Where the handle rests, in percent of the card shown as written. */
const REST: Record<NonNullable<Props["initialSide"]>, number> = { written: 45, blind: 30 };
/** On first view the handle glides in from the far edge, so the reader sees that the layers move. */
const FROM = 100;
const GLIDE_MS = 600;
const STEP = 5;

const subscribers = new Map<string, (listener: () => void) => () => void>();

/** One stable subscribe function per query, so the store never resubscribes on render. */
function subscribe(query: string) {
  let fn = subscribers.get(query);
  if (!fn) {
    fn = (listener) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", listener);
      return () => list.removeEventListener("change", listener);
    };
    subscribers.set(query, fn);
  }
  return fn;
}

/** The server renders the laptop layout; a phone switches to tabs on hydration. */
function useMedia(query: string, server: boolean) {
  return useSyncExternalStore(subscribe(query), () => window.matchMedia(query).matches, () => server);
}

const clamp = (n: number) => Math.min(100, Math.max(0, n));

/**
 * One layer of the comparison. Both layers draw the same segments with the same glyphs, so their
 * lines break in the same places and nothing shifts under the handle. "written" puts a soft
 * highlight on the details; "blind" covers each one with a teal bar the width of its words, and
 * keeps those words out of reach: transparent, unselectable and hidden from assistive technology,
 * which reads "hidden" instead.
 */
function Layer({ segments, as }: { segments: Segment[]; as: "written" | "blind" }) {
  return (
    <p className="text-body whitespace-pre-wrap text-pretty text-label">
      {segments.map((s, i) => {
        if (!s.hidden) return <span key={i}>{s.text}</span>;
        if (as === "written") {
          // A box shadow, not padding, so the highlight adds no width.
          return (
            <mark key={i} className="rounded-[4px] bg-warning-wash text-warning-ink shadow-[0_0_0_2px_var(--color-warning-wash)] [box-decoration-break:clone]">
              {s.text}
            </mark>
          );
        }
        return (
          <span key={i}>
            <span aria-hidden className="rounded-[4px] bg-accent/20 text-transparent select-none [box-decoration-break:clone]">
              {s.text}
            </span>
            <span className="sr-only">[hidden]</span>
          </span>
        );
      })}
    </p>
  );
}

/**
 * The same answer twice, in one card: what the person wrote, and what the company reads. On a
 * laptop a handle wipes between the two layers (drag, or the arrow keys); on a phone two tabs
 * cross-fade. The highlighted words on one side are exactly the bars on the other, at the same width.
 */
export function BlindCompare({
  original,
  blind,
  hiddenCount,
  labels = ["What Mikko wrote", "What the company reads"],
  tour,
  initialSide = "written",
  className,
}: Props) {
  const wide = useMedia(SIDE_BY_SIDE, true);
  const reduce = useMedia("(prefers-reduced-motion: reduce)", false);
  const rest = REST[initialSide];
  const [pos, setPos] = useState(rest);
  const [tab, setTab] = useState<0 | 1>(initialSide === "blind" ? 1 : 0);
  const segments = useMemo(() => markHidden(original, blind), [original, blind]);
  const card = useRef<HTMLDivElement>(null);
  const glided = useRef(false);

  // Glide once, the first time the card is mostly in view; any touch of the handle stops it.
  useEffect(() => {
    const el = card.current;
    if (!el || !wide || reduce || glided.current) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        glided.current = true;
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / GLIDE_MS);
          setPos(FROM + (rest - FROM) * (1 - Math.pow(1 - t, 3)));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        setPos(FROM);
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [wide, reduce, rest]);

  const stopGlide = () => {
    glided.current = true;
  };

  const fromPointer = (e: PointerEvent<HTMLElement>) => {
    const box = card.current?.getBoundingClientRect();
    if (box) setPos(clamp(((e.clientX - box.left) / box.width) * 100));
  };

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const next = { ArrowLeft: pos - STEP, ArrowDown: pos - STEP, ArrowRight: pos + STEP, ArrowUp: pos + STEP, Home: 0, End: 100 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    stopGlide();
    setPos(clamp(next));
  };

  const footer = (
    <p className="text-footnote flex items-center gap-2 border-t border-separator px-5 py-3.5 text-label-2">
      <EyeOff aria-hidden className="size-4 shrink-0" strokeWidth={1.7} />
      {hiddenLine(hiddenCount)}
    </p>
  );

  if (!wide) {
    return (
      <div data-tour={tour?.[0]} className={cx("overflow-hidden rounded-card bg-surface", className)}>
        <div role="tablist" aria-label="Compare" data-tour={tour?.[1]} className="m-3 mb-0 grid grid-cols-2 rounded-full bg-fill p-1">
          {(["Written", "Company reads"] as const).map((name, i) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={tab === i}
              onClick={() => setTab(i as 0 | 1)}
              className={cx(
                "text-footnote h-9 rounded-full font-semibold transition-colors duration-200",
                tab === i ? "bg-raised text-label shadow-[0_1px_2px_rgba(0,0,0,0.08)]" : "text-label-2",
              )}
            >
              {name}
            </button>
          ))}
        </div>
        <div className="grid p-5">
          {[0, 1].map((i) => (
            <div
              key={i}
              role="tabpanel"
              aria-hidden={tab !== i}
              className={cx("[grid-area:1/1] transition-[opacity,filter] duration-200 ease-(--ease-out)", tab === i ? "opacity-100" : "pointer-events-none opacity-0 blur-[2px]")}
            >
              <p className="text-footnote mb-2 font-medium text-label-2">{labels[i]}</p>
              <Layer segments={segments} as={i === 0 ? "written" : "blind"} />
            </div>
          ))}
        </div>
        {footer}
      </div>
    );
  }

  return (
    <div data-tour={tour?.[0]} className={cx("overflow-hidden rounded-card bg-surface", className)}>
      <div
        ref={card}
        className="relative grid cursor-ew-resize touch-pan-y select-none"
        onPointerDown={(e) => {
          stopGlide();
          e.currentTarget.setPointerCapture(e.pointerId);
          fromPointer(e);
        }}
        onPointerMove={(e) => {
          if (e.currentTarget.hasPointerCapture(e.pointerId)) fromPointer(e);
        }}
      >
        {/* Bottom layer: what the company reads. */}
        <div className="[grid-area:1/1] p-6" aria-label={labels[1]}>
          <p className="text-footnote mb-2 text-right font-medium text-label-2">{labels[1]}</p>
          <Layer segments={segments} as="blind" />
        </div>
        {/* Top layer: what was written, wiped away to the left of the handle. */}
        <div className="[grid-area:1/1] bg-surface p-6" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }} aria-label={labels[0]}>
          <p className="text-footnote mb-2 font-medium text-label-2">{labels[0]}</p>
          <Layer segments={segments} as="written" />
        </div>
        {/* The line sits above both layers, so it reads as one rule across text and bars alike. */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 z-10 w-[2px] -translate-x-1/2 bg-label-2" style={{ left: `${pos}%` }} />
        <div
          role="slider"
          tabIndex={0}
          aria-label="Compare what was written with what the company reads"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(pos)}
          aria-valuetext={`${Math.round(pos)}% written, ${Math.round(100 - pos)}% as the company reads it`}
          data-tour={tour?.[1]}
          onKeyDown={onKey}
          className="shadow-float absolute top-1/2 z-20 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-raised text-label ring-2 ring-ground"
          style={{ left: `${pos}%` }}
        >
          <ChevronsLeftRight aria-hidden className="size-4" strokeWidth={1.8} />
        </div>
      </div>
      {footer}
    </div>
  );
}
