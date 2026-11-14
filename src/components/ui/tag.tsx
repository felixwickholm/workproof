import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

/** A neutral chip, used for skills and meta. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex h-7 items-center rounded-full bg-fill px-3 text-footnote font-medium", className)}>
      {children}
    </span>
  );
}

/** Quiet monochrome label on anything the AI wrote. */
export function AiTag() {
  return (
    <span className="inline-flex h-5 items-center rounded-full px-2 text-caption font-medium text-label-2 shadow-[inset_0_0_0_0.5px_var(--color-label-3)]">
      AI draft
    </span>
  );
}

/** Marks a decision a person made. The only place the accent colour appears. */
export function HumanTag({ children = "Human decision" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 text-footnote font-semibold text-accent">
      <Check aria-hidden className="size-4" strokeWidth={2.6} />
      {children}
    </span>
  );
}
