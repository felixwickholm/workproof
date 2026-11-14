"use client";

import { Pencil } from "lucide-react";
import { useLayoutEffect, useRef } from "react";
import { cx } from "../ui/cx";

/**
 * Text that reads like the page but edits in place. A pencil marks it as editable; hover hints
 * at the field and focus gives it the field background.
 */
export function InlineEdit({
  label,
  value,
  onChange,
  className,
  maxLength,
  multiline,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
  maxLength?: number;
  /** Keep line breaks, for a passage such as the task's situation. */
  multiline?: boolean;
  /** What to write, while the line is empty: a challenge written by hand starts blank. */
  placeholder?: string;
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
        placeholder={placeholder}
        onChange={(e) => onChange(multiline ? e.target.value : e.target.value.replace(/\n/g, " "))}
        className={cx(
          "block w-full resize-none overflow-hidden rounded-inner bg-transparent py-2 pr-11 pl-3 text-label caret-accent outline-none placeholder:text-label-3 transition-colors duration-150 hover:bg-fill/60 focus:bg-fill",
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
