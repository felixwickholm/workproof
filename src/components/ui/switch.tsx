"use client";

import { cx } from "./cx";

/** iOS-style switch. On is ink, not the accent: the accent is for human decisions. */
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
      <span className={cx("absolute inset-x-0 h-[31px] rounded-full transition-colors duration-200", checked ? "bg-label" : "bg-fill")} />
      <span
        className={cx(
          "relative ml-0.5 size-[27px] rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.18)] transition-[transform,background-color] duration-200 ease-(--ease-out)",
          // The knob is white on the grey track in both themes, and takes the ground's colour on the ink track.
          checked ? "translate-x-5 bg-ground" : "bg-[#ffffff]",
        )}
      />
    </button>
  );
}
