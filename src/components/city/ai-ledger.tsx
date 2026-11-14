import type { AuditEvent } from "@/lib/domain/types";
import { countAiWork } from "@/lib/service/ai-work";
import { Panel } from "../ui/card";
import { cx } from "../ui/cx";

const never = ["Scores or rates a person", "Ranks or shortlists people", "Decides who to meet", "Analyses a voice or a face"];

/** What automation did at this event, counted from the audit log, and the one count that stays at zero. */
export function AiLedger({ audit, className }: { audit: AuditEvent[]; className?: string }) {
  const done = countAiWork(audit);
  const rows = [
    { figure: done.drafted, title: "Tasks drafted", detail: "None went live until a person approved it." },
    { figure: done.questions, title: "Follow-up questions", detail: "About the person's own choices, asked after they sent the work." },
    { figure: done.hidden, title: "Personal details hidden", detail: "By a fixed rule, not by AI, before anyone read the work." },
    { figure: 0, title: "Decisions about people", detail: "Every decision was made and signed by a person." },
  ];

  return (
    <Panel title="What the AI did" className={cx("flex flex-col", className)}>
      <ul>
        {rows.map((row) => (
          <li key={row.title} className="grid grid-cols-[56px_minmax(0,1fr)] gap-x-3 py-3 first:pt-1 [&+&]:hairline-t">
            <span className="text-title-3 tnum font-normal text-label">{row.figure}</span>
            <span>
              <span className="text-subhead block font-medium text-label">{row.title}</span>
              <span className="text-footnote block text-pretty text-label-2">{row.detail}</span>
            </span>
          </li>
        ))}
      </ul>
      <h3 className="text-subhead mt-auto pt-5 font-medium text-label">What the AI never does</h3>
      <ul className="mt-1">
        {never.map((item) => (
          <li key={item} className="text-footnote flex items-baseline justify-between gap-3 py-2 [&+&]:hairline-t">
            <span className="text-label">{item}</span>
            <span className="text-label-2">Never</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
