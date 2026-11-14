"use client";

import { PROOF_KIND_LABEL } from "@/components/ui/proof-kind";
import { cx } from "@/components/ui/cx";
import { KIND_FILTERS, type KindFilter } from "./task-filter";

/**
 * One row of chips that narrows the task list by what you hand in. On a phone, and inside a panel,
 * the row scrolls sideways inside itself, never the page. A kind with no open task stays, quieter, with its zero.
 */
export function KindChips({
  value,
  onChange,
  counts,
  bleed = "panel",
  className,
}: {
  value: KindFilter;
  onChange: (next: KindFilter) => void;
  counts: Record<KindFilter, number>;
  /** How far the row scrolls past its column on a phone: a panel's padding, or the page margin. */
  bleed?: "panel" | "page";
  className?: string;
}) {
  return (
    <div role="radiogroup" aria-label="Kind of proof" className={cx(
        "flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]",
        // In a panel the row scrolls at every width, so it stays one row beside the invitations.
        bleed === "panel" ? "-mx-5 px-5" : "-mx-4 px-4 min-[900px]:mx-0 min-[900px]:flex-wrap min-[900px]:overflow-visible min-[900px]:px-0",
        className,
      )}
    >
      {KIND_FILTERS.map((kind) => {
        const on = kind === value;
        const label = kind === "all" ? "All" : PROOF_KIND_LABEL[kind];
        return (
          <button
            key={kind}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(kind)}
            className={cx(
              "press inline-flex h-8 flex-none items-center gap-1.5 rounded-full px-3 text-footnote font-medium whitespace-nowrap transition-colors duration-150",
              on ? "bg-label text-ground" : "bg-fill text-label hover:bg-label/10",
              !on && counts[kind] === 0 && "text-label-2",
            )}
          >
            {label}
            <span className={cx("tnum", on ? "text-ground/70" : "text-label-2")}>{counts[kind]}</span>
          </button>
        );
      })}
    </div>
  );
}
