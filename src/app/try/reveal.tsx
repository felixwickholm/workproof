"use client";

import { MessageSquareText, Monitor, Smartphone, UserRoundCheck, type LucideIcon } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { BlindCompare, BlindProofView } from "@/components/proof";
import { Button } from "@/components/ui/button";
import { ProofKindTag } from "@/components/ui/tag";
import { SpokenBadge } from "@/components/voice";
import type { OwnProof } from "@/lib/domain/types";
import { compareTexts, nameLine, practiceLine } from "./try-copy";

interface Props {
  proof: OwnProof;
  /** What the person typed or said, kept on the phone to compare with the blind proof. */
  written: { answer: string; explain: string };
  /** The phone joined the table's sandbox, so the proof is on the big screen now, as a label and a task. */
  onTable: boolean;
  /** A first name was given on the name step, so the blind layer had it to hide. */
  nameGiven: boolean;
  onAnotherJob: () => void;
}

/** What the reveal promises, true to this visit: whether a name was given, and whether a table can invite. */
function promises(nameGiven: boolean, onTable: boolean): { Icon: LucideIcon; text: string }[] {
  return [
    { Icon: Smartphone, text: nameLine(nameGiven) },
    { Icon: MessageSquareText, text: "A person would read this and answer in writing. No AI scores it." },
    {
      Icon: UserRoundCheck,
      text: onTable
        ? "The table can invite you. Your first name shows only if you accept, on this phone."
        : "At a real event, the company could invite you. Only then would it see your name.",
    },
  ];
}

/**
 * The moment of the flow: the person's own work as a company would read it. When the blind
 * layer hid anything, the two layers sit in one card so the hidden words can be seen going.
 */
export function Reveal({ proof, written, onTable, nameGiven, onAnotherJob }: Props) {
  const reduce = useReducedMotion();
  const { original, blind } = compareTexts(written, proof);
  const flip = reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3, delay: 0.15 } }
    : {
        initial: { opacity: 0, transform: "perspective(1200px) rotateY(-70deg) translateY(12px)" },
        animate: { opacity: 1, transform: "perspective(1200px) rotateY(0deg) translateY(0px)" },
        transition: { duration: 0.5, delay: 0.2, ease: [0.23, 1, 0.32, 1] as const },
      };

  return (
    <>
      <p className="text-footnote inline-flex min-h-7 w-fit items-center rounded-full bg-surface px-3 py-1 font-medium text-pretty text-label-2">{practiceLine(onTable)}</p>
      <h1 className="text-greeting mt-3 text-balance text-label">This is what a company sees.</h1>

      <motion.div className="mt-6 will-change-transform" {...flip}>
        {proof.hiddenCount > 0 ? (
          <section aria-label={proof.label}>
            <div className="mb-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
              <h2 className="text-headline font-semibold text-label">{proof.label}</h2>
              <ProofKindTag kind={proof.proofKind} className="h-6 px-2.5 text-caption" />
            </div>
            <p className="text-subhead -mt-1.5 mb-3 text-pretty text-label-2">{proof.challengeTitle}</p>
            <BlindCompare original={original} blind={blind} hiddenCount={proof.hiddenCount} labels={["What you wrote", "What a company reads"]} initialSide="blind" />
            {proof.spoken || proof.explain.some((e) => e.spoken) ? <SpokenBadge className="mt-3" /> : null}
          </section>
        ) : (
          <BlindProofView proof={proof} />
        )}
      </motion.div>

      <ul className="mt-7 flex flex-col gap-3.5">
        {promises(nameGiven, onTable).map(({ Icon, text }) => (
          <li key={text} className="text-subhead flex gap-3 text-pretty text-label">
            <Icon aria-hidden className="mt-0.5 size-[18px] shrink-0 text-label-2" strokeWidth={1.7} />
            {text}
          </li>
        ))}
      </ul>

      {onTable ? (
        <div role="status" className="mt-7 flex items-start gap-3 rounded-inner bg-surface px-4 py-3.5">
          <Monitor aria-hidden className="mt-0.5 size-5 shrink-0 text-accent" strokeWidth={1.8} />
          <div>
            <p className="text-headline font-semibold text-label">See it on the big screen</p>
            <p className="text-subhead mt-0.5 text-pretty text-label-2">Look up: your proof just arrived as a label and a task. No name, none of your words.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-7 flex flex-col gap-2.5">
        <Button href="/?tour=1">See the whole story in 2 minutes</Button>
        <Button variant="secondary" onClick={onAnotherJob}>
          Try another job
        </Button>
        <Button href="/seeker" variant="quiet" className="mx-auto">
          Explore Workprint
        </Button>
      </div>
    </>
  );
}
