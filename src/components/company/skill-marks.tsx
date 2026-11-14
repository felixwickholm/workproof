import type { Skill, SkillScore } from "@/lib/domain/types";
import { cx } from "../ui/cx";

/** Five dots for one skill, filled up to the points a person gave. */
function PointDots({ points, className }: { points: number; className?: string }) {
  return (
    <span aria-hidden className={cx("flex shrink-0 gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={cx("size-2 rounded-full", n <= points ? "bg-label" : "bg-fill")} />
      ))}
    </span>
  );
}

/** Each skill's points as five dots beside the skill word, in the challenge's skill order. */
export function SkillMarks({ scores, skills, className }: { scores: readonly SkillScore[]; skills: readonly Skill[]; className?: string }) {
  return (
    <ul className={cx("flex flex-col gap-1.5", className)}>
      {skills.map((skill) => {
        const points = scores.find((s) => s.skillId === skill.id)?.points ?? 0;
        return (
          <li key={skill.id} className="flex items-center justify-between gap-3">
            <span className="text-footnote min-w-0 text-pretty text-label-2">{skill.label}</span>
            <PointDots points={points} />
            <span className="sr-only">
              {points} of 5
            </span>
          </li>
        );
      })}
    </ul>
  );
}
