"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import type { Company } from "@/lib/domain/types";
import { CompanyMark } from "../ui/avatar";
import { cx } from "../ui/cx";
import { Sheet } from "../ui/sheet";
import { Skeleton } from "../ui/skeleton";

interface Props {
  companies: Company[] | null;
  value: string;
  onChange: (id: string) => void;
  /** What the choice means here, for the sheet's title: "Hiring as", "Posting as", "Reviewing as". */
  label?: string;
  className?: string;
}

/**
 * "Halla Supply · Wholesale · Leppävaara · change": the company this screen acts for, in one
 * quiet line. "change" opens the event's employers in a sheet; one tap switches. Built from spans,
 * so it can sit inside a sentence such as a page's subtitle.
 */
export function CompanyLine({ companies, value, onChange, label = "Hiring as", className }: Props) {
  const [open, setOpen] = useState(false);
  const current = companies?.find((c) => c.id === value) ?? companies?.[0];
  if (!current) return <CompanyLineSkeleton className={className} />;

  return (
    <span className={cx("flex min-h-8 min-w-0 items-center gap-2", className)}>
      <CompanyMark company={current} size="sm" />
      <span className="text-footnote min-w-0 truncate text-label-2">
        <span className="font-medium text-label">{current.name}</span> · {current.sector} · {current.district}
      </span>
      <span aria-hidden className="text-footnote text-label-2">
        ·
      </span>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Change company, now ${current.name}`}
        className="text-footnote -mx-1 shrink-0 rounded-md px-1 py-1.5 font-medium text-label underline decoration-control underline-offset-4 transition-colors duration-150 hover:decoration-label-2 pointer-coarse:py-3"
      >
        change
      </button>
      <Sheet open={open} onClose={() => setOpen(false)} title={label}>
        <p className="text-subhead -mt-2 mb-3 text-pretty text-label-2">Ten employers at Espoo Talent Day. Each one reads its own queue.</p>
        <ul role="radiogroup" aria-label={label} className="-mx-2 max-h-[60dvh] overflow-y-auto">
          {(companies ?? []).map((c) => {
            const on = c.id === current.id;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
                  className={cx(
                    "flex min-h-14 w-full items-center gap-3 rounded-[14px] px-2 py-2 text-left transition-colors duration-150 hover:bg-fill",
                    on && "bg-fill",
                  )}
                >
                  <CompanyMark company={c} />
                  <span className="min-w-0 flex-1">
                    <span className="text-subhead block truncate font-medium text-label">{c.name}</span>
                    <span className="text-footnote block truncate text-label-2">
                      {c.sector} · {c.district}
                    </span>
                  </span>
                  {on ? <Check aria-hidden className="size-[18px] shrink-0 text-label" strokeWidth={2} /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      </Sheet>
    </span>
  );
}

export function CompanyLineSkeleton({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cx("flex min-h-8 items-center gap-2", className)}>
      <span className="size-6 rounded-full bg-fill" />
      <Skeleton className="h-3.5 w-64" />
    </span>
  );
}
