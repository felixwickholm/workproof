import type { Challenge, TaskImpact } from "@/lib/domain/types";
import { plural } from "../words";
import { BarRows, type BarRow } from "./bar-rows";
import { SCORED_TONE } from "./chart-tip";
import { lengthOf, rolesInDemand } from "./charts";

/**
 * Roles in demand: places companies opened per role, one series, largest first, with the challenges and
 * the work handed in under each role. The tail folds into "Other roles", set apart.
 */
export function DemandPanel({ challenges, tasks }: { challenges: readonly Challenge[]; tasks: readonly TaskImpact[] }) {
  const roles = rolesInDemand(challenges, tasks, 7);
  if (roles.length === 0) return <p className="text-body text-label-2">No company has a challenge yet.</p>;
  const max = Math.max(0, ...roles.map((r) => r.places));
  const rows: BarRow[] = roles.map((r) => ({
    key: r.role,
    label: r.role,
    note: `${plural(r.challenges, "challenge")} · ${r.took} took it`,
    segments: [{ share: lengthOf(r.places, max), tone: SCORED_TONE, tip: { value: plural(r.places, "place"), label: r.role } }],
    value: r.places,
    apart: r.role === "Other roles",
  }));
  return <BarRows label="Places per role" rows={rows} />;
}
