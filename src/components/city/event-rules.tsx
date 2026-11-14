import type { EventRules } from "@/lib/service/city-actions";
import { Card } from "../ui/card";
import { cx } from "../ui/cx";

/** The two rules every employer at the event agreed to, with the values the code enforces. */
export function EventRulesCard({ rules, className }: { rules: EventRules | null; className?: string }) {
  return (
    <Card className={cx("flex flex-col", className)}>
      <h2 className="text-section text-label">Rules for this event</h2>
      <dl className="mt-3 flex flex-1 flex-col gap-3">
        <div>
          <dt className="text-subhead font-medium text-label">Answer window: {rules ? `${rules.responseWindowHours} hours` : "…"}</dt>
          <dd className="text-footnote mt-0.5 text-pretty text-label-2">After that, with the person&apos;s consent, the work can go to another employer.</dd>
        </div>
        <div>
          <dt className="text-subhead font-medium text-label">Task length: {rules ? `${rules.maxTaskMinutes} minutes at most` : "…"}</dt>
          <dd className="text-footnote mt-0.5 text-pretty text-label-2">A longer task cannot be published.</dd>
        </div>
      </dl>
    </Card>
  );
}
