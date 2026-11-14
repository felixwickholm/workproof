"use client";

import { cx } from "./cx";

/** iOS-style switch. On uses white, not the accent: the accent is for human decisions. */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative flex h-11 w-[51px] shrink-0 items-center"
    >
      <span
        className={cx(
          "absolute inset-x-0 h-[31px] rounded-full transition-colors duration-200",
          checked ? "bg-white" : "bg-fill",
        )}
      />
      <span
        className={cx(
          "relative ml-0.5 size-[27px] rounded-full transition-transform duration-200 ease-(--ease-out)",
          checked ? "translate-x-5 bg-black" : "bg-white",
        )}
      />
    </button>
  );
}
