"use client";

import { useEffect, useState } from "react";
import { cx } from "@/components/ui/cx";

const HOLD_MS = 900;

/**
 * The proof label turns into the person's name, once: a crossfade with a 2px blur, so the two
 * words read as one thing changing. With reduced motion only the opacity moves.
 */
export function NameReveal({ from, to, className }: { from: string; to: string; className?: string }) {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setShown(true), HOLD_MS);
    return () => window.clearTimeout(id);
  }, []);

  const layer = "[grid-area:1/1] transition-[opacity,filter] duration-300 ease-(--ease-out) motion-reduce:filter-none";
  return (
    <span className={cx("inline-grid align-baseline", className)}>
      <span aria-hidden className={cx(layer, shown ? "opacity-0 blur-[2px]" : "opacity-100")}>
        {from}
      </span>
      <span className={cx(layer, shown ? "opacity-100" : "opacity-0 blur-[2px]")}>{to}</span>
    </span>
  );
}
