import { appendFileSync } from "node:fs";
import { inject } from "vitest";
import { POST as decisionsRoute } from "@/app/api/decisions/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import type { ExplainAnswer, SkillScore } from "@/lib/domain/types";
import { getStore } from "@/lib/store";

// `never` accepts any typed route context; the call below passes the shape Next passes.
type Handler = (request: Request, ctx: never) => Promise<Response>;
type Invoke = (request: Request, ctx: { params: Promise<Record<string, string>> }) => Promise<Response>;

/** Calls a route handler the way Next does: a real Request and async params. */
export async function call<T = unknown>(
  handler: Handler,
  options: { body?: unknown; params?: Record<string, string>; method?: string; headers?: Record<string, string> } = {},
): Promise<{ status: number; json: T }> {
  const request = new Request("http://localhost/api", {
    method: options.method ?? (options.body === undefined ? "GET" : "POST"),
    headers: { "content-type": "application/json", ...options.headers },
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  });
  const response = await (handler as unknown as Invoke)(request, { params: Promise.resolve(options.params ?? {}) });
  return { status: response.status, json: (await response.json()) as T };
}

/**
 * Records one row for the summary table printed after the run, in this run's own file.
 * `result` says what was counted in words, never bare numbers such as status codes.
 */
export function record(evalName: string, check: string, result: string, pass: boolean): void {
  appendFileSync(inject("evalResultsFile"), `${JSON.stringify({ evalName, check, result, pass })}\n`);
}

/** The person's private key the way the client sends it: in a header, never in the path. */
export function ownKey(talentId: string): { headers: Record<string, string> } {
  return { headers: { "x-workproof-key": talentId } };
}

/** Every object key anywhere inside a value. */
export function keysDeep(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(keysDeep);
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([key, inner]) => [key, ...keysDeep(inner)]);
  }
  return [];
}

/** Two plain follow-up answers about the person's own choices, as every event proof needs. */
export const FOLLOW_UPS: ExplainAnswer[] = [
  { question: "Why did you choose this approach?", answer: "It keeps every frame of one attempt on the same side of the split." },
  { question: "What would you check first with more time?", answer: "On which data the threshold is chosen, before any number is reported." },
];

/** The given follow-up answers, filled up to the two an event proof needs with plain ones. */
export function twoFollowUps(explain: ExplainAnswer[] = []): ExplainAnswer[] {
  return [...explain, ...FOLLOW_UPS.slice(0, Math.max(0, 2 - explain.length))];
}

/** A submission body as the evals write it: follow-up answers, with or without the questions they meant. */
type SubmissionBody = Record<string, unknown> & { challengeId: string; answer: string; explain?: { question?: string; answer: string; spoken?: boolean }[]; issueId?: string };

/**
 * Sends work the way the work flow does: first asks the server for its follow-up questions, then submits
 * the answers in order under the issued id, as many as were asked. The server keeps its own wording of each question.
 */
export async function submit<T = unknown>({ body }: { body: SubmissionBody }): Promise<{ status: number; json: T }> {
  const issued = await call<{ issueId?: string; questions?: string[] }>(followUpsRoute, { body: { challengeId: body.challengeId, answer: body.answer } });
  // A practice task asks one question: answers past the issued ones are not sent.
  const explain = (body.explain ?? []).slice(0, issued.json.questions?.length).map(({ answer, spoken }) => ({ answer, ...(spoken ? { spoken } : {}) }));
  return call<T>(submissionsRoute, { body: { ...body, issueId: body.issueId ?? issued.json.issueId, explain } });
}

/** The points a named reviewer in an eval gives: 3 for every core skill of the proof's task, unless the body brings its own. */
export async function reviewerScores(proofId: string, points: SkillScore["points"] = 3): Promise<SkillScore[]> {
  const data = await getStore().read();
  const challengeId = data.submissions.find((s) => s.id === proofId)?.challengeId;
  return (data.challenges.find((c) => c.id === challengeId)?.coreSkills ?? []).map((s) => ({ skillId: s.id, points }));
}

/** Sends a decision the way the review screen does: the named reviewer's own points come with it. */
export async function decide<T = unknown>({ body }: { body: Record<string, unknown> & { proofId: string } }): Promise<{ status: number; json: T }> {
  return call<T>(decisionsRoute, { body: { scores: await reviewerScores(body.proofId), ...body } });
}
