import type { ReviewPrompt, Skill } from "@/lib/domain/types";
import { cx } from "../ui/cx";

/**
 * What a person at the company looks for, one line per core skill, in words. Nothing here can be
 * ticked, counted or scored: the reviewer reads the work against it and writes what they saw.
 */
export function ReviewGuide({ guide, skills, className }: { guide: ReviewPrompt[]; skills: Skill[]; className?: string }) {
  const label = (id: string) => skills.find((s) => s.id === id)?.label ?? id;
  return (
    <ul className={cx("flex flex-col gap-4", className)}>
      {guide.map((g) => (
        <li key={g.skillId}>
          <p className="text-footnote font-medium text-label-2">{label(g.skillId)}</p>
          <p className="text-subhead mt-0.5 text-pretty text-label">{g.lookFor}</p>
        </li>
      ))}
    </ul>
  );
}
