"use client";

import { Pencil } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { cx } from "../ui/cx";

/**
 * Text that reads like the page but edits in place. A pencil marks it as editable;
 * focus gives it the field background.
 */
export function InlineEdit({
  label,
  value,
  onChange,
  className,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  maxLength?: number;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <label className="group relative -mx-3 block">
      <span className="sr-only">{label}</span>
      <textarea
        ref={ref}
        rows={1}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value.replace(/\n/g, " "))}
        className={cx(
          "block w-full resize-none overflow-hidden rounded-inner bg-transparent py-2 pr-11 pl-3 text-label caret-white outline-none transition-colors duration-150 focus:bg-surface",
          className,
        )}
      />
      <Pencil
        aria-hidden
        className="pointer-events-none absolute top-3 right-3 size-4 text-label-3 transition-opacity duration-150 group-focus-within:opacity-0"
        strokeWidth={2}
      />
    </label>
  );
}
