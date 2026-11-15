"use client";

import { useId, useRef, useState } from "react";
import { LockedButton } from "@/components/controls/locked-button";
import { ApiError, companyApi } from "@/lib/client/api";
import { countSentences, MIN_SENTENCES } from "@/lib/domain/feedback-check";
import type { BlindProof, Challenge, Company, DecisionKind, SkillScore } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { cx } from "../ui/cx";
import { Field, TextArea } from "../ui/field";
import { toast } from "../ui/toast";
import { getReviewer, saveReviewer } from "./company-choice";
import { companyErrorText } from "./format";
import { formatTotal } from "../words";
import { liveTotal, SCORE_RULE, scoredSoFar, scoreLock, scoresFor } from "./hiring-words";
import { ADD_REVIEWER_FIRST, addReviewerLabel, reviewerStanding } from "./reviewer-step";
import { ScoreScale } from "./score-scale";

/** What happens after a press, once every rule is met. */
const READY_LINE = "Your score and your words go to the person. The name stays hidden until they say yes.";
const SENT_TOAST = "Saved. The person gets your score and your words.";

interface Props {
  proof: BlindProof;
  challenge: Challenge;
  company: Company;
  /** Called once the score is saved; the page then shows what was sent in this place. */
  onScored: () => Promise<void>;
  className?: string;
}

/**
 * The score, given by a person: one step of the fixed scale per core skill, the total out of 10 as it
 * builds, two sentences to the person, the signed name, then invite, not now, or score only. The three
 * buttons stay in view and say why they wait.
 */
export function ScorePanel({ proof, challenge, company, onScored, className }: Props) {
  const [points, setPoints] = useState<Record<string, SkillScore["points"] | undefined>>({});
  const [reason, setReason] = useState("");
  const [reviewer, setReviewer] = useState(() => (typeof window === "undefined" ? "" : getReviewer(company.id)));
  const [editingName, setEditingName] = useState(() => reviewer.trim().length === 0);
  const [reviewers, setReviewers] = useState<readonly string[]>(() => company.reviewers ?? []);
  const [refusedByServer, setRefusedByServer] = useState<string>();
  const [adding, setAdding] = useState(false);
  const [sending, setSending] = useState<DecisionKind | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);
  const reasonId = useId();

  const skills = challenge.coreSkills;
  const total = liveTotal(points, skills);
  const lock = scoreLock(points, skills, reviewer, reason);
  const standing = reviewerStanding(reviewers, reviewer, refusedByServer);
  const ready = !lock.locked && standing.kind === "registered";
  const waitingFor = lock.waitingFor ?? (standing.kind === "unregistered" ? ADD_REVIEWER_FIRST : standing.kind === "refused" ? standing.reason : null);
  const sentences = countSentences(reason);
  const lookFor = (skillId: string) => challenge.reviewGuide.find((g) => g.skillId === skillId)?.lookFor;

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

  async function send(decision: DecisionKind) {
    if (!ready || inFlight.current) return;
    inFlight.current = true;
    setSending(decision);
    setError(null);
    try {
      const name = reviewer.trim();
      saveReviewer(company.id, name);
      await companyApi.decide({ proofId: proof.proofId, companyId: company.id, reviewer: name, decision, feedback: reason.trim(), scores: scoresFor(points, skills) });
      toast(SENT_TOAST);
      await onScored();
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
    <section aria-label="Your score" className={cx("rounded-card bg-surface p-5 min-[900px]:p-7", className)}>
      <h2 className="text-h3 text-label">Your score</h2>

      <ol className="mt-6 flex flex-col gap-3">
        {skills.map((skill, i) => (
          // The walkthrough points at the first skill and its scale, not the whole long panel.
          <li key={skill.id} data-tour={i === 0 ? "score" : undefined} className="rounded-[16px] bg-raised p-5 min-[900px]:p-6">
            <p className="text-section text-label">{skill.label}</p>
            {lookFor(skill.id) ? <p className="text-subhead mt-1.5 text-pretty text-label-2">{lookFor(skill.id)}</p> : null}
            <ScoreScale label={skill.label} value={points[skill.id]} onChange={(p) => setPoints((prev) => ({ ...prev, [skill.id]: p }))} className="mt-5" />
          </li>
        ))}
      </ol>

      <div className="mt-10">
        <TextArea
          label="Say why"
          value={reason}
          onChange={setReason}
          placeholder="What did the work show? What would you ask them next?"
          minRows={4}
          maxLength={LIMITS.feedback}
        />
        <p className="text-footnote tnum mt-2 flex justify-between gap-3 text-label-2">
          <span className={cx("transition-colors duration-150", sentences >= MIN_SENTENCES && "text-label")}>
            {Math.min(sentences, MIN_SENTENCES)} of {MIN_SENTENCES} sentences
          </span>
          <span>
            {reason.trim().length} / {LIMITS.feedback}
          </span>
        </p>
      </div>

      <div className="mt-6">
        {editingName ? (
          <Field label="Your name" value={reviewer} onChange={setReviewer} placeholder="The person who scores" autoComplete="name" maxLength={LIMITS.reviewer} />
        ) : (
          <p className="text-body flex flex-wrap items-center gap-x-1.5 text-label-2">
            Signed <span className="font-medium text-label">{reviewer}</span>
            <span aria-hidden>·</span>
            <button type="button" onClick={() => setEditingName(true)} className={linkButton}>
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
            <button type="button" onClick={() => void addMe()} aria-busy={adding || undefined} className={cx("text-footnote", linkButton)}>
              {addReviewerLabel(company.name)}
            </button>
          </div>
        ) : null}
      </div>

      {/* The summary: the total as it builds and the three buttons. From 900px it stays in view while the skills scroll past. */}
      <div className="-mx-5 -mb-5 mt-8 rounded-b-card bg-surface px-5 pt-6 pb-5 min-[900px]:sticky min-[900px]:bottom-0 min-[900px]:-mx-7 min-[900px]:-mb-7 min-[900px]:px-7 min-[900px]:pb-7 min-[900px]:shadow-[0_-16px_24px_-20px_rgba(1,17,53,0.25)]">
        <div className="flex items-end justify-between gap-4">
          <p className="text-headline text-label">Total</p>
          <p aria-live="polite" className="tnum text-[40px] leading-[44px] font-normal text-label">
            {total === null ? (
              <span className="text-body text-label-2">{scoredSoFar(points, skills)}</span>
            ) : (
              <>
                {formatTotal(total)}
                <span className="text-body ml-1.5 text-label-2">of 10</span>
              </>
            )}
          </p>
        </div>
        <p className="text-subhead mt-3 text-pretty text-label" aria-live="polite">
          {ready ? READY_LINE : SCORE_RULE}
        </p>
        <span id={reasonId} className="sr-only">
          {waitingFor ?? READY_LINE}
        </span>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <LockedButton tone="neutral" locked={!ready} busy={sending === "pass"} reasonId={reasonId} onClick={() => void send("pass")}>
            Not now
          </LockedButton>
          {/* The walkthrough's "invite" target on this page; Top work carries it on its own invite button. */}
          <div data-tour="invite" className="grid rounded-full">
            <LockedButton tone="meet" locked={!ready} busy={sending === "meet"} reasonId={reasonId} onClick={() => void send("meet")}>
              Invite to the event
            </LockedButton>
          </div>
          <LockedButton tone="neutral" locked={!ready} busy={sending === "hold"} reasonId={reasonId} onClick={() => void send("hold")} className="col-span-2">
            Score only, decide later
          </LockedButton>
        </div>
        {error ? (
          <p role="alert" className="text-footnote mt-3 text-pretty text-label">
            {error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

const linkButton =
  "-mx-1 rounded-md px-1 py-1 font-medium text-label underline decoration-control underline-offset-4 transition-colors duration-150 hover:decoration-label-2 pointer-coarse:py-2.5";
