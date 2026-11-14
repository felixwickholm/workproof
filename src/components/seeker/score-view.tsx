import { SCORE_LEVELS } from "@/lib/domain/scoring";
import type { SkillScore } from "@/lib/domain/types";
import { cx } from "../ui/cx";

/** "9.0": a total always keeps its one decimal, so 9 and 9.0 never both appear. */
export function totalText(total: number): string {
  return total.toFixed(1);
}

export function levelWord(points: SkillScore["points"]): string {
  return SCORE_LEVELS.find((l) => l.points === points)?.label ?? "";
}

/** Five marks, the given number filled: the 1 to 5 points a reviewer gave one skill. */
export function PointMarks({ points, className }: { points: number; className?: string }) {
  return (
    <span role="img" aria-label={`${points} of 5`} className={cx("inline-flex gap-1", className)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} aria-hidden className={cx("h-2 w-5 rounded-full", n <= points ? "bg-accent" : "bg-fill")} />
      ))}
    </span>
  );
}

interface Props {
  total: number;
  scores: (SkillScore & { label: string })[];
  /** The task's "look for" line per skill, under each skill. */
  lookFor?: Record<string, string>;
  /** "lg" for the My work page (44px total), "md" inside an invitation. */
  size?: "lg" | "md";
  className?: string;
}

/** A person's total out of 10, then each skill with its points and the level word. */
export function ScoreView({ total, scores, lookFor, size = "lg", className }: Props) {
  return (
    <div className={className}>
      <p className="flex items-baseline gap-2 text-label">
        <span className={cx("tnum font-normal tracking-[-0.02em]", size === "lg" ? "text-[44px] leading-[48px]" : "text-[36px] leading-[40px]")}>{totalText(total)}</span>
        <span className="text-body text-label-2">of 10</span>
      </p>
      <ul className={cx("flex flex-col", size === "lg" ? "mt-6 gap-5" : "mt-4 gap-3")}>
        {scores.map((s) => (
          <li key={s.skillId}>
            <p className="text-body font-medium text-pretty text-label">{s.label}</p>
            <div className="mt-1.5 flex items-center gap-3">
              <PointMarks points={s.points} />
              <span className="text-footnote tnum text-label-2">
                {s.points} of 5 · {levelWord(s.points)}
              </span>
            </div>
            {lookFor?.[s.skillId] ? <p className="text-footnote mt-1 text-pretty text-label-2">Looks for: {lookFor[s.skillId]}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
