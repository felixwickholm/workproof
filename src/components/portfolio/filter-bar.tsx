"use client";

import { Search } from "lucide-react";
import { useState } from "react";
import type { Portfolio, TaskFormat } from "@/lib/domain/types";
import { FORMAT_LABEL, TASK_FORMATS } from "../seeker/task-format";
import { cx } from "../ui/cx";
import type { PortfolioFilter } from "./filter";

const chip =
  "press inline-flex h-9 items-center rounded-full px-3.5 text-footnote font-medium transition-colors duration-150 pointer-coarse:h-11";
const chipOn = "bg-link text-link-ink";
const chipOff =
  "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-control)] hover:shadow-[inset_0_0_0_1px_var(--color-link)]";

/** Skill chips, kind-of-task chips and a words box. Every filter only hides cards; the order stays by date. */
export function FilterBar({
  skills,
  formats,
  value,
  onChange,
}: {
  skills: Portfolio["skills"];
  formats: TaskFormat[];
  value: PortfolioFilter;
  onChange: (next: PortfolioFilter) => void;
}) {
  const [more, setMore] = useState(false);
  // Picked skills always stay in view, even when the list is short.
  const chips = more
    ? skills
    : skills.filter((s, i) => i < 8 || value.skills.includes(s.id));
  const toggleSkill = (id: string) =>
    onChange({
      ...value,
      skills: value.skills.includes(id)
        ? value.skills.filter((s) => s !== id)
        : [...value.skills, id],
    });
  return (
    <div className="flex flex-col gap-4">
      <div role="group" aria-label="Skills">
        <p className="text-footnote mb-2 font-medium text-label-2">Skills</p>
        <div className="flex flex-wrap gap-2">
          {chips.map((s) => {
            const on = value.skills.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleSkill(s.id)}
                className={cx(chip, on ? chipOn : chipOff)}
              >
                {s.label}
              </button>
            );
          })}
          {skills.length > 8 ? (
            <button
              type="button"
              aria-expanded={more}
              onClick={() => setMore(!more)}
              className={cx(chip, "text-link")}
            >
              {more ? "Fewer" : `${skills.length - 8} more`}
            </button>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col gap-3 min-[900px]:flex-row min-[900px]:items-end">
        <div role="group" aria-label="Kind of task" className="min-w-0">
          <p className="text-footnote mb-2 font-medium text-label-2">
            Kind of task
          </p>
          <div className="flex flex-wrap gap-2">
            {(
              [
                "all",
                ...TASK_FORMATS.filter((f) => formats.includes(f)),
              ] as const
            ).map((f) => {
              const on = value.format === f;
              return (
                <button
                  key={f}
                  type="button"
                  aria-pressed={on}
                  onClick={() => onChange({ ...value, format: f })}
                  className={cx(chip, on ? chipOn : chipOff)}
                >
                  {f === "all" ? "All" : FORMAT_LABEL[f]}
                </button>
              );
            })}
          </div>
        </div>
        <label className="relative block min-w-0 flex-1">
          <span className="sr-only">Find words in the work</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-label-2"
            strokeWidth={1.75}
          />
          <input
            type="search"
            value={value.text}
            onChange={(e) => onChange({ ...value, text: e.target.value })}
            maxLength={120}
            placeholder="Find a task, a company or a word"
            className="text-body h-11 w-full rounded-full bg-raised pr-4 pl-10 text-label shadow-[inset_0_0_0_1px_var(--color-control)] outline-none placeholder:text-label-3 focus:shadow-[inset_0_0_0_1.5px_var(--color-link)]"
          />
        </label>
      </div>
    </div>
  );
}
