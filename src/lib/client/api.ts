import type {
  BlindProof,
  Challenge,
  ChallengeDraft,
  CityOverview,
  Company,
  Decision,
  DecisionKind,
  ExplainAnswer,
  Meeting,
  PassportEntry,
  ReviewQueue,
} from "@/lib/domain/types";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown }): Promise<T> {
  const res = await fetch(path, {
    method: init?.method ?? "GET",
    headers: init?.body === undefined ? undefined : { "Content-Type": "application/json" },
    body: init?.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      // Body was not JSON; keep the status message.
    }
    throw new ApiError(message, res.status);
  }
  return (await res.json()) as T;
}

export const api = {
  challenges: () => request<Challenge[]>("/api/challenges"),
  challenge: (id: string) => request<Challenge>(`/api/challenges/${encodeURIComponent(id)}`),
  companies: () => request<Company[]>("/api/companies"),
  taster: (dreamJob: string) => request<Challenge>("/api/taster", { method: "POST", body: { dreamJob } }),
  followups: (challengeId: string, answer: string) =>
    request<{ questions: string[] }>("/api/followups", { method: "POST", body: { challengeId, answer } }),
  submit: (input: {
    challengeId: string;
    talent: { id: string; name: string; contact: string };
    answer: string;
    explain: ExplainAnswer[];
    shareWithSimilar: boolean;
  }) => request<{ proof: BlindProof }>("/api/submissions", { method: "POST", body: input }),
  passport: (talentId: string) => request<PassportEntry[]>(`/api/passport/${encodeURIComponent(talentId)}`),
  acceptMeeting: (id: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(id)}/accept`, { method: "POST" }),
  confirmMeeting: (id: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(id)}/confirm`, {
      method: "POST",
      body: { side: "talent" },
    }),
  city: () => request<CityOverview>("/api/city"),
  resetDemo: () => request<unknown>("/api/demo/reset", { method: "POST" }),
};

/** Plain words for an error shown to a person. */
export function errorText(error: unknown): string {
  if (error instanceof ApiError && error.status === 404) return "It is not available right now.";
  if (error instanceof TypeError) return "You seem to be offline. Check the connection and try again.";
  return "Something went wrong on our side. Try again.";
}

/** Company side: draft and publish a challenge, read the blind queue, decide, confirm a meeting. */
export const companyApi = {
  draft: (need: string) => request<ChallengeDraft>("/api/challenges/draft", { method: "POST", body: { need } }),
  publish: (input: { draft: ChallengeDraft; companyId: string; approvedBy: string }) =>
    request<Challenge>("/api/challenges", { method: "POST", body: input }),
  queue: (companyId: string) => request<ReviewQueue>(`/api/companies/${encodeURIComponent(companyId)}/queue`),
  decide: (input: { proofId: string; companyId: string; reviewer: string; decision: DecisionKind; feedback: string }) =>
    request<{ decision: Decision; meeting?: Meeting }>("/api/decisions", { method: "POST", body: input }),
  confirmMet: (meetingId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(meetingId)}/confirm`, { method: "POST", body: { side: "company" } }),
};
