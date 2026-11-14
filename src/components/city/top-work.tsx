"use client";

import { Check } from "lucide-react";
import type { CityTopEntry, ShareMatch } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { topEntryLine } from "./impact";

interface ListProps {
  top: CityTopEntry[];
  selected: ReadonlySet<string>;
  onToggle: (proofId: string) => void;
}

/** Where a row stands on sharing: already offered, or the person did not allow it. */
function shareState(entry: CityTopEntry) {
  if (entry.sharedWith.length > 0) return `Offered to ${entry.sharedWith.join(" and ")}`;
  if (!entry.canShare) return "Did not allow sharing";
  return null;
}

/**
 * Top work on one challenge, numbered from the highest score: labels and scores only, never a name or the work.
 * A row whose person allowed sharing can be picked to offer to another company.
 */
export function TopWorkList({ top, selected, onToggle }: ListProps) {
  if (top.length === 0) {
    return <p className="text-body text-label-2">No work is scored yet. The best scores show here, without names.</p>;
  }
  return (
    <ol>
      {top.map((entry, rank) => {
        const state = shareState(entry);
        const on = selected.has(entry.proofId);
        const line = (
          <>
            <span className="text-headline tnum w-6 shrink-0 text-label-2">{rank + 1}</span>
            <span className="min-w-0 flex-1">
              <span className="text-headline tnum block text-label">{topEntryLine(entry)}</span>
              {state ? <span className="text-footnote mt-0.5 block text-label-2">{state}</span> : null}
            </span>
          </>
        );
        return (
          <li key={entry.proofId} className="[&+&]:hairline-t">
            {entry.canShare ? (
              <label className="flex min-h-14 cursor-pointer items-center gap-3 py-2">
                <input type="checkbox" checked={on} onChange={() => onToggle(entry.proofId)} className="peer sr-only" />
                <span
                  aria-hidden
                  className={cx(
                    "flex size-6 shrink-0 items-center justify-center rounded-[7px] transition-colors duration-150 peer-focus-visible:ring-2 peer-focus-visible:ring-accent",
                    on ? "bg-accent text-accent-ink" : "shadow-[inset_0_0_0_1.5px_var(--color-control)]",
                  )}
                >
                  {on ? <Check className="size-4" strokeWidth={2.25} /> : null}
                </span>
                {line}
              </label>
            ) : (
              <div className="flex min-h-14 items-center gap-3 py-2">
                <span aria-hidden className="size-6 shrink-0" />
                {line}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

interface CompanyProps {
  matches: ShareMatch[];
  value: string | null;
  onChange: (companyId: string) => void;
}

/** Companies with the same need, each with the skills they share with this challenge. */
export function MatchPicker({ matches, value, onChange }: CompanyProps) {
  if (matches.length === 0) {
    return <p className="text-body text-label-2">No other company has a challenge with the same skills yet.</p>;
  }
  return (
    <div role="radiogroup" aria-label="Companies with the same need" className="flex flex-col gap-2">
      {matches.map((m) => {
        const on = value === m.companyId;
        return (
          <button
            key={m.companyId}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onChange(m.companyId)}
            className={cx(
              "press flex min-h-14 items-center gap-3 rounded-[16px] bg-raised px-4 py-3 text-left transition-shadow duration-150",
              on ? "shadow-[inset_0_0_0_2px_var(--color-accent)]" : "shadow-[inset_0_0_0_1px_var(--color-separator)]",
            )}
          >
            <span className="min-w-0 flex-1">
              <span className="text-headline block font-medium text-label">{m.name}</span>
              <span className="text-footnote mt-0.5 block text-label-2">Same skills: {m.sharedSkills.join(", ")}</span>
            </span>
            <span
              aria-hidden
              className={cx("size-5 shrink-0 rounded-full", on ? "shadow-[inset_0_0_0_6px_var(--color-accent)]" : "shadow-[inset_0_0_0_1.5px_var(--color-control)]")}
            />
          </button>
        );
      })}
    </div>
  );
}
