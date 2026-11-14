"use client";

import { ChevronDown } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import { TASK_FORMATS } from "@/lib/domain/kinds";
import type { TaskFormat } from "@/lib/domain/types";
import { formatWord } from "./hiring-words";

/** A choice that reads like the line it sits in, and opens the platform's own picker. */
function InlineSelect({ label, value, onChange, children }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; children: ReactNode }) {
  return (
    <label className="relative inline-flex h-11 items-center rounded-full bg-fill text-label transition-colors duration-150 hover:bg-label/10 pointer-coarse:h-11">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="text-subhead h-full cursor-pointer appearance-none rounded-full bg-transparent pr-9 pl-4 font-medium outline-none"
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 size-4 text-label-2" strokeWidth={1.75} />
    </label>
  );
}

/** How the challenge is done: Choose, Make, Fix or Read. */
export function FormatSelect({ value, onChange }: { value: TaskFormat; onChange: (format: TaskFormat) => void }) {
  return (
    <InlineSelect label="How it is done" value={value} onChange={(e) => onChange(e.target.value as TaskFormat)}>
      {TASK_FORMATS.map((format) => (
        <option key={format} value={format}>
          {formatWord(format)}
        </option>
      ))}
    </InlineSelect>
  );
}

/** Event challenges take 5 to 15 minutes. */
const MINUTES = [5, 10, 15] as const;

export function MinutesSelect({ value, onChange }: { value: number; onChange: (minutes: number) => void }) {
  const options = MINUTES.includes(value as (typeof MINUTES)[number]) ? MINUTES : [...MINUTES, value].sort((a, b) => a - b);
  return (
    <InlineSelect label="Minutes" value={String(value)} onChange={(e) => onChange(Number(e.target.value))}>
      {options.map((m) => (
        <option key={m} value={m}>
          {m} min
        </option>
      ))}
    </InlineSelect>
  );
}
