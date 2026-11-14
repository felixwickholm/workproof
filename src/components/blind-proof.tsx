"use client";

import { EyeOff } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import type { BlindProof, RedactionReport } from "@/lib/domain/types";
import { Card, Eyebrow, Section } from "./ui/card";
import { Group, Row } from "./ui/group";
import { AiTag, Tag } from "./ui/tag";
import { WorkText } from "./work-text";

const ease = [0.23, 1, 0.32, 1] as const;

export function Monogram({ label }: { label: string }) {
  const code = label.replace(/^Proof\s*/i, "").slice(0, 3) || "?";
  return (
    <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-inner bg-raised font-mono text-subhead font-semibold">
      {code}
    </span>
  );
}

function ProofHeader({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <Monogram label={label} />
      <div className="min-w-0">
        <p className="text-headline font-semibold">{label}</p>
        <p className="text-subhead text-label-2 text-pretty">{sub}</p>
      </div>
    </div>
  );
}

function NameHidden() {
  return (
    <p className="hairline-t text-footnote -mx-5 mt-4 flex items-center gap-2 px-5 pt-3.5 text-label-2">
      <EyeOff aria-hidden className="size-4" strokeWidth={1.8} />
      Name hidden until you both say yes
    </p>
  );
}

export type ProofPreview = Pick<BlindProof, "label" | "work" | "skills" | "challengeTitle">;

/** The compact blind proof, as a company first sees it in a list. */
export function BlindProofMini({ proof, meta }: { proof: ProofPreview; meta?: string }) {
  return (
    <Card className="highlight">
      <ProofHeader label={proof.label} sub={meta ?? proof.challengeTitle} />
      <p className="text-body mt-4 line-clamp-3 text-pretty">{proof.work}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {proof.skills.slice(0, 3).map((s) => (
          <Tag key={s.id}>{s.label}</Tag>
        ))}
      </div>
      <NameHidden />
    </Card>
  );
}

const redactionRows: { key: keyof RedactionReport; label: string }[] = [
  { key: "names", label: "Names" },
  { key: "contacts", label: "Contact details" },
  { key: "schools", label: "Schools" },
  { key: "places", label: "Places" },
  { key: "employers", label: "Employers" },
  { key: "other", label: "Other personal details" },
];

const hiddenCopy = {
  talent: {
    label: "Hidden from the reviewer",
    identity: "Your name and contact",
    nothingFound: "Nothing personal found in your text",
    footer: "Removed before any person at the company sees the work.",
  },
  reviewer: {
    label: "Hidden from you",
    identity: "Name and contact",
    nothingFound: "Nothing personal found in the text",
    footer: "Removed before you see the work. The name appears only when they accept a meeting.",
  },
};

/**
 * The full blind proof. With `reveal`, the card settles in and the hidden rows tick in
 * one by one; the whole moment stays under 600ms.
 */
export function BlindProofFull({
  proof,
  reveal = false,
  audience = "talent",
  beforeWork,
}: {
  /** The author's own view carries the hidden details by category; a reviewer gets one total. */
  proof: BlindProof & { redactions?: RedactionReport };
  reveal?: boolean;
  /** Who is reading. A reviewer gets a compact header so the work comes first; the "hidden" list is worded for them. */
  audience?: "talent" | "reviewer";
  /** Shown between the header and the work, for example the task the person got. */
  beforeWork?: ReactNode;
}) {
  const hidden = hiddenCopy[audience];
  const reduce = useReducedMotion();
  const animate = reveal && !reduce;
  const report = audience === "talent" ? proof.redactions : undefined;
  const found = report
    ? redactionRows.filter((r) => report[r.key] > 0).map((r) => ({ ...r, value: report[r.key] }))
    : proof.hiddenCount > 0
      ? [{ key: "total", label: "Personal details", value: proof.hiddenCount }]
      : [];
  const rows = [
    { key: "identity", label: hidden.identity, value: "Not shared" },
    ...(found.length > 0 ? found : [{ key: "none", label: hidden.nothingFound, value: undefined }]),
  ];

  return (
    <div>
      <motion.div
        className="flex flex-col gap-3"
        initial={animate ? { opacity: 0, scale: 0.98, y: 8 } : false}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.28, ease }}
      >
        {audience === "reviewer" ? (
          <div className="px-1">
            <ProofHeader label={proof.label} sub={proof.challengeTitle} />
            <div className="mt-3 flex flex-wrap gap-2">
              {proof.skills.map((s) => (
                <Tag key={s.id}>{s.label}</Tag>
              ))}
            </div>
          </div>
        ) : (
          <Card className="highlight">
            <ProofHeader label={proof.label} sub={proof.challengeTitle} />
            <div className="mt-4 flex flex-wrap gap-2">
              {proof.skills.map((s) => (
                <Tag key={s.id}>{s.label}</Tag>
              ))}
            </div>
            <NameHidden />
          </Card>
        )}

        {beforeWork}

        <Card>
          <Eyebrow>The work</Eyebrow>
          <WorkText text={proof.work} className="text-body mt-2 whitespace-pre-wrap text-pretty" />
        </Card>

        {proof.explain.length > 0 ? (
          <div className="overflow-hidden rounded-card bg-surface">
            {proof.explain.map((e, i) => (
              <div key={i} className="row relative px-5 py-4">
                <p className="text-footnote text-label-2 text-pretty">{e.question}</p>
                <WorkText text={e.answer} className="text-body mt-1.5 whitespace-pre-wrap text-pretty" />
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-3 px-5">
          <div className="flex items-center justify-between gap-3">
            <Eyebrow>Summary of the work</Eyebrow>
            <AiTag />
          </div>
          <p className="text-body mt-2 text-label-2 text-pretty">{proof.aiSummary}</p>
          <p className="text-footnote mt-2 text-label-3">Describes the work. Never scores it.</p>
        </div>
      </motion.div>

      <Section label={hidden.label} className="mt-8">
        <Group footer={hidden.footer}>
          {rows.map((r, i) => (
            <motion.div
              key={r.key}
              className="row relative"
              initial={animate ? { opacity: 0, x: -6 } : false}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.12, delay: animate ? 0.28 + i * 0.03 : 0, ease }}
            >
              <Row title={r.label} value={r.value} />
            </motion.div>
          ))}
        </Group>
      </Section>
    </div>
  );
}
