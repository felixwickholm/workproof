import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * An empty block keeps its frame: one sentence about what will appear here, and the next step
 * when there is one. No picture, no "No data".
 */
export function EmptyState({ children, action, className }: { children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <div className={cx("flex flex-col items-start gap-3 rounded-[16px] px-4 py-4 shadow-[inset_0_0_0_1px_var(--color-separator)]", className)}>
      <p className="text-subhead text-pretty text-label-2">{children}</p>
      {action}
    </div>
  );
}
