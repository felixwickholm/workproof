"use client";

import { useId, useRef, useState } from "react";
import { ApiError, companyApi } from "@/lib/client/api";
import type { BlindProof, Company, DecisionKind } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { cx } from "../ui/cx";
import { Field, TextArea } from "../ui/field";
import { toast } from "../ui/toast";
import { getReviewer, saveReviewer } from "./company-choice";
import { LockedButton } from "@/components/controls/locked-button";
import { checkFeedback, MIN_SENTENCES } from "@/lib/domain/feedback-check";
import { companyErrorText } from "./format";
import { ADD_REVIEWER_FIRST, addReviewerLabel, reviewerStanding } from "./reviewer-step";

/** The rule printed inside the decision area until the answer is written. */
export const DECISION_RULE = "Write two sentences to the person. Then choose.";
/** What happens next, once both buttons are open. */
const READY_LINE = "Meet proposes a time. The name stays hidden until the person accepts.";
export const SENT_TOAST = "Sent to the person: your reason and your decision.";

interface Props {
  proof: BlindProof;
  company: Company;
  /** Called once the decision is saved; the page then shows what was sent in this place. */
  onDecided: () => Promise<void>;
  tour?: string;
  className?: string;
}

/**
 * The decision, written first: the reviewer's words to the person, then "Not now" or "Meet".
 * The two buttons weigh the same and stay in view, locked until the answer is ready, so the
 * screen never leans the reviewer either way. A press sends at once; nothing asks again.
 */
export function DecisionPanel({ proof, company, onDecided, tour, className }: Props) {
  const [reviewer, setReviewer] = useState(() => (typeof window === "undefined" ? "" : getReviewer(company.id)));
  const [editingName, setEditingName] = useState(() => reviewer.trim().length === 0);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState<DecisionKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reviewers, setReviewers] = useState<readonly string[]>(() => company.reviewers ?? []);
  const [refusedByServer, setRefusedByServer] = useState<string>();
  const [adding, setAdding] = useState(false);
  const inFlight = useRef(false);
  const reasonId = useId();

  const check = checkFeedback(reviewer, feedback);
  const standing = reviewerStanding(reviewers, reviewer, refusedByServer);
  const ready = check.waitingFor === null && standing.kind === "registered";
  const waitingFor = check.waitingFor ?? (standing.kind === "unregistered" ? ADD_REVIEWER_FIRST : null);

  /** The explicit, logged step that lets a new person decide for this company. */
  async function addMe() {
    if (adding) return;
    setAdding(true);
    setError(null);
    try {
      const name = reviewer.trim();
      const result = await companyApi.addReviewer(company.id, name);
      setReviewers(result.reviewers);
      setRefusedByServer(undefined);
      saveReviewer(company.id, name);
    } catch (e) {
      setError(companyErrorText(e));
    } finally {
      setAdding(false);
    }
  }

  async function decide(kind: DecisionKind) {
    if (!ready || inFlight.current) return;
    inFlight.current = true;
    setSending(kind);
    setError(null);
    try {
      const name = reviewer.trim();
      saveReviewer(company.id, name);
      await companyApi.decide({ proofId: proof.proofId, companyId: company.id, reviewer: name, decision: kind, feedback: feedback.trim() });
      toast(SENT_TOAST);
      await onDecided();
    } catch (e) {
      // The server knows the company's reviewers best: a 403 brings back the step that adds this name.
      if (e instanceof ApiError && e.status === 403) setRefusedByServer(reviewer.trim());
      else setError(companyErrorText(e));
    } finally {
      inFlight.current = false;
      setSending(null);
    }
  }

  return (
    <section data-tour={tour} aria-label="Your decision" className={cx("rounded-card bg-surface p-5 min-[900px]:p-6", className)}>
      <h2 className="text-section text-label">Your answer to the person</h2>
      <p className="text-footnote mt-1 text-pretty text-label-2">A written answer is required, also for a no. The person reads your words with your decision.</p>

      <div className="mt-4">
        <TextArea
          label="Write to the person: what you saw in the work"
          value={feedback}
          onChange={setFeedback}
          placeholder="What stood out, and what you would ask them next."
          minRows={4}
          maxLength={LIMITS.feedback}
        />
        <p className="text-footnote tnum mt-2 flex justify-between gap-3 text-label-2">
          <span className={cx("transition-colors duration-150", check.sentences >= MIN_SENTENCES && "text-label")}>
            {check.sentences} of {MIN_SENTENCES} sentences
          </span>
          <span>
            {check.characters} / {LIMITS.feedback}
          </span>
        </p>
      </div>

      <div className="mt-4">
        {editingName ? (
          <Field label="Your name" value={reviewer} onChange={setReviewer} placeholder="The person who decides" autoComplete="name" maxLength={LIMITS.reviewer} />
        ) : (
          <p className="text-footnote flex flex-wrap items-center gap-x-1.5 text-label-2">
            Signed <span className="font-medium text-label">{reviewer}</span>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={() => setEditingName(true)}
              className="-mx-1 rounded-md px-1 py-1 font-medium text-label underline decoration-control underline-offset-4 transition-colors duration-150 hover:decoration-label-2 pointer-coarse:py-2.5"
            >
              change name
            </button>
          </p>
        )}
        {standing.kind === "refused" ? (
          <p role="alert" className="text-footnote mt-2 text-pretty text-negative">
            {standing.reason}
          </p>
        ) : null}
        {standing.kind === "unregistered" ? (
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-footnote text-pretty text-label-2">{reviewer.trim()} is not a reviewer here yet.</p>
            <button
              type="button"
              onClick={() => void addMe()}
              aria-busy={adding || undefined}
              className="text-footnote -mx-1 rounded-md px-1 py-1 font-medium text-label underline decoration-control underline-offset-4 transition-colors duration-150 hover:decoration-label-2 pointer-coarse:py-2.5"
            >
              {addReviewerLabel(company.name)}
            </button>
          </div>
        ) : null}
      </div>

      <div className="mt-5 border-t border-separator pt-5">
        <p className="text-subhead text-pretty text-label" aria-live="polite">
          {ready ? READY_LINE : DECISION_RULE}
        </p>
        <span id={reasonId} className="sr-only">
          {waitingFor ?? READY_LINE}
        </span>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <LockedButton tone="neutral" locked={!ready} busy={sending === "pass"} reasonId={reasonId} onClick={() => void decide("pass")}>
            Not now
          </LockedButton>
          <LockedButton tone="meet" locked={!ready} busy={sending === "meet"} reasonId={reasonId} onClick={() => void decide("meet")}>
            Meet
          </LockedButton>
        </div>
        {error ? (
          <p role="alert" className="text-footnote mt-3 text-pretty text-label-2">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}
