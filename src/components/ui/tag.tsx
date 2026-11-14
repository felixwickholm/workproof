import { Check } from "lucide-react";
import type { ReactNode } from "react";
import type { ProofKind } from "@/lib/domain/types";
import { cx } from "./cx";
import { PROOF_KIND_LABEL, ProofKindIcon } from "./proof-kind";

type Tone = "neutral" | "positive" | "warning" | "negative";

const tones: Record<Tone, string> = {
  neutral: "bg-fill text-label",
  positive: "bg-positive-wash text-positive-ink",
  warning: "bg-warning-wash text-warning-ink",
  negative: "bg-negative-wash text-negative-ink",
};

/** A chip for skills, meta and status: a pale wash with dark text of the same hue. Never squeezed. */
export function Tag({ children, className, tone = "neutral", icon }: { children: ReactNode; className?: string; tone?: Tone; icon?: ReactNode }) {
  return (
    <span
      className={cx(
        "inline-flex h-7 flex-none items-center gap-2 rounded-full px-3 text-footnote font-medium whitespace-nowrap",
        tones[tone],
        icon ? "pl-2" : null,
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

/** What the person hands in, with its icon: the same words on the task card and in the employer's queue. */
export function ProofKindTag({ kind, className }: { kind: ProofKind; className?: string }) {
  return (
    <Tag className={className} icon={<ProofKindIcon kind={kind} className="size-4 text-label-2" />}>
      {PROOF_KIND_LABEL[kind]}
    </Tag>
  );
}

/** Quiet monochrome label on anything the AI wrote. */
export function AiTag() {
  return (
    <span className="inline-flex h-5 flex-none items-center rounded-full px-2 text-caption font-medium text-label-2 shadow-[inset_0_0_0_1px_var(--color-control)]">
      AI draft
    </span>
  );
}

/** Marks a decision a person made. The only place the accent colour appears besides the main action. */
export function HumanTag({ children = "Human decision" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center gap-1 text-footnote font-semibold text-accent">
      <Check aria-hidden className="size-4" strokeWidth={1.75} />
      {children}
    </span>
  );
}
