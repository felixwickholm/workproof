"use client";

import { ListChecks } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Sheet } from "../ui/sheet";

/** On a phone the review guide is one compact row that opens a sheet, so the work stays first. */
export function LookForRow({ count, note, children }: { count: number; note: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="press text-subhead flex h-11 items-center gap-2 self-start rounded-full bg-surface px-4 font-semibold text-label transition-colors duration-150 active:bg-raised"
      >
        <ListChecks aria-hidden className="size-[18px] text-label-2" strokeWidth={2} />
        Look for <span className="tnum font-medium text-label-2">({count})</span>
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title="Look for">
        <p className="text-subhead -mt-2 mb-4 text-label-2 text-pretty">{note}</p>
        <div className="max-h-[60dvh] overflow-y-auto">{children}</div>
      </Sheet>
    </>
  );
}
