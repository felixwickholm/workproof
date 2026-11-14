"use client";

import { useLayoutEffect, useRef } from "react";
import { cx } from "./cx";

/**
 * A tonal field that reads on the ground, on a panel and inside a sheet alike. Focus draws a
 * control-strength border rather than a glow.
 */
function fieldClass(shape: string) {
  return cx(
    "text-body w-full rounded-inner bg-fill text-label caret-accent outline-none placeholder:text-label-3",
    "shadow-[inset_0_0_0_1px_transparent] transition-shadow duration-150 focus:shadow-[inset_0_0_0_1.5px_var(--color-label-3)]",
    shape,
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  type?: "text" | "email";
  autoComplete?: string;
  /** Hide the label visually; it stays for screen readers. */
  hideLabel?: boolean;
  onEnter?: () => void;
  /** Match the API limit, so a long paste is cut here instead of failing on send. */
  maxLength?: number;
}

export function Field({ label, value, onChange, placeholder, autoFocus, type = "text", autoComplete, hideLabel, onEnter, maxLength }: FieldProps) {
  return (
    <label className="block">
      <span className={cx("text-footnote mb-2 block font-medium text-label-2", hideLabel && "sr-only")}>{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        enterKeyHint="next"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className={fieldClass("h-12 px-4")}
      />
    </label>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  minRows?: number;
  hideLabel?: boolean;
  maxLength?: number;
}

/** A text area that grows with its content. */
export function TextArea({ label, value, onChange, placeholder, autoFocus, minRows = 4, hideLabel, maxLength }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <label className="block">
      <span className={cx("text-footnote mb-2 block font-medium text-label-2", hideLabel && "sr-only")}>{label}</span>
      <textarea
        ref={ref}
        value={value}
        rows={minRows}
        autoFocus={autoFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass("block resize-none overflow-hidden px-4 py-3")}
      />
    </label>
  );
}
