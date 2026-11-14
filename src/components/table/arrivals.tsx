"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, useSyncExternalStore } from "react";
import type { ProofKind, TableProof } from "@/lib/domain/types";
import { cx } from "../ui/cx";
import { Skeleton } from "../ui/skeleton";
import { ProofKindTag } from "../ui/tag";
import { InviteSheet } from "./invite-sheet";
import { arrivedAgo, earlierLine, inviteLine, ROWS_SHOWN } from "./table-copy";

const TICK_MS = 15_000;
const EASE = [0.23, 1, 0.32, 1] as const;

function subscribe(listener: () => void) {
  const id = window.setInterval(listener, TICK_MS);
  return () => window.clearInterval(id);
}

/** The time, moved on every 15 s, so "just now" turns into "1 min ago" without a reload. */
const tick = () => Math.floor(Date.now() / TICK_MS) * TICK_MS;

function useNow() {
  return useSyncExternalStore(subscribe, tick, () => null);
}

/** What will arrive, shown greyed while the panel waits, so it never looks blank. */
const EXAMPLES: { label: string; task: string; kind: ProofKind; ago: string }[] = [
  { label: "Proof T1", task: "Plate a lunch for a guest with coeliac disease", kind: "photo", ago: "2 min ago" },
  { label: "Proof K4", task: "Spot the problem in a sensor read", kind: "code", ago: "5 min ago" },
  { label: "Proof R7", task: "Fix one line of a notice", kind: "writing", ago: "9 min ago" },
];

/**
 * The practice proofs sent at this table, newest first: a label, the task and the kind, never the
 * words. A new one rises in at the top. The host can invite a row's author; a name appears only
 * after that person says yes on their own phone.
 */
export function Arrivals({ proofs, loading, onInvited }: { proofs: TableProof[] | null; loading: boolean; onInvited: () => void }) {
  const reduce = useReducedMotion();
  const now = useNow();
  const [inviting, setInviting] = useState<TableProof | null>(null);

  if (!proofs && loading) {
    return (
      <ul aria-hidden className="flex flex-col gap-2">
        {[0, 1, 2].map((i) => (
          <li key={i} className="rounded-inner bg-ground p-5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="mt-3 h-4 w-3/4" />
          </li>
        ))}
      </ul>
    );
  }

  if (!proofs || proofs.length === 0) {
    return (
      <div>
        <p className="text-body mb-4 text-pretty text-label-2">Waiting for the first proof. Scan the code to send one.</p>
        <ul aria-label="Examples of what arrives" className="flex flex-col gap-2 opacity-50">
          {EXAMPLES.map((example) => (
            <li key={example.label} className="rounded-inner bg-ground px-5 py-4">
              <span className="flex items-baseline gap-3">
                <span className="text-headline font-semibold text-label">{example.label}</span>
                <span className="text-footnote rounded-full px-2 font-medium text-label-2 shadow-[inset_0_0_0_1px_var(--color-control)]">Example</span>
                <span className="text-footnote ml-auto text-label-2">{example.ago}</span>
              </span>
              <span className="mt-2 flex min-w-0 items-center gap-2.5">
                <ProofKindTag kind={example.kind} className="h-6 px-2.5 text-caption" />
                <span className="text-subhead min-w-0 truncate text-label-2">{example.task}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const shown = proofs.slice(0, ROWS_SHOWN);
  const earlier = earlierLine(proofs.length - shown.length);

  return (
    <>
      <ul className="flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {shown.map((proof) => (
            <motion.li
              key={proof.proofId}
              layout={!reduce}
              initial={reduce ? { opacity: 0 } : { opacity: 0, transform: "translateY(12px)" }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, transform: "translateY(0px)" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
            >
              <Row proof={proof} ago={now === null ? null : arrivedAgo(proof.submittedAt, now)} onInvite={() => setInviting(proof)} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {earlier ? <p className="text-footnote mt-3 text-center text-label-2">{earlier}</p> : null}
      <InviteSheet proof={inviting} onClose={() => setInviting(null)} onSent={onInvited} />
    </>
  );
}

/**
 * One arrival. When its author accepts while the screen is open, the label turns into the name
 * with a soft blur crossfade and the row's ring pulses once. Loaded already accepted, it just shows.
 */
function Row({ proof, ago, onInvite }: { proof: TableProof; ago: string | null; onInvite: () => void }) {
  const reduce = useReducedMotion();
  const { invite } = proof;
  const named = invite?.status === "accepted" && invite.shownName ? invite.shownName : null;
  const [namedOnArrival] = useState(named !== null);
  const reveal = named !== null && !namedOnArrival;
  const blur = reduce ? {} : { filter: "blur(2px)" };
  const sharp = reduce ? {} : { filter: "blur(0px)" };

  return (
    <div data-proof={proof.label} className="relative rounded-inner bg-ground px-5 py-4">
      {reveal ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-inner shadow-[inset_0_0_0_2px_var(--color-accent)]"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.2, times: [0, 0.25, 1], ease: "easeOut" }}
        />
      ) : null}
      <div className="flex items-baseline gap-3">
        <span className="grid min-w-0 flex-1 *:[grid-area:1/1]">
          <AnimatePresence initial={false}>
            <motion.span
              key={named ? "named" : "label"}
              className={cx("min-w-0 truncate text-label", named ? "font-serif text-[28px] leading-8" : "text-headline font-semibold")}
              initial={{ opacity: 0, ...blur }}
              animate={{ opacity: 1, ...sharp }}
              exit={{ opacity: 0, ...blur }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              {named ? (
                <>
                  {proof.label} is <span className="text-accent">{named}</span>
                </>
              ) : (
                proof.label
              )}
            </motion.span>
          </AnimatePresence>
        </span>
        {ago ? <span className="text-footnote shrink-0 text-label-2 tnum">{ago}</span> : null}
      </div>

      <div className="mt-2 flex min-w-0 items-center gap-2.5">
        <ProofKindTag kind={proof.proofKind} className="h-6 px-2.5 text-caption" />
        <span className="text-subhead min-w-0 flex-1 truncate text-label-2">{proof.taskTitle}</span>
        {invite ? null : (
          <button
            type="button"
            onClick={onInvite}
            aria-label={`Invite to meet: ${proof.label}`}
            className="press text-footnote h-9 shrink-0 rounded-full px-3.5 font-medium text-label shadow-[inset_0_0_0_1px_var(--color-control)] transition-colors duration-150 hover:bg-fill pointer-coarse:h-11"
          >
            Invite to meet
          </button>
        )}
      </div>

      {invite ? <p className="text-footnote mt-2 text-pretty text-label-2">{inviteLine(invite)}</p> : null}
    </div>
  );
}
