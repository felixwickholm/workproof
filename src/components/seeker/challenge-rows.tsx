"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { SeekerTask, TaskFormat } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { EmptyState } from "../ui/empty-state";
import { riseAt } from "../ui/rise";
import { SegmentedControl } from "../ui/segmented-control";
import { arrangeTasks, countByFormat, filterByFormat, rowFacts, type FormatFilter } from "./task-filter";
import { FORMAT_LABEL, FormatIcon, TASK_FORMATS } from "./task-format";

const FILTERS = [
  { value: "all" as const, label: "All" },
  ...TASK_FORMATS.map((format) => ({
    value: format,
    label: (
      <>
        <FormatIcon format={format} className="size-4 max-[560px]:hidden" />
        {FORMAT_LABEL[format]}
      </>
    ),
  })),
];

/**
 * Every open challenge as one large row, the same list for everyone, newest first. The format is the
 * first thing a person reads, because it says what they will do. A filter only removes rows.
 */
export function ChallengeRows({ tasks, tour }: { tasks: SeekerTask[]; tour?: string }) {
  const [format, setFormat] = useState<FormatFilter>("all");
  const counts = countByFormat(tasks);
  const { open, full, sent } = arrangeTasks(filterByFormat(tasks, format));
  const rows = [...open, ...full, ...sent];

  return (
    <section data-tour={tour} aria-label="Challenges">
      <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-center min-[900px]:justify-between">
        <SegmentedControl label="Show challenges by format" segments={FILTERS} value={format} onChange={setFormat} className="h-11! w-full min-[900px]:w-[520px]" />
        <p className="text-footnote text-label-2">Newest first. No profile. No match score.</p>
      </div>
      {rows.length ? (
        <ul className="mt-4 overflow-hidden rounded-card bg-surface">
          {rows.map((task, i) => (
            <li key={task.challenge.id} className="rise border-separator not-first:border-t" style={riseAt(Math.min(i, 8))}>
              <ChallengeRow task={task} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState className="mt-4">
          {format === "all" ? "No challenge is open yet. Look again closer to the event." : `No ${FORMAT_LABEL[format as TaskFormat]} challenge is open (${counts[format]}). Try another.`}
        </EmptyState>
      )}
    </section>
  );
}

function ChallengeRow({ task }: { task: SeekerTask }) {
  const { challenge } = task;
  const state = task.mine ? "sent" : task.placesLeft === 0 ? "full" : "open";
  return (
    <Link
      href={task.mine ? "/my-work" : `/challenges/${challenge.id}`}
      className={cx(
        "group grid min-h-[104px] grid-cols-[1fr_auto] items-center gap-x-6 gap-y-1 px-5 py-5 transition-colors duration-150 hover:bg-fill min-[900px]:grid-cols-[176px_1fr_auto] min-[900px]:px-6",
        state !== "open" && "text-label-2",
      )}
    >
      <span className="col-span-2 flex items-center gap-2.5 min-[900px]:col-span-1">
        <FormatIcon format={challenge.format} className="size-6 text-label" />
        <span className="text-[24px] leading-[30px] font-semibold tracking-[-0.015em] text-label">{FORMAT_LABEL[challenge.format]}</span>
      </span>
      <span className="min-w-0">
        <span className={cx("block text-[20px] leading-[26px] font-semibold text-pretty", state === "open" ? "text-label" : "text-label-2")}>{challenge.title}</span>
        <span className="text-body tnum mt-1 block text-label-2">{rowFacts(task)}</span>
      </span>
      <span className="text-body flex items-center gap-2 justify-self-end text-label-2">
        {state === "sent" ? (
          <>
            <Check aria-hidden className="size-5" strokeWidth={1.75} />
            <span className="max-[560px]:sr-only">Sent</span>
          </>
        ) : state === "full" ? (
          "Full"
        ) : (
          <ChevronRight aria-hidden className="size-6 transition-transform duration-150 group-hover:translate-x-0.5" strokeWidth={1.75} />
        )}
      </span>
    </Link>
  );
}
