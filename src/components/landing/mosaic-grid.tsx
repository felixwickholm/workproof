"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/components/ui/cx";

/** How many proofs a phone shows before the visitor asks for the rest. */
export const PHONE_FIRST = 4;

/**
 * The mosaic's grid of seven proofs. On a phone only the first four show, with a button for the
 * rest; from 640px all show. Every proof is in the HTML either way.
 */
export function MosaicGrid({ children, total }: { children: ReactNode; total: number }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        data-open={open}
        className={cx(
          "mt-8 grid gap-4 min-[640px]:grid-cols-2 min-[1024px]:mt-12 min-[1024px]:grid-cols-12",
          "max-[639px]:data-[open=false]:[&>*:nth-child(n+5)]:hidden",
        )}
      >
        {children}
      </div>
      {!open && total > PHONE_FIRST ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press mt-4 inline-flex h-11 w-full items-center justify-center rounded-full bg-fill text-[16px] font-semibold text-label min-[640px]:hidden"
        >
          Show all seven
        </button>
      ) : null}
    </>
  );
}
