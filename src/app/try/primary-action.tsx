"use client";

import { useId, type ReactNode } from "react";
import { LockedButton } from "@/components/controls/locked-button";

interface Props {
  children: ReactNode;
  onClick: () => void;
  /** Why the step cannot go on yet, in words, or null when it can. */
  rule: string | null;
  busy?: boolean;
}

/**
 * The step's one main action: 52px, in the accent even while it waits (at 40%), with the rule
 * that opens it printed under it. The line keeps its place, so the bar never jumps while typing.
 */
export function PrimaryAction({ children, onClick, rule, busy }: Props) {
  const reasonId = useId();
  return (
    <div>
      <LockedButton tone="primary" locked={rule !== null} busy={busy} reasonId={rule ? reasonId : undefined} onClick={onClick} className="w-full">
        {children}
      </LockedButton>
      <p id={reasonId} aria-live="polite" className="text-footnote mt-2 min-h-[18px] text-center text-label-2">
        {rule}
      </p>
    </div>
  );
}
