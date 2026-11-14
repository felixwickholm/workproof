"use client";

import { ChevronDown } from "lucide-react";
import type { ChangeEvent, ReactNode } from "react";
import type { ProofKind } from "@/lib/domain/types";
import { PROOF_KINDS } from "@/lib/domain/kinds";
import { cx } from "../ui/cx";
import { PROOF_KIND_LABEL, ProofKindIcon } from "../ui/proof-kind";

/** A choice that reads like the line it sits in, and opens the platform's own picker. */
function InlineSelect({ label, value, onChange, icon, children }: { label: string; value: string; onChange: (e: ChangeEvent<HTMLSelectElement>) => void; icon?: ReactNode; children: ReactNode }) {
  return (
    <label className="relative inline-flex h-9 items-center rounded-full bg-fill text-label transition-colors duration-150 hover:bg-label/10 pointer-coarse:h-11">
      <span className="sr-only">{label}</span>
      {icon ? <span className="pointer-events-none absolute left-3 flex text-label-2">{icon}</span> : null}
      <select
        value={value}
        onChange={onChange}
        className={cx("text-footnote h-full cursor-pointer appearance-none rounded-full bg-transparent pr-8 font-medium outline-none", icon ? "pl-8" : "pl-3.5")}
      >
        {children}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 size-4 text-label-2" strokeWidth={2} />
    </label>
  );
}

/** What the person hands in: one of the seven kinds. Every task also takes a written or spoken answer. */
export function ProofKindSelect({ value, onChange }: { value: ProofKind; onChange: (kind: ProofKind) => void }) {
  return (
    <InlineSelect
      label="Kind of proof"
      value={value}
      onChange={(e) => onChange(e.target.value as ProofKind)}
      icon={<ProofKindIcon kind={value} className="size-3.5" />}
    >
      {PROOF_KINDS.map((kind) => (
        <option key={kind} value={kind}>
          {PROOF_KIND_LABEL[kind]}
        </option>
      ))}
    </InlineSelect>
  );
}

/** Task lengths a person can fit in a break. The API accepts 2 to 30 minutes. */
const MINUTES = [10, 15, 20, 30] as const;

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
