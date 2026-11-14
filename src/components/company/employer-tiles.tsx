import type { EmployerHome } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { StatTile } from "../ui/stat-tile";
import { hoursText, meetingsCaption, ownWaiting } from "./employer-format";

const hours = (n: number) => hoursText(n) ?? "";

/** The four counts an employer checks first. Only the company's own numbers; nothing about a person. */
export function EmployerTiles({ home, className }: { home: EmployerHome; className?: string }) {
  const { counts } = home;
  const own = ownWaiting(counts, home.secondLookWaiting);
  const owed = counts.feedbackOwed > 0;
  return (
    <div className={cx("grid grid-cols-2 gap-3 min-[900px]:grid-cols-4 min-[900px]:gap-4", className)}>
      <StatTile
        label="Waiting to be read"
        value={counts.waiting}
        caption={home.secondLookWaiting > 0 ? `${own} yours · ${home.secondLookWaiting} Second look` : "In your queue"}
      />
      <StatTile
        label="Answers you owe"
        value={counts.feedbackOwed}
        caption="Every decision comes with a written reason"
        className={cx(owed && "[&_.text-kpi]:text-warning")}
      />
      <StatTile
        label="Median reply time"
        value={counts.medianHoursToRespond ?? "–"}
        format={hours}
        caption={counts.medianHoursToRespond === null ? "No answers sent yet" : "From arrival to your answer"}
        className={cx(counts.medianHoursToRespond === null && "[&_.text-kpi]:text-label-2")}
      />
      <StatTile label="Meetings" value={counts.meetings} caption={meetingsCaption(home.pipeline)} />
    </div>
  );
}
