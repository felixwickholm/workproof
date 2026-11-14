import type { EmployerHome } from "@/lib/domain/types";
import { PipelineBar } from "../proof";
import { Panel } from "../ui/card";
import { afterReading, firstMeetingLine } from "./employer-format";

/**
 * "From task to meeting": what happened after reading, step by step, and how fast the first
 * meeting came. What waits to be read is counted once, in the tiles above.
 */
export function PipelinePanel({ home, className }: { home: EmployerHome; className?: string }) {
  const first = firstMeetingLine(home.hoursToFirstMeeting);
  return (
    <Panel title="From task to meeting" className={className}>
      <PipelineBar stages={afterReading(home.pipeline)} className="mt-3" />
      <p className="text-subhead mt-6 text-pretty text-label">{first ?? "No meeting yet. The first Meet starts the clock."}</p>
      <p className="text-footnote mt-1 text-pretty text-label-2">
        Each step is a person&rsquo;s choice: you answer, you invite, they accept, both of you confirm you met.
      </p>
    </Panel>
  );
}
