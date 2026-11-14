"use client";

import { useState } from "react";
import type { Portfolio } from "@/lib/domain/types";

/**
 * Where the person has shown work: one bar per skill, "3 of 7 challenges". The bar is that share of the challenges, a
 * count and never a level, so a skill used once is not "weak".
 */
export function SkillBars({
  skills,
  tasks,
  limit = 6,
}: {
  skills: Portfolio["skills"];
  tasks: number;
  limit?: number;
}) {
  const [all, setAll] = useState(false);
  const shown = all ? skills : skills.slice(0, limit);
  return (
    <>
      <ul className="flex flex-col gap-3.5">
        {shown.map((s) => (
          <li key={s.id}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-subhead font-medium text-label">
                {s.label}
              </span>
              <span className="text-footnote tnum shrink-0 text-label-2">
                {s.tasks} of {tasks} {tasks === 1 ? "challenge" : "challenges"}
              </span>
            </div>
            <div
              aria-hidden
              className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-separator"
            >
              <div
                className="h-full rounded-full bg-link"
                style={{
                  width: `${Math.round((s.tasks / Math.max(tasks, 1)) * 100)}%`,
                }}
              />
            </div>
          </li>
        ))}
      </ul>
      {skills.length > limit ? (
        <button
          type="button"
          aria-expanded={all}
          onClick={() => setAll(!all)}
          className="text-subhead mt-3 inline-flex h-11 items-center font-medium text-link hover:underline"
        >
          {all ? "Show fewer skills" : `Show all ${skills.length} skills`}
        </button>
      ) : null}
    </>
  );
}
