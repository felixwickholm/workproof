"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import type { SeekerTask } from "@/lib/domain/types";
import { CompanyLogo } from "../ui/avatar";
import { cx } from "../ui/cx";
import { plural } from "../words";
import { publishedLabel } from "./challenge-filter";
import { SaveButton } from "./save-button";

export interface TableGroup {
  key: string;
  /** Shown over the group's rows; null for a single list without groups. */
  title: string | null;
  tasks: SeekerTask[];
  /** One line when the group has no rows, so the frame stays. */
  empty?: string;
}

interface Props {
  groups: TableGroup[];
  tour?: string;
  /** The tour's target: the first row of the first group with rows. */
  rowTour?: string;
}

/**
 * The company challenges as a job board lists its ads: one white row per challenge, the company's logo
 * large on the left, the title in bold, one line of facts, the skills scored as small tags, and Save on
 * the right. The title is the row's link and covers the whole row, so Save stays its own button.
 */
export function ChallengeTable({ groups, tour, rowTour }: Props) {
  const firstRowId = groups.find((g) => g.tasks.length)?.tasks[0]?.challenge.id;
  return (
    <div data-tour={tour} className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key} aria-label={group.title ?? "Challenges"}>
          {group.title ? (
            <h2 className="mb-3 flex items-baseline gap-2 text-h4 text-label">
              {group.title}
              <span className="tnum font-sans text-footnote font-normal text-label-2">{group.tasks.length}</span>
            </h2>
          ) : null}
          {group.tasks.length ? (
            <ul className="overflow-hidden rounded-[16px] bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)]">
              {group.tasks.map((task) => (
                <li key={task.challenge.id} data-tour={task.challenge.id === firstRowId ? rowTour : undefined} className="border-t border-separator first:border-t-0">
                  <Row task={task} />
                </li>
              ))}
            </ul>
          ) : group.empty ? (
            <p className="rounded-[16px] bg-raised px-5 py-4 text-footnote text-label-2 shadow-[inset_0_0_0_1px_var(--color-separator)]">{group.empty}</p>
          ) : null}
        </section>
      ))}
    </div>
  );
}

function placesWords(task: SeekerTask): string {
  if (task.mine) return "You sent work";
  if (task.challenge.kind !== "event") return "Open";
  return task.placesLeft === 0 ? "Full" : `${plural(task.placesLeft, "place")} left`;
}

function Row({ task }: { task: SeekerTask }) {
  const { challenge } = task;
  const company = task.companies.map((c) => c.name).join(" and ");
  const lead = task.companies[0] ?? { name: company };
  const places = placesWords(task);
  const done = task.mine || (challenge.kind === "event" && task.placesLeft === 0);
  const published = publishedLabel(challenge.publishedAt ?? challenge.createdAt);

  return (
    <div className="group relative grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-x-4 px-4 py-5 transition-colors duration-150 hover:bg-fill min-[900px]:grid-cols-[96px_minmax(0,1fr)_auto] min-[900px]:items-center min-[900px]:gap-x-6 min-[900px]:px-6 min-[900px]:py-6">
      <span className="flex justify-center pt-0.5 min-[900px]:pt-0">
        <CompanyLogo company={lead} size="lg" className="min-[900px]:hidden" />
        <CompanyLogo company={lead} size="xl" className="max-[899px]:hidden" />
      </span>

      <div className="min-w-0">
        <h3 className={cx("text-h5 text-pretty min-[900px]:text-h4", done ? "text-label-2" : "text-label")}>
          <Link
            href={task.mine ? "/my-work" : `/challenges/${challenge.id}`}
            aria-label={`${challenge.title}. ${company}. ${challenge.minutes} min, ${places.toLowerCase()}.`}
            className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:rounded-[16px] focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-accent"
          >
            {challenge.title}
          </Link>
        </h3>
        <p className="tnum mt-1 flex flex-wrap items-center gap-x-1.5 text-footnote text-label-2">
          <span className="font-medium text-label">{company}</span>
          <Dot />
          <span>{challenge.minutes} min</span>
          <Dot />
          {task.mine ? (
            <span className="inline-flex items-center gap-1 font-medium text-positive-ink">
              <Check aria-hidden className="size-3.5" strokeWidth={2.5} />
              {places}
            </span>
          ) : (
            <span>{places}</span>
          )}
          {published ? (
            <>
              <Dot />
              <span>{published}</span>
            </>
          ) : null}
        </p>
        {challenge.coreSkills.length ? (
          <ul aria-label="Skills scored" className="mt-3 flex flex-wrap gap-1.5">
            {challenge.coreSkills.map((skill) => (
              <li key={skill.id} className="rounded-full bg-surface px-2.5 py-0.5 text-caption text-label group-hover:bg-raised">
                {skill.label}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <SaveButton challengeId={challenge.id} title={challenge.title} className="relative z-10 -mr-2 -mt-1 min-[900px]:mt-0" />
    </div>
  );
}

function Dot() {
  return <span aria-hidden>·</span>;
}
