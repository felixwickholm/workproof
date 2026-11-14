"use client";

import type { ReactNode } from "react";
import { Spinner } from "@/components/ui/spinner";
import { cx } from "@/components/ui/cx";

type Tone = "primary" | "meet" | "neutral";

interface Props {
  children: ReactNode;
  onClick: () => void;
  /** Not ready yet: the button stays in place at 40% and says why through `reasonId`. */
  locked: boolean;
  busy?: boolean;
  /** The element that says why the button waits, or what it will do. */
  reasonId?: string;
  /**
   * primary: the screen's main action in the accent. meet and neutral: the two decisions, equal
   * in size and weight; only hover, focus or a press fills them, Meet in the accent.
   */
  tone?: Tone;
  className?: string;
}

const tones: Record<Tone, string> = {
  primary: "bg-accent text-accent-ink px-6",
  meet: "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-control)]",
  neutral: "bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-control)]",
};

/** What a ready decision button turns into under the pointer, the keyboard or a finger. */
const ready: Record<Tone, string> = {
  primary: "",
  meet: "hover:bg-accent hover:text-accent-ink hover:shadow-none focus-visible:bg-accent focus-visible:text-accent-ink active:bg-accent active:text-accent-ink",
  neutral: "hover:bg-label hover:text-ground hover:shadow-none focus-visible:bg-label focus-visible:text-ground active:bg-label active:text-ground",
};

/**
 * A 52px pill that never greys out. Until its rule is met it stays in its own colour at 40%,
 * with `aria-disabled` so it can still be focused and read, and the rule printed beside it.
 */
export function LockedButton({ children, onClick, locked, busy, reasonId, tone = "primary", className }: Props) {
  const inactive = locked || busy;
  return (
    <button
      type="button"
      onClick={() => {
        if (!inactive) onClick();
      }}
      aria-disabled={inactive || undefined}
      aria-describedby={reasonId}
      aria-busy={busy || undefined}
      className={cx(
        "inline-flex h-[52px] shrink-0 select-none items-center justify-center gap-2 rounded-full text-[16px] font-semibold",
        "transition-[background-color,color,box-shadow,opacity,transform] duration-150 ease-(--ease-out)",
        tones[tone],
        locked ? "cursor-not-allowed opacity-40" : cx("active:scale-[0.97]", busy ? "cursor-progress" : ready[tone]),
        className,
      )}
    >
      {busy ? <Spinner /> : null}
      {children}
    </button>
  );
}
