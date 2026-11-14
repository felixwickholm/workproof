"use client";

import { Check, ChevronDown, Heart, Search, X } from "lucide-react";
import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../ui/cx";
import { Popover } from "../ui/popover";
import { activeFilters, MINUTE_LIMITS, NO_FILTERS, pickedSummary, type ChallengeFilters } from "./challenge-filter";

interface Props {
  filters: ChallengeFilters;
  onChange: (filters: ChallengeFilters) => void;
  /** The companies on the list, so no filter offers a choice that empties it. */
  choices: { companies: string[] };
  /** How many challenges this visitor saved, shown on the Saved toggle. */
  savedCount: number;
  tour?: string;
}

/** Adds the value when it is missing, removes it when it is there, keeping the order of `all`. */
function toggled<T>(picked: readonly T[], value: T, all: readonly T[]): T[] {
  return picked.includes(value) ? picked.filter((v) => v !== value) : all.filter((v) => v === value || picked.includes(v));
}

const pill = "press inline-flex h-10 items-center gap-1.5 rounded-full px-3.5 text-footnote transition-colors duration-150 min-[900px]:h-9";

/**
 * One compact row over the list: company, time, saved, and a search box. Roles are picked with the
 * tiles above, and the format is explained on each challenge's own page, so neither is a filter here.
 */
export function FilterBar({ filters, onChange, choices, savedCount, tour }: Props) {
  const set = (patch: Partial<ChallengeFilters>) => onChange({ ...filters, ...patch });

  return (
    <div data-tour={tour} role="group" aria-label="Filter challenges" className="flex flex-col gap-2.5 min-[900px]:flex-row min-[900px]:items-center">
      {/* Under 900px the menus anchor to this row, so a menu never runs off the screen edge. */}
      <div className="relative flex flex-wrap items-center gap-1.5 min-[900px]:gap-2">
        <FilterPill label="Company" summary={pickedSummary(filters.companies)} onClear={filters.companies.length ? () => set({ companies: [] }) : undefined}>
          {choices.companies.map((name) => (
            <Option key={name} checked={filters.companies.includes(name)} onSelect={() => set({ companies: toggled(filters.companies, name, choices.companies) })}>
              {name}
            </Option>
          ))}
        </FilterPill>
        <FilterPill
          label="Time"
          summary={filters.maxMinutes === null ? "" : `Up to ${filters.maxMinutes} min`}
          onClear={filters.maxMinutes === null ? undefined : () => set({ maxMinutes: null })}
        >
          {MINUTE_LIMITS.map((limit) => (
            <Option key={limit} radio checked={filters.maxMinutes === limit} onSelect={() => set({ maxMinutes: filters.maxMinutes === limit ? null : limit })}>
              Up to {limit} min
            </Option>
          ))}
        </FilterPill>
        <button
          type="button"
          aria-pressed={filters.savedOnly}
          onClick={() => set({ savedOnly: !filters.savedOnly })}
          className={cx(
            pill,
            filters.savedOnly ? "bg-tint font-semibold text-label shadow-[inset_0_0_0_1px_var(--color-accent)]" : "bg-raised font-medium text-label shadow-[inset_0_0_0_1px_var(--color-control)] hover:bg-fill",
          )}
        >
          <Heart aria-hidden className={cx("size-4", filters.savedOnly ? "fill-link text-link" : "text-label-2")} strokeWidth={2} />
          Saved
          <span className="tnum font-normal text-label-2">{savedCount}</span>
        </button>
        {activeFilters(filters) > 0 ? (
          <button type="button" onClick={() => onChange({ ...NO_FILTERS, roles: filters.roles })} className="press h-9 rounded-full px-3 text-footnote font-medium text-label-2 hover:text-label">
            Clear all
          </button>
        ) : null}
      </div>

      <label className="relative block min-[900px]:ml-auto min-[900px]:w-[300px]">
        <span className="sr-only">Search challenges</span>
        <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-label-2" strokeWidth={2} />
        <input
          type="search"
          value={filters.query}
          onChange={(e) => set({ query: e.target.value })}
          maxLength={80}
          placeholder="Search by title, company or skill"
          className="h-10 w-full rounded-full bg-raised pr-4 pl-10 text-footnote text-label shadow-[inset_0_0_0_1px_var(--color-control)] outline-none placeholder:text-label-2 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)] min-[900px]:h-9"
        />
      </label>
    </div>
  );
}

interface PillProps {
  label: string;
  /** What is picked, in a few words; empty when nothing is. */
  summary: string;
  /** Set when something is picked: a Clear item at the end of the menu. */
  onClear?: () => void;
  children: ReactNode;
}

function FilterPill({ label, summary, onClear, children }: PillProps) {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const on = Boolean(summary);

  return (
    <div className="min-[900px]:relative">
      <button
        ref={trigger}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => setOpen((o) => !o)}
        className={cx(
          "press inline-flex h-10 max-w-[260px] items-center gap-1 rounded-full pr-2 pl-3 text-footnote min-[900px]:gap-1.5 min-[900px]:pr-2.5 min-[900px]:pl-3.5 transition-colors duration-150 min-[900px]:h-9",
          on ? "bg-tint text-label shadow-[inset_0_0_0_1px_var(--color-accent)]" : "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-control)] hover:bg-fill",
        )}
      >
        <span className={on ? "text-label-2" : "font-medium"}>{label}</span>
        {on ? <span className="truncate font-semibold">{summary}</span> : null}
        <ChevronDown aria-hidden className={cx("size-4 shrink-0 text-label-2 transition-transform duration-150", open && "rotate-180")} strokeWidth={2} />
      </button>
      <Popover
        id={id}
        open={open}
        onClose={() => setOpen(false)}
        trigger={trigger}
        className="w-[264px] p-1.5"
      >
        <div role="menu" aria-label={label} onKeyDown={moveFocus} className="flex max-h-[min(360px,60dvh)] flex-col overflow-y-auto">
          {children}
          {onClear ? (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onClear();
                setOpen(false);
                trigger.current?.focus();
              }}
              className="mt-1 flex h-10 w-full shrink-0 items-center gap-3 rounded-[12px] px-3 text-left text-subhead text-label-2 shadow-[0_-1px_0_var(--color-separator)] outline-none hover:bg-fill focus-visible:bg-fill"
            >
              <X aria-hidden className="size-4" strokeWidth={2} />
              Clear
            </button>
          ) : null}
        </div>
      </Popover>
    </div>
  );
}

/** Up and down move between the menu's items, as in any menu. */
function moveFocus(e: KeyboardEvent<HTMLDivElement>) {
  if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
  e.preventDefault();
  const items = [...e.currentTarget.querySelectorAll<HTMLElement>("[role^='menuitem']")];
  const at = items.indexOf(document.activeElement as HTMLElement);
  const next = e.key === "ArrowDown" ? (at + 1) % items.length : (at - 1 + items.length) % items.length;
  items[next]?.focus();
}

function Option({ checked, onSelect, radio, children }: { checked: boolean; onSelect: () => void; radio?: boolean; children: ReactNode }) {
  return (
    <button
      type="button"
      role={radio ? "menuitemradio" : "menuitemcheckbox"}
      aria-checked={checked}
      onClick={onSelect}
      className="flex h-10 w-full shrink-0 items-center gap-3 rounded-[12px] px-3 text-left text-subhead text-label outline-none hover:bg-fill focus-visible:bg-fill"
    >
      <span
        aria-hidden
        className={cx(
          "flex size-[18px] shrink-0 items-center justify-center transition-colors duration-100",
          radio ? "rounded-full" : "rounded-[5px]",
          checked ? "bg-accent text-accent-ink" : "shadow-[inset_0_0_0_1.5px_var(--color-control)]",
        )}
      >
        {checked ? <Check className="size-3.5" strokeWidth={3} /> : null}
      </span>
      <span className="flex min-w-0 items-center gap-2 truncate">{children}</span>
    </button>
  );
}
