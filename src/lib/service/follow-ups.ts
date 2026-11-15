import { createHash } from "node:crypto";
import { getTaskDesigner } from "@/lib/ai";
import { redact, type KnownIdentity } from "@/lib/blind/redact";
import { fullTaskMessage, placesOf } from "@/lib/domain/places";
import type { Challenge, ExplainAnswer } from "@/lib/domain/types";
import { assertWritable, getStore, type FollowUpIssue, type StoreData } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { FOLLOW_UP_ACTION } from "./ai-work";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";

/** Follow-up answers about the person's own choices: two for an event task, one for a practice task. */
const FOLLOW_UPS_NEEDED = { event: 2, taster: 1 } as const;

/** Plain questions about the person's own choices, added by the server when the writer returns fewer than needed. */
export const FALLBACK_QUESTIONS = ["Why did you choose this approach?", "What would you check first if you had more time?"] as const;

/** Issued questions kept per event; the oldest unused ones go first. */
export const MAX_FOLLOW_UP_ISSUES = 200;

export const NOT_ISSUED = "These follow-up questions were not asked here. Finish the task again to get your questions.";
export const ANSWER_CHANGED = "Your answer changed after the follow-up questions were written. Finish the task again to get questions about these words.";

/** What a submission sends for each follow-up: the answer, and the question only to check it, never to store it. */
export type SentFollowUp = Omit<ExplainAnswer, "question"> & { question?: string };

function answerHash(answer: string): string {
  return createHash("sha256").update(answer.trim()).digest("hex");
}

/** The writer's questions, filled up to the number the task needs with plain ones, never repeating one. */
export function withFallbacks(kind: Challenge["kind"], written: readonly string[]): string[] {
  const needed = FOLLOW_UPS_NEEDED[kind];
  return [...written, ...FALLBACK_QUESTIONS.filter((q) => !written.includes(q))].slice(0, needed);
}

/** Why the follow-up answers do not keep the promise, or undefined when they do. */
export function followUpProblem(kind: Challenge["kind"], answers: readonly SentFollowUp[]): string | undefined {
  const needed = FOLLOW_UPS_NEEDED[kind];
  const answered = answers.filter((e) => e.answer.trim()).length;
  if (answered >= needed) return undefined;
  return needed === 1
    ? "Answer the follow-up question about your own choices"
    : `Answer ${needed} follow-up questions about your own choices (${answered} answered)`;
}

/** A task the server would refuse work for is refused before any question is written for it, and before any work is read. */
export function checkTakesWork(data: StoreData, challenge: Challenge): void {
  if (challenge.kind !== "event") return;
  if (!challenge.approvedBy) throw new ServiceError(409, "This challenge is not published yet");
  const places = placesOf(challenge);
  if (places !== null && data.proofs.filter((p) => p.challengeId === challenge.id).length >= places) throw new ServiceError(409, fullTaskMessage(places));
}

/**
 * Writes the follow-up questions for one answer and records them, so the submission can only answer
 * questions the server asked. The writer reads the answer after the blind layer, with the author's own
 * name and contact removed too. Checks run first, so a refused request never reaches a model.
 */
export async function issueFollowUps(challengeId: string, answer: string, known: KnownIdentity = {}): Promise<{ issueId: string; questions: string[] }> {
  await assertWritable();
  const snapshot = await getStore().read();
  const challenge = findOrThrow(snapshot.challenges, (c) => c.id === challengeId, "Challenge");
  checkTakesWork(snapshot, challenge);
  const questions = withFallbacks(challenge.kind, await getTaskDesigner().followUps(challenge, redact(answer, known).text));

  return getStore().update((data) => {
    const issue: FollowUpIssue = { id: newId("fu"), challengeId, answerHash: answerHash(answer), questions, issuedAt: clock.now().toISOString() };
    data.followUpIssues = [...(data.followUpIssues ?? []), issue].slice(-MAX_FOLLOW_UP_ISSUES);
    appendAudit(data, {
      actor: "ai",
      by: "Follow-up writer",
      action: FOLLOW_UP_ACTION,
      detail: `${questions.length} question${questions.length === 1 ? "" : "s"} on "${challenge.title}".`,
    });
    return { issueId: issue.id, questions };
  });
}

/**
 * The follow-up pairs a submission stores: the issued questions in the server's own words, each with the
 * person's answer. Refused when the questions were not issued for this task and these words, or when an
 * answer is missing. Pure, so the submission can check it again inside its atomic update.
 */
export function issuedFollowUps(
  data: StoreData,
  challenge: Challenge,
  input: { issueId?: string; answer: string; explain: readonly SentFollowUp[] },
): ExplainAnswer[] {
  const issue = data.followUpIssues?.find((i) => i.id === input.issueId);
  if (!issue || issue.challengeId !== challenge.id) throw new ServiceError(400, NOT_ISSUED);
  const invented = input.explain.some((e, i) => e.question !== undefined && e.question.trim() !== issue.questions[i]);
  if (invented || input.explain.length > issue.questions.length) throw new ServiceError(400, NOT_ISSUED);
  if (issue.answerHash !== answerHash(input.answer)) throw new ServiceError(409, ANSWER_CHANGED);
  const problem = followUpProblem(challenge.kind, input.explain);
  if (problem) throw new ServiceError(400, problem);
  return issue.questions.map((question, i) => {
    const sent = input.explain[i];
    return { question, answer: sent.answer, ...(sent.spoken ? { spoken: true } : {}) };
  });
}

/** An issue is used once: a second submission cannot reuse the same questions. */
export function useIssue(data: StoreData, issueId: string | undefined): void {
  if (data.followUpIssues) data.followUpIssues = data.followUpIssues.filter((i) => i.id !== issueId);
}
