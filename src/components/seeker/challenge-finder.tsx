"use client";

import { useMemo, useState } from "react";
import { getChosenRoles, getIdentity, saveChosenRoles } from "@/lib/client/local";
import type { JobRole, SeekerTask } from "@/lib/domain/types";
import { PERSONA_ROLES } from "@/lib/seed/roles";
import { Button } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { ROLE_LABEL } from "@/lib/domain/roles";
import { plural } from "../words";
import { activeFilters, applyFilters, filterChoices, groupByRoles, NO_FILTERS, roleCounts, type ChallengeFilters } from "./challenge-filter";
import { ChallengeTable, type TableGroup } from "./challenge-table";
import { FilterBar } from "./filter-bar";
import { RoleChips } from "./role-chips";
import { useSaved } from "./use-saved";

/**
 * The roles a visitor picked before, else the demo person's role while they explore as him, else none.
 * Runs in the browser only: this component renders after the challenges have loaded there.
 */
function startingRoles(): JobRole[] {
  return getChosenRoles() ?? (getIdentity() === "persona" ? [...PERSONA_ROLES] : []);
}

/** "AI developer challenges" for one role, "For your roles" for more. */
function fitsTitle(roles: readonly JobRole[]): string {
  return roles.length === 1 ? `${ROLE_LABEL[roles[0]]} challenges` : "For your roles";
}

/**
 * How a job seeker finds a challenge, the way a job board works: the roles they want as tiles
 * (remembered on this device), one compact filter row, and the list with their roles first.
 */
export function ChallengeFinder({ tasks }: { tasks: SeekerTask[] }) {
  const [roles, setRoles] = useState<JobRole[]>(startingRoles);
  const [filters, setFilters] = useState<ChallengeFilters>(NO_FILTERS);
  const { saved } = useSaved();
  const choices = useMemo(() => filterChoices(tasks), [tasks]);
  const counts = useMemo(() => roleCounts(tasks), [tasks]);
  const shown = useMemo(() => applyFilters(tasks, filters, saved), [tasks, filters, saved]);

  const pickRoles = (next: JobRole[]) => {
    setRoles(next);
    saveChosenRoles(next);
  };

  const { fits, rest } = groupByRoles(shown, roles);
  const groups: TableGroup[] = roles.length
    ? [
        { key: "fits", title: fitsTitle(roles), tasks: fits, empty: "No challenge for your roles matches these filters." },
        { key: "rest", title: "More challenges, other roles", tasks: rest },
      ].filter((g) => g.tasks.length || g.empty)
    : [{ key: "all", title: null, tasks: rest }];

  return (
    <div className="flex flex-col gap-8 min-[900px]:gap-10">
      <RoleChips chosen={roles} onChange={pickRoles} counts={counts} tour="seeker-roles" />
      <div className="flex flex-col gap-4">
        <FilterBar filters={filters} onChange={setFilters} choices={choices} savedCount={saved.length} tour="challenge-filters" />
        <p className="tnum text-footnote text-label-2" aria-live="polite">
          {activeFilters(filters) ? `${shown.length} of ${plural(tasks.length, "challenge")}` : plural(tasks.length, "challenge")}, newest first
        </p>
        {shown.length ? (
          <ChallengeTable groups={groups} tour="challenge-table" rowTour="challenge-row" />
        ) : (
          <EmptyState
            action={
              tasks.length ? (
                <Button variant="secondary" size="sm" onClick={() => setFilters(NO_FILTERS)}>
                  Clear filters
                </Button>
              ) : undefined
            }
          >
            {filters.savedOnly && !saved.length
              ? "You have not saved a challenge yet. Tap Save on one to keep it here."
              : tasks.length
                ? "No challenge matches these filters."
                : "No challenge is open yet. Look again closer to the event."}
          </EmptyState>
        )}
      </div>
    </div>
  );
}
