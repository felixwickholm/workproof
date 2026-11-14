"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { cx } from "../ui/cx";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReduce(listener: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
}

/**
 * A chart whose bars grow from zero the first time it scrolls into view, then stay put.
 * Later data changes resize the bars without growing them again. Reduced motion shows them at once.
 */
export function BarChart({ children, className, label }: { children: (grown: boolean) => ReactNode; className?: string; label?: string }) {
  const reduce = useSyncExternalStore(subscribeReduce, () => window.matchMedia(REDUCE).matches, () => false);
  const ref = useRef<HTMLDivElement>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || reduce) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        setSeen(true);
      },
      { threshold: 0.3 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <div ref={ref} className={className} aria-label={label} role={label ? "group" : undefined}>
      {children(reduce || seen)}
    </div>
  );
}

type Tone = "ink" | "accent" | "grey";

const tones: Record<Tone, string> = {
  ink: "bg-label",
  accent: "bg-accent",
  grey: "bg-label-3",
};

/**
 * One bar, as long as its share of the chart's largest value. It grows with scaleX from the left
 * edge (500 ms, 40 ms after the bar before it), so only transform animates.
 */
export function Bar({ share, grown, index = 0, tone = "ink", className }: { share: number; grown: boolean; index?: number; tone?: Tone; className?: string }) {
  return (
    <span
      aria-hidden
      className={cx(
        "block origin-left rounded-full transition-transform duration-500 ease-out motion-reduce:transition-none",
        tones[tone],
        className,
      )}
      style={{
        width: `${share * 100}%`,
        // A zero still leaves a 2px mark, so "none" reads apart from "missing".
        minWidth: 2,
        transform: grown ? "scaleX(1)" : "scaleX(0)",
        transitionDelay: `${index * 40}ms`,
      }}
    />
  );
}
