"use client";

import { Moon, Sun } from "lucide-react";
import { cx } from "../ui/cx";
import { useTheme } from "./use-theme";

const icon = "absolute inset-0 m-auto size-5 transition-[opacity,filter,transform] duration-200 ease-(--ease-out) motion-reduce:transition-opacity";

/**
 * Sun in light, moon in dark. The icons cross-fade with a little blur and scale, so the swap reads
 * as one glyph changing rather than two swapping places.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Dark theme"
      aria-pressed={dark}
      title={dark ? "Switch to light" : "Switch to dark"}
      className={cx(
        "press relative flex size-11 shrink-0 items-center justify-center rounded-full text-label-2 transition-colors duration-150 hover:bg-fill hover:text-label",
        className,
      )}
    >
      <Sun aria-hidden strokeWidth={1.75} className={cx(icon, dark ? "scale-50 opacity-0 blur-[3px]" : "scale-100 opacity-100 blur-0")} />
      <Moon aria-hidden strokeWidth={1.75} className={cx(icon, dark ? "scale-100 opacity-100 blur-0" : "scale-50 opacity-0 blur-[3px]")} />
    </button>
  );
}
