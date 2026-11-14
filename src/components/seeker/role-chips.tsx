"use client";

import { JOB_ROLES, ROLE_LABEL } from "@/lib/domain/roles";
import type { JobRole } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { plural } from "../words";

interface Props {
  chosen: readonly JobRole[];
  onChange: (roles: JobRole[]) => void;
  /** Challenges per role. A role with none is left out unless it is picked, so every tile leads somewhere. */
  counts: ReadonlyMap<JobRole, number>;
  tour?: string;
}

/**
 * "What work do you want?": one tile per role with its challenge count. Pick one or more; their
 * challenges come first. On a phone the tiles scroll sideways in one row, so the list still starts
 * on the first screen.
 */
export function RoleChips({ chosen, onChange, counts, tour }: Props) {
  const toggle = (role: JobRole) => onChange(JOB_ROLES.filter((r) => (r === role ? !chosen.includes(r) : chosen.includes(r))));
  return (
    <ul
      data-tour={tour}
      aria-label="Roles"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] min-[900px]:mx-0 min-[900px]:flex-wrap min-[900px]:gap-2.5 min-[900px]:overflow-visible min-[900px]:px-0"
    >
      {JOB_ROLES.filter((role) => counts.get(role) || chosen.includes(role)).map((role) => {
        const on = chosen.includes(role);
        const count = counts.get(role) ?? 0;
        return (
          <li key={role} className="shrink-0">
            <button
              type="button"
              aria-pressed={on}
              aria-label={ROLE_LABEL[role]}
              onClick={() => toggle(role)}
              className={cx(
                "press flex min-h-[60px] flex-col items-start justify-center rounded-[14px] px-4 py-2 text-left transition-colors duration-150",
                on ? "bg-accent text-accent-ink" : "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-control)] hover:bg-fill",
              )}
            >
              <span className="text-body font-semibold whitespace-nowrap">{ROLE_LABEL[role]}</span>
              <span aria-hidden className={cx("tnum text-caption whitespace-nowrap", on ? "opacity-80" : "text-label-2")}>
                {plural(count, "challenge")}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
