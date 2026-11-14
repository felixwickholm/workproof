"use client";

import { CalendarClock, Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { useRef, useState } from "react";
import { companyApi } from "@/lib/client/api";
import type { BlindProof, Company, DecisionKind, Meeting } from "@/lib/domain/types";
import { Monogram } from "../blind-proof";
import { Button } from "../ui/button";
import { Field, TextArea } from "../ui/field";
import { Sheet } from "../ui/sheet";
import { getReviewer, saveReviewer } from "./company-choice";
import { companyErrorText } from "./format";
import { decisionInputProblem, MIN_FEEDBACK_CHARS, MIN_FEEDBACK_WORDS, wordsWithLetters } from "@/lib/domain/decision-rules";
import { LIMITS } from "@/lib/http/limits";


/** Neutral ways to begin. They help a reviewer start writing; they say nothing about the person. */
const starters: Record<DecisionKind, string[]> = {
  meet: ["In your work I noticed", "I would like to talk about", "One question I have:"],
  pass: ["Thank you for the work. For this role we need", "What worked:", "Next time, look at"],
};

interface Props {
  kind: DecisionKind | null;
  proof: BlindProof;
  company: Company;
  onClose: () => void;
  /** Called once the decision is saved, before the confirmation shows. */
  onDecided: () => Promise<void>;
  /** "Done" on the confirmation. Defaults to closing the sheet. */
  onDone?: () => void;
}

/** Feedback first, then the decision is sent. Each opening starts with an empty form. */
export function DecisionSheet({ kind, proof, company, onClose, onDecided, onDone = onClose }: Props) {
  const [reviewer, setReviewer] = useState(() => (typeof window === "undefined" ? "" : getReviewer(company.id) || seededReviewer(company)));
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ kind: DecisionKind; meeting?: Meeting } | null>(null);
  /** The kind it was opened with, kept while the sheet slides away. */
  const [openedAs, setOpenedAs] = useState<DecisionKind | null>(kind);
  const [wasOpen, setWasOpen] = useState(kind !== null);
  if ((kind !== null) !== wasOpen) {
    setWasOpen(kind !== null);
    if (kind !== null) {
      setOpenedAs(kind);
      setFeedback("");
      setSent(null);
      setError(null);
    }
  }

  const decision = sent?.kind ?? openedAs;
  // Same rule as the API: a real name, and feedback of at least four words and 20 characters.
  const short = MIN_FEEDBACK_CHARS - feedback.trim().length;
  const fewWords = MIN_FEEDBACK_WORDS - wordsWithLetters(feedback);
  const ready = !decisionInputProblem(reviewer, feedback);
  const hint = short > 0 ? `${short} more ${short === 1 ? "character" : "characters"}` : fewWords > 0 ? `${fewWords} more ${fewWords === 1 ? "word" : "words"}` : !ready ? "Add your name" : null;

  const inFlight = useRef(false);
  async function submit() {
    if (!openedAs || !ready || inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      const name = reviewer.trim();
      saveReviewer(company.id, name);
      const res = await companyApi.decide({ proofId: proof.proofId, companyId: company.id, reviewer: name, decision: openedAs, feedback: feedback.trim() });
      setSent({ kind: openedAs, meeting: res.meeting });
      await onDecided();
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  const addStarter = (text: string) => setFeedback((current) => (current.trim() ? `${current.trimEnd()} ${text} ` : `${text} `));

  const title = sent
    ? sent.kind === "meet"
      ? "Invitation sent"
      : "Feedback sent"
    : decision === "meet"
      ? `Meet ${proof.label}`
      : `Pass on ${proof.label}`;

  const moment = sent?.kind === "meet";
  return (
    <Sheet open={kind !== null} onClose={onClose} title={title} size={moment ? "full" : "auto"} hideTitle={moment}>
      <div className={moment ? "flex flex-1 flex-col" : "-mx-5 max-h-[calc(85dvh-80px)] overflow-y-auto px-5"}>
        {sent ? (
          <Sent kind={sent.kind} meeting={sent.meeting} proof={proof} company={company} onDone={onDone} />
        ) : (
          <div className="flex flex-col gap-4">
            <Field label="Your name" value={reviewer} onChange={setReviewer} placeholder="Reviewer name" autoComplete="name" maxLength={LIMITS.reviewer} fill="reviewer" />
            <div>
              <TextArea
                label={decision === "meet" ? "Why you want to meet" : "Feedback for them"}
                value={feedback}
                onChange={setFeedback}
                placeholder="Two honest lines about the work"
                minRows={3}
                maxLength={LIMITS.feedback}
                fill={`note-${decision ?? "pass"}`}
              />
              <p className="text-footnote mt-2 flex justify-between gap-3 px-4 text-label-2">
                <span>They will read this. Two honest lines are enough.</span>
                {hint ? <span className="tnum shrink-0 text-label-3">{hint}</span> : null}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {starters[decision ?? "pass"].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => addStarter(s)}
                  className="press text-footnote h-11 rounded-full bg-raised px-4 font-medium text-label"
                >
                  {s}
                </button>
              ))}
            </div>
            {error ? (
              <p role="alert" className="text-footnote text-center text-label-2">
                {error}
              </p>
            ) : null}
            <Button onClick={submit} disabled={!ready} loading={busy} className="mt-1">
              {decision === "meet" ? "Send invitation" : "Send feedback"}
            </Button>
          </div>
        )}
      </div>
    </Sheet>
  );
}

/** The reviewer's name from the company's own data, when the event set one up. */
function seededReviewer(company: Company): string {
  const value = (company as Company & { reviewer?: unknown }).reviewer;
  return typeof value === "string" ? value : "";
}

/**
 * A calm confirmation. A meeting gets the whole screen: the proof and the company joined by
 * the human decision, the slot, and the one green check. Feedback after a pass stays small.
 */
function Sent({ kind, meeting, proof, company, onDone }: { kind: DecisionKind; meeting?: Meeting; proof: BlindProof; company: Company; onDone: () => void }) {
  const reduce = useReducedMotion();
  const ease = [0.23, 1, 0.32, 1] as const;
  if (kind === "pass") {
    return (
      <motion.div initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.24, ease }}>
        <p className="text-body text-pretty">
          They will read your note. If the person agreed, other employers with the same skills can now see this proof under Second look.
        </p>
        <Button onClick={onDone} className="mt-6">
          Done
        </Button>
      </motion.div>
    );
  }
  return (
    <div className="flex flex-1 flex-col">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div aria-hidden className="flex items-center justify-center">
          <motion.span initial={reduce ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.28, ease }}>
            <Monogram label={proof.label} />
          </motion.span>
          <span className="relative mx-2 flex h-px w-16 items-center justify-center bg-separator">
            <motion.span
              className="absolute flex size-9 items-center justify-center rounded-full bg-accent text-black"
              initial={reduce ? false : { scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.24, delay: 0.16, ease }}
            >
              <Check className="size-5" strokeWidth={3} />
            </motion.span>
          </span>
          <motion.span
            className="flex size-11 items-center justify-center rounded-inner bg-raised text-subhead font-bold text-label"
            initial={reduce ? false : { opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.28, ease }}
          >
            {company.name.charAt(0)}
          </motion.span>
        </div>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.1, ease }}
        >
          <h2 className="text-title mt-8 font-semibold tracking-[-0.02em] text-balance">Invitation sent</h2>
          {meeting ? (
            <p className="text-title-3 tnum mt-3 flex items-center justify-center gap-2 font-semibold">
              <CalendarClock aria-hidden className="size-6 shrink-0 text-label-2" strokeWidth={1.8} />
              {meeting.slot}
            </p>
          ) : null}
          <p className="text-body mt-3 text-label-2 text-pretty">Their name appears when they accept.</p>
        </motion.div>
      </div>
      <Button onClick={onDone} className="mt-6">
        Done
      </Button>
    </div>
  );
}
