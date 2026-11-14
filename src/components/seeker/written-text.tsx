import { useMemo } from "react";
import { markHidden } from "@/components/proof";
import { cx } from "@/components/ui/cx";

/** The person's own words, with each detail the blind layer removed under a soft highlight. */
export function WrittenText({ original, blind, className }: { original: string; blind: string; className?: string }) {
  const segments = useMemo(() => markHidden(original, blind), [original, blind]);
  return (
    <p className={cx("whitespace-pre-wrap text-pretty", className)}>
      {segments.map((s, i) =>
        s.hidden ? (
          <mark key={i} className="rounded-[5px] bg-warning-wash px-0.5 text-warning-ink [box-decoration-break:clone]">
            {s.text}
          </mark>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </p>
  );
}
