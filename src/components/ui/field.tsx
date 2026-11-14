"use client";

import { useLayoutEffect, useRef } from "react";
import { cx } from "./cx";

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
  /** Which sample the guided story may type here. */
  fill?: string;
}

export function Field({ label, value, onChange, placeholder, autoFocus, type = "text", autoComplete, hideLabel, onEnter, maxLength, fill }: FieldProps) {
  return (
    <label className="block">
      <span className={cx("text-footnote mb-2 block px-4 text-label-2", hideLabel && "sr-only")}>{label}</span>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        placeholder={placeholder}
        maxLength={maxLength}
        data-fill={fill}
        enterKeyHint="next"
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onEnter) {
            e.preventDefault();
            onEnter();
          }
        }}
        className="text-body h-[52px] w-full rounded-inner bg-surface px-4 text-label caret-white outline-none placeholder:text-label-3 focus:bg-raised"
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
  /** Which sample the guided story may type here. */
  fill?: string;
}

/** A text area that grows with its content. */
export function TextArea({ label, value, onChange, placeholder, autoFocus, minRows = 4, hideLabel, maxLength, fill }: TextAreaProps) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);

  return (
    <label className="block">
      <span className={cx("text-footnote mb-2 block px-4 text-label-2", hideLabel && "sr-only")}>{label}</span>
      <textarea
        ref={ref}
        value={value}
        rows={minRows}
        autoFocus={autoFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        data-fill={fill}
        onChange={(e) => onChange(e.target.value)}
        className="text-body block w-full resize-none overflow-hidden rounded-inner bg-surface px-4 py-3.5 text-label caret-white outline-none placeholder:text-label-3 focus:bg-raised"
      />
    </label>
  );
}
