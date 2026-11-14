import { Download, Mail } from "lucide-react";
import { cx } from "../ui/cx";

const ACTION =
  "press inline-flex h-[38px] shrink-0 items-center justify-center gap-2 rounded-full px-4 text-[15px] leading-5 font-semibold transition-colors duration-150 pointer-coarse:h-11 pointer-coarse:px-5";

/**
 * What the organiser can do from here: export the meeting list for the event's own meeting tool,
 * and draft reminders to employers that still owe answers. Nothing is sent from Workprint.
 */
export function OrganiserActions({ employersOwing, className }: { employersOwing: number; className?: string }) {
  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center gap-2">
        {/* A plain link with `download`: the browser saves the file and the page stays where it is. */}
        <a href="/api/city/meetings.csv" download="workprint-meetings.csv" className={cx(ACTION, "bg-accent text-accent-ink")}>
          <Download aria-hidden className="size-4" strokeWidth={1.8} />
          Export meetings
        </a>
        <a href="#reminders" className={cx(ACTION, "bg-fill text-label hover:bg-label/10")}>
          <Mail aria-hidden className="size-4" strokeWidth={1.8} />
          {employersOwing > 0 ? `Draft reminders (${employersOwing})` : "Draft reminders"}
        </a>
      </div>
      <p className="text-footnote text-pretty text-label-2">CSV for the event&apos;s meeting tool. Names appear only for meetings the person accepted.</p>
    </div>
  );
}
