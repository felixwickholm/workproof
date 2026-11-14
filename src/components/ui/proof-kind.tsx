import { Camera, CodeXml, ListChecks, Mic, Palette, PenLine, Video, type LucideIcon } from "lucide-react";
import type { ProofKind } from "@/lib/domain/types";
import { cx } from "./cx";

/** The words for each kind of proof, the same everywhere a person or a company sees one. */
export const PROOF_KIND_LABEL: Record<ProofKind, string> = {
  writing: "Writing",
  plan: "Plan",
  photo: "Photo",
  video: "Short video",
  voice: "Voice answer",
  design: "Design",
  code: "Code",
};

const ICONS: Record<ProofKind, LucideIcon> = {
  writing: PenLine,
  plan: ListChecks,
  photo: Camera,
  video: Video,
  voice: Mic,
  design: Palette,
  code: CodeXml,
};

/** An outline icon for a kind of proof. Decorative: the label next to it carries the meaning. */
export function ProofKindIcon({ kind, className }: { kind: ProofKind; className?: string }) {
  const Icon = ICONS[kind];
  return <Icon aria-hidden className={cx("size-4 shrink-0", className)} strokeWidth={1.75} />;
}
