"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "./cx";

const COUNT_MS = 700;
const REDUCE = "(prefers-reduced-motion: reduce)";

interface Props {
  label: ReactNode;
  value: number | string;
  /** How a counted number is written ("31", "2.4 h"). Defaults to whole numbers with separators. */
  format?: (n: number) => string;
  /** Context after the figure, smaller and muted (" of 47"); it never counts. */
  suffix?: string;
  /** One plain line under the figure. */
  caption?: ReactNode;
  className?: string;
  /** A target for the guided walkthrough, `data-tour="<id>"`. */
  tour?: string;
}

const wholeNumber = (n: number) => Math.round(n).toLocaleString("en-GB");

/** A count tile: label, the figure at regular weight in tabular digits, a caption. A number counts up once, the first time it is seen. */
export function StatTile({ label, value, format = wholeNumber, suffix, caption, className, tour }: Props) {
  return (
    <div data-tour={tour} className={cx("flex min-h-[128px] flex-col rounded-card bg-surface p-4 min-[900px]:p-5", className)}>
      <p className="text-footnote text-label-2">{label}</p>
      <p className="text-kpi mt-auto pt-3 text-label">
        {typeof value === "number" ? <CountUp to={value} format={format} /> : value}
        {suffix ? <span className="text-headline tnum font-normal tracking-normal text-label-2">{suffix}</span> : null}
      </p>
      {caption ? <p className="text-footnote mt-1 text-label-2">{caption}</p> : null}
    </div>
  );
}

function subscribeReduce(listener: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/**
 * Counts from zero to `to` with an ease-out the first time it scrolls into view, then shows the
 * exact value and follows later changes without counting again. Screen readers get the value only.
 */
function CountUp({ to, format = wholeNumber }: { to: number; format?: (n: number) => string }) {
  const reduce = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);
  const ref = useRef<HTMLSpanElement>(null);
  // The figure on screen while counting; null once the count has run.
  const [shown, setShown] = useState<number | null>(0);
  // A poll may change the value mid-count; the count lands on the latest one.
  const target = useRef(to);
  useEffect(() => {
    target.current = to;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / COUNT_MS);
          setShown(t < 1 ? target.current * (1 - Math.pow(1 - t, 3)) : null);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [reduce]);

  return (
    <span ref={ref} className="tnum">
      <span aria-hidden>{format(reduce || shown === null ? to : shown)}</span>
      <span className="sr-only">{format(to)}</span>
    </span>
  );
}
