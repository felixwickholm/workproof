"use client";

import { useState, type ReactNode } from "react";

/**
 * On a phone, holds a long card to about 400px with a fade at the foot and a button that opens the
 * rest. From 640px the card shows whole. The full content is in the HTML either way.
 */
export function PhoneCap({ children, label }: { children: ReactNode; label: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <div data-open={open} className="max-[639px]:data-[open=false]:max-h-[400px] max-[639px]:data-[open=false]:overflow-hidden max-[639px]:data-[open=false]:[mask-image:linear-gradient(to_bottom,#000_72%,transparent)]">
        {children}
      </div>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="press mt-2 inline-flex h-11 w-full items-center justify-center rounded-full bg-fill text-[16px] font-semibold text-label min-[640px]:hidden"
        >
          {label}
        </button>
      ) : null}
    </div>
  );
}
