import type { AiStatus } from "@/lib/ai/provider/select";
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
  MyTableInvite,
  OwnProof,
  ReviewQueue,
  SeekerHome,
  StoryStage,
  TableProof,
} from "@/lib/domain/types";
import { VISITOR_KEY_HEADER } from "@/lib/service/table-rules";
import { cachedSession, getIdentity, getTalentId, rememberSession, switchToOwnIdentity } from "./local";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: { method?: "GET" | "POST"; body?: unknown; headers?: Record<string, string> }): Promise<T> {
  const res = await fetch(path, {
    method: init?.method ?? "GET",
    headers: { ...(init?.body === undefined ? {} : { "Content-Type": "application/json" }), ...init?.headers },
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

/** A private key in a header, never in the path, so it stays out of access logs and the browser history. */
const keyHeader = (talentId: string) => ({ [VISITOR_KEY_HEADER]: talentId });

/** The visitor's own private key, for the routes only a proof's author may use. */
const ownKey = () => keyHeader(getTalentId());

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
    /** A picture re-encoded in the browser to a JPEG data URL (no metadata), at most 300 kB, checked by the person. */
    attachment?: Pick<Attachment, "kind" | "src" | "alt"> & { confirmed: true };
    /** The answer was spoken; send only the transcript. */
    spoken?: boolean;
    shareWithSimilar: boolean;
  }) =>
    request<{ proof: OwnProof }>("/api/submissions", { method: "POST", body: input }).then((result) => {
      // Work handed in under the visitor's own key makes the seeker side theirs from now on.
      if (input.talent.id === getTalentId()) switchToOwnIdentity();
      return result;
    }),
  /** The person's own home: invitations, the task feed and the passport. The talent id is their private key, sent in a header. */
  seekerHome: (talentId: string) => request<SeekerHome>("/api/seeker/me/home", { headers: keyHeader(talentId) }),
  /** The talent id is the person's private key, so only they can accept or confirm. */
  acceptMeeting: (id: string, talentId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(id)}/accept`, { method: "POST", body: { talentId } }),
  /** Only the invited person can decline, while the invitation is open. The name is never shown. */
  declineMeeting: (id: string, talentId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(id)}/decline`, { method: "POST", body: { talentId } }),
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
  /** Practice proofs sent at this table, newest first: label, task and kind only, never the words. */
  tableProofs: () => request<TableProof[]>("/api/table/proofs"),
  /** The person hosting the table invites the author of one practice proof, in two sentences. */
  inviteFromTable: (proofId: string, input: { host: string; message: string }) =>
    request<MyTableInvite>(`/api/table/proofs/${encodeURIComponent(proofId)}/invite`, { method: "POST", body: input }),
  /** The table's invitation for one of the visitor's own practice proofs. Sent with the visitor's own key. */
  tableMine: (proofId: string) => request<MyTableInvite>(`/api/table/mine?proofId=${encodeURIComponent(proofId)}`, { headers: ownKey() }),
  /** The author accepts: the first name is stored only now, and shown on the big screen. */
  acceptTableInvite: (proofId: string, firstName: string) =>
    request<MyTableInvite>(`/api/table/proofs/${encodeURIComponent(proofId)}/accept`, { method: "POST", body: { firstName }, headers: ownKey() }),
  /** The author says not now; nothing about them is sent. */
  declineTableInvite: (proofId: string) =>
    request<MyTableInvite>(`/api/table/proofs/${encodeURIComponent(proofId)}/decline`, { method: "POST", headers: ownKey() }),
  city: () => request<CityOverview>("/api/city"),
  /** The configured task designer and whether it answers right now. Never a key. */
  aiStatus: () => request<AiStatus>("/api/ai/status"),
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
  /** "Add me as a reviewer for {company}": a decision must name a person registered for the company. */
  addReviewer: (companyId: string, name: string) =>
    request<{ companyId: string; reviewers: string[] }>(`/api/companies/${encodeURIComponent(companyId)}/reviewers`, { method: "POST", body: { name } }),
  /** Reports a picture as possibly identifying: it is removed from the blind proof for every reader. */
  reportPicture: (proofId: string, companyId: string, reviewer: string) =>
    request<{ proofId: string; pictureRemoved: true }>(`/api/proofs/${encodeURIComponent(proofId)}/picture/report`, {
      method: "POST",
      body: { companyId, reviewer },
    }),
  confirmMet: (meetingId: string, companyId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(meetingId)}/confirm`, { method: "POST", body: { side: "company", companyId } }),
};
