import Link from "next/link";
import { ChevronRight, X } from "lucide-react";
import type { TaskFormat, TaskImpact } from "@/lib/domain/types";
import { Bar } from "./bars";
import { FORMAT_LABEL, formatTotal } from "../words";
import { taskState } from "./impact";

interface Props {
  tasks: TaskImpact[];
  /** Each challenge's format, by challenge id. */
  formats: Record<string, TaskFormat>;
  /** Hours the oldest unscored work has waited, by challenge id, when known. */
  oldest: Record<string, number>;
  /** The company the map picked; the table shows only its challenges. */
  company: string | null;
  onClearCompany: () => void;
}

const COUNTS = [
  { key: "invited", label: "Invited" },
  { key: "agreed", label: "Said yes" },
  { key: "met", label: "Talked" },
  { key: "followUps", label: "Follow-up" },
] as const;

const href = (id: string) => `/city/challenges/${encodeURIComponent(id)}`;

function meta(task: TaskImpact, formats: Props["formats"]) {
  const format = formats[task.challengeId];
  return [task.companies.join(" and "), format ? FORMAT_LABEL[format] : null].filter(Boolean).join(" · ");
}

/** "Scored of took" as a number and a thin bar under it. */
function ScoredCell({ task }: { task: TaskImpact }) {
  return (
    <span className="block w-16">
      <span className="tnum block">{task.scored}</span>
      <span className="mt-1.5 block h-1 w-full rounded-full bg-fill">
        <Bar share={task.scoredShare} grown tone="accent" className="h-1" />
      </span>
    </span>
  );
}

/**
 * How each challenge did: one row per challenge, most work first. A row opens the challenge's own page.
 * Laptop: a table. Phone: one block per challenge with the counts in a line.
 */
export function ChallengeTable({ tasks, formats, oldest, company, onClearCompany }: Props) {
  return (
    <div className="@container">
      {company ? (
        <div className="mb-3 flex items-center gap-2">
          <p className="text-subhead text-label-2">
            Challenges of <span className="font-medium text-label">{company}</span>
          </p>
          <button
            type="button"
            onClick={onClearCompany}
            className="press text-subhead inline-flex h-11 items-center gap-1 rounded-full px-3 font-medium text-label-2 hover:text-label"
          >
            <X aria-hidden className="size-4" strokeWidth={1.75} />
            Show all
          </button>
        </div>
      ) : null}

      <table className="hidden w-full border-collapse text-left @min-[760px]:table">
        <thead>
          <tr className="text-footnote text-label-2">
            <th scope="col" className="pb-3 font-normal">Challenge</th>
            <th scope="col" className="w-16 pb-3 font-normal">Took</th>
            <th scope="col" className="w-20 pb-3 font-normal">Scored</th>
            {COUNTS.map((c) => (
              <th key={c.key} scope="col" className="w-20 pb-3 font-normal">
                {c.label}
              </th>
            ))}
            <th scope="col" className="w-24 pb-3 font-normal">Top score</th>
            <th aria-hidden className="w-6 pb-3" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.challengeId} className="group relative hairline-t align-top transition-colors duration-150 hover:bg-fill/50">
              <td className="py-4 pr-6">
                <Link href={href(task.challengeId)} className="text-headline block font-medium text-label outline-none after:absolute after:inset-0 after:rounded-[12px] focus-visible:after:ring-2 focus-visible:after:ring-accent">
                  {task.title}
                </Link>
                <span className="text-footnote mt-1 block text-label-2">{meta(task, formats)}</span>
                <span className="text-footnote mt-0.5 block text-label-3">{taskState(task, oldest[task.challengeId] ?? null)}</span>
              </td>
              <td className="text-headline tnum py-4">{task.took}</td>
              <td className="text-headline py-4">
                <ScoredCell task={task} />
              </td>
              {COUNTS.map((c) => (
                <td key={c.key} className="text-headline tnum py-4 text-label-2">
                  {task[c.key]}
                </td>
              ))}
              <td className="text-headline tnum py-4">{task.topTotal === null ? <span className="text-label-3">–</span> : formatTotal(task.topTotal)}</td>
              <td className="py-4">
                <ChevronRight aria-hidden className="size-5 text-label-3 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.75} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ul className="@min-[760px]:hidden">
        {tasks.map((task) => (
          <li key={task.challengeId} className="[&+&]:hairline-t">
            <Link href={href(task.challengeId)} className="press flex items-start gap-3 py-4">
              <span className="min-w-0 flex-1">
                <span className="text-headline block font-medium text-label">{task.title}</span>
                <span className="text-footnote mt-1 block text-label-2">{meta(task, formats)}</span>
                <span className="text-subhead tnum mt-2 block text-label">
                  {task.took} took · {task.scored} scored · {task.invited} invited · {task.met} talked
                  {task.topTotal === null ? "" : ` · top ${formatTotal(task.topTotal)}`}
                </span>
                <span className="mt-2 block h-1 w-full max-w-[200px] rounded-full bg-fill">
                  <Bar share={task.scoredShare} grown tone="accent" className="h-1" />
                </span>
                <span className="text-footnote mt-2 block text-label-3">{taskState(task, oldest[task.challengeId] ?? null)}</span>
              </span>
              <ChevronRight aria-hidden className="mt-1 size-5 shrink-0 text-label-3" strokeWidth={1.75} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
