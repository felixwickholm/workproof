"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { Company } from "@/lib/domain/types";
import { CompanySwitcher, CompanySwitcherSkeleton } from "./company-switcher";

/** "Posting as Tuulos Robotics" at the top of the need screen. One tap opens the company picker. */
export function PostingAs({ companies, value, onChange }: { companies: Company[] | null; value: string; onChange: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  if (!companies) return <CompanySwitcherSkeleton />;
  const current = companies.find((c) => c.id === value) ?? companies[0];
  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="press flex min-h-11 w-full items-center gap-2 rounded-inner bg-surface px-4 py-2.5 text-left"
      >
        <span className="text-subhead min-w-0 flex-1 text-label-2">
          Posting as <span className="font-semibold text-label">{current?.name}</span>
        </span>
        <span className="text-footnote font-medium text-label-2">Change</span>
        <ChevronDown aria-hidden className={`size-4 text-label-2 transition-transform duration-200 ${open ? "rotate-180" : ""}`} strokeWidth={2.2} />
      </button>
      {open ? (
        <CompanySwitcher
          className="mt-2"
          companies={companies}
          value={current?.id ?? value}
          onChange={(id) => {
            onChange(id);
            setOpen(false);
          }}
          label="Posting as"
        />
      ) : null}
    </div>
  );
}
