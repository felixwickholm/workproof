"use client";

import { EyeOff, X } from "lucide-react";
import type { Skill } from "@/lib/domain/types";
import { Card } from "../ui/card";
import { countWishes, isNotUsed, notUsedNames, splitAside } from "./format";

const MIN_SKILLS = 3;

/** "You listed N wishes. These M are the job." with a strip that shows the cut at a glance. */
export function TrimHeadline({ skills, setAside }: { skills: Skill[]; setAside: string[] }) {
  const wishes = Math.max(countWishes(skills.length, setAside), skills.length);
  const kept = skills.length;
  return (
    <Card className="highlight">
      <p className="text-title-3 font-bold text-pretty">
        You listed {wishes} {wishes === 1 ? "wish" : "wishes"}.{" "}
        <span className="text-label-2">{kept === wishes ? `All ${kept} are the job.` : `These ${kept} are the job.`}</span>
      </p>
      <div aria-hidden className="mt-4 flex gap-1">
        {Array.from({ length: wishes }, (_, i) => (
          <span key={i} className={i < kept ? "h-1.5 flex-1 rounded-full bg-white" : "h-1.5 flex-1 rounded-full bg-fill"} />
        ))}
      </div>
    </Card>
  );
}

/** Core skills with their reason. A skill can be removed while more than three remain. */
export function CoreSkillList({ skills, onRemove }: { skills: Skill[]; onRemove?: (id: string) => void }) {
  const canRemove = Boolean(onRemove) && skills.length > MIN_SKILLS;
  return (
    <ul className="overflow-hidden rounded-card bg-surface">
      {skills.map((s) => (
        <li key={s.id} className="row relative flex items-start gap-1 py-3 pl-4">
          <div className="min-w-0 flex-1">
            <p className="text-headline font-semibold">{s.label}</p>
            <p className="text-subhead mt-0.5 text-label-2 text-pretty">{s.why}</p>
          </div>
          {onRemove ? (
            <button
              type="button"
              onClick={() => onRemove(s.id)}
              disabled={!canRemove}
              aria-label={`Remove ${s.label}`}
              className="press -my-1 flex size-11 shrink-0 items-center justify-center text-label-2 transition-opacity duration-150 disabled:opacity-0"
            >
              <X aria-hidden className="size-[18px]" strokeWidth={2.2} />
            </button>
          ) : (
            <span className="w-3" />
          )}
        </li>
      ))}
    </ul>
  );
}

/** The wishes the draft left out, struck through, and the protected attributes it never uses. */
export function SetAsideList({ setAside }: { setAside: string[] }) {
  const wishes = setAside.filter((line) => !isNotUsed(line));
  const notUsed = setAside.filter(isNotUsed).flatMap(notUsedNames);
  if (wishes.length === 0 && notUsed.length === 0) {
    return <p className="text-subhead px-4 text-label-2">Nothing. Every wish was part of the job.</p>;
  }
  return (
    <ul className="overflow-hidden rounded-card bg-surface">
      {wishes.map((line) => {
        const { wish, reason } = splitAside(line);
        return (
          <li key={line} className="row relative px-4 py-3">
            <p className="text-body text-label-3 line-through decoration-label-3">{wish}</p>
            {reason ? <p className="text-footnote mt-0.5 text-label-2">{reason}</p> : null}
          </li>
        );
      })}
      {notUsed.length > 0 ? (
        <li className="row relative flex gap-3 px-4 py-3.5">
          <EyeOff aria-hidden className="mt-0.5 size-[18px] shrink-0 text-label-2" strokeWidth={1.8} />
          <div className="min-w-0">
            <p className="text-body text-pretty">Not used: {notUsed.join(", ")}</p>
            <p className="text-footnote mt-0.5 text-label-2 text-pretty">
              They describe a person, not the work, so the task leaves them out.
            </p>
          </div>
        </li>
      ) : null}
    </ul>
  );
}
