import type { ReviewPrompt, Skill } from "@/lib/domain/types";

/**
 * What a human reviewer looks for, one prompt per core skill.
 * Numbered, to read against the work; nothing here can be ticked or scored.
 */
export function ReviewGuide({ guide, skills }: { guide: ReviewPrompt[]; skills: Skill[] }) {
  const label = (id: string) => skills.find((s) => s.id === id)?.label ?? id;
  return (
    <ul className="overflow-hidden rounded-card bg-surface">
      {guide.map((g, i) => (
        <li key={g.skillId} className="row relative flex gap-3 px-5 py-3.5 [--row-inset:48px]">
          <span aria-hidden className="text-footnote tnum w-4 shrink-0 pt-px font-mono font-semibold text-label-3">
            {i + 1}
          </span>
          <div className="min-w-0">
            <p className="text-footnote font-medium text-label-2">{label(g.skillId)}</p>
            <p className="text-body mt-0.5 text-pretty">{g.lookFor}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
