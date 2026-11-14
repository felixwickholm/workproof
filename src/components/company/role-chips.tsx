"use client";

import { Check } from "lucide-react";
import { useRef, type KeyboardEvent } from "react";
import { cx } from "../ui/cx";
import { COMPANY_ROLES } from "./roles";

/**
 * The role chips: one choice, so one challenge stays about one kind of work. A radio group, so the
 * arrow keys move between chips and a screen reader says which is chosen.
 */
export function RoleChips({ value, onChange, labelledBy }: { value: string | null; onChange: (id: string) => void; labelledBy: string }) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const at = Math.max(
    0,
    COMPANY_ROLES.findIndex((r) => r.id === value),
  );

  function onKey(e: KeyboardEvent, i: number) {
    const step = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (i + step + COMPANY_ROLES.length) % COMPANY_ROLES.length;
    onChange(COMPANY_ROLES[next].id);
    refs.current[next]?.focus();
  }

  return (
    <div role="radiogroup" aria-labelledby={labelledBy} className="flex flex-wrap gap-2.5">
      {COMPANY_ROLES.map((role, i) => {
        const on = role.id === value;
        return (
          <button
            key={role.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={i === at ? 0 : -1}
            onClick={() => onChange(role.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cx(
              "press text-subhead inline-flex h-11 items-center gap-1.5 rounded-full px-4 font-semibold transition-colors duration-150",
              on ? "bg-accent text-accent-ink" : "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-separator)] hover:shadow-[inset_0_0_0_1px_var(--color-label-3)]",
            )}
          >
            {on ? <Check aria-hidden className="-ml-1 size-4" strokeWidth={2.25} /> : null}
            {role.label}
          </button>
        );
      })}
    </div>
  );
}
