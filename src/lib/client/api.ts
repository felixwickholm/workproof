import type {
  Attachment,
  Challenge,
  ChallengeDraft,
  CityOverview,
  Company,
  Decision,
  DecisionKind,
  DemoSession,
  EmployerHome,
  ExplainAnswer,
  Meeting,
  OwnProof,
  PassportEntry,
  ReviewQueue,
  SeekerHome,
  StoryStage,
} from "@/lib/domain/types";
import { cachedSession, getIdentity, getTalentId, rememberSession, switchToOwnIdentity } from "./local";

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
  /** Pass the person's name and contact when known, so they are removed before questions are written. */
  followups: (challengeId: string, answer: string, talent?: { name: string; contact: string }) =>
    request<{ questions: string[] }>("/api/followups", { method: "POST", body: { challengeId, answer, talent } }),
  submit: (input: {
    challengeId: string;
    talent: { id: string; name: string; contact: string };
    answer: string;
    explain: ExplainAnswer[];
    /** A picture re-encoded in the browser to a JPEG data URL (no metadata), at most 300 kB. */
    attachment?: Pick<Attachment, "kind" | "src" | "alt">;
    /** The answer was spoken; send only the transcript. */
    spoken?: boolean;
    shareWithSimilar: boolean;
  }) =>
    request<{ proof: OwnProof }>("/api/submissions", { method: "POST", body: input }).then((result) => {
      // Work handed in under the visitor's own key makes the seeker side theirs from now on.
      if (input.talent.id === getTalentId()) switchToOwnIdentity();
      return result;
    }),
  passport: (talentId: string) => request<PassportEntry[]>(`/api/passport/${encodeURIComponent(talentId)}`),
  /** The person's own home: invitations, the task feed and the passport. The talent id is their private key. */
  seekerHome: (talentId: string) => request<SeekerHome>(`/api/seeker/${encodeURIComponent(talentId)}/home`),
  /** The talent id is the person's private key, so only they can accept or confirm. */
  acceptMeeting: (id: string, talentId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(id)}/accept`, { method: "POST", body: { talentId } }),
  confirmMeeting: (id: string, talentId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(id)}/confirm`, {
      method: "POST",
      body: { side: "talent", talentId },
    }),
  /** Turns Second look on or off for one of the person's own proofs. */
  setSharing: (proofId: string, talentId: string, share: boolean) =>
    request<{ proofId: string; sharing: boolean }>(`/api/proofs/${encodeURIComponent(proofId)}/sharing`, {
      method: "POST",
      body: { talentId, share },
    }),
  city: () => request<CityOverview>("/api/city"),
  /** Share code, persona and story stage of the caller's sandbox. Asked once per page load, then cached. */
  demoSession: () => cachedSession() ?? rememberSession(request<DemoSession>("/api/demo/session")),
  /** Resets only the caller's sandbox, to the default stage for free exploring. The persona gets a new key. */
  resetDemo: () => rememberSession(request<DemoSession>("/api/demo/reset", { method: "POST" })),
  /** Rebuilds the caller's sandbox at a story stage; the walkthrough calls this on every step. */
  storyStage: (stage: StoryStage) => rememberSession(request<DemoSession>("/api/demo/story", { method: "POST", body: { stage } })),
};

/**
 * The talent id the seeker side acts as: the demo persona's key in this sandbox, unless the
 * visitor has handed in work as themselves, then their own random key.
 */
export async function currentTalentId(): Promise<string> {
  if (getIdentity() === "me") return getTalentId();
  return (await api.demoSession()).persona.talentId;
}

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
  home: (companyId: string) => request<EmployerHome>(`/api/companies/${encodeURIComponent(companyId)}/home`),
  decide: (input: { proofId: string; companyId: string; reviewer: string; decision: DecisionKind; feedback: string }) =>
    request<{ decision: Decision; meeting?: Meeting }>("/api/decisions", { method: "POST", body: input }),
  confirmMet: (meetingId: string, companyId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(meetingId)}/confirm`, { method: "POST", body: { side: "company", companyId } }),
};
