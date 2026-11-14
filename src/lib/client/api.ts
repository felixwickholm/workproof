import type { AiStatus } from "@/lib/ai/provider/select";
import type {
  Attachment,
  Challenge,
  ChallengeDraft,
  CityOverview,
  CityTaskView,
  Company,
  CompanyTaskSummary,
  Decision,
  DecisionKind,
  DemoSession,
  DemoSessionReply,
  EmployerHome,
  ExplainAnswer,
  Meeting,
  MyTableInvite,
  OwnProof,
  Portfolio,
  Recommendation,
  RelatedPart,
  ReviewQueue,
  SeekerHome,
  ShareMatch,
  SkillScore,
  StoryStage,
  TableProof,
  TopProofs,
} from "@/lib/domain/types";
import type { AssistMessage, AssistReply } from "@/lib/service/assist";
import { VISITOR_KEY_HEADER } from "@/lib/service/table-rules";

export type { AssistMessage, AssistReply };
import { cachedSession, getIdentity, getTalentId, issuedFor, rememberIssue, rememberSession, switchToOwnIdentity } from "./local";

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

/**
 * A session with the persona's key. Every page visit gets a sandbox, so a reply without a persona means the
 * cookie is missing or blocked: an error the page shows, never a key borrowed from the shared event.
 */
async function withPersona(reply: Promise<DemoSessionReply>): Promise<DemoSession> {
  const session = await reply;
  if (!session.persona) throw new ApiError("This page has no demo of its own yet. Reload the page, with cookies allowed.", 401);
  return { ...session, persona: session.persona };
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
  /**
   * Pass the person's name and contact when known, so they are removed before questions are written. The server
   * records the questions under `issueId`; `submit` sends the latest one for the task unless given another.
   */
  followups: (challengeId: string, answer: string, talent?: { name: string; contact: string }) =>
    request<{ issueId: string; questions: string[] }>("/api/followups", { method: "POST", body: { challengeId, answer, talent } }).then((issued) => {
      rememberIssue(challengeId, issued.issueId);
      return issued;
    }),
  /** What the company would read, before sending: the same blind layer, nothing stored. */
  preview: (input: { answer: string; explain: { question: string; answer: string }[]; name: string; contact: string }) =>
    request<{ work: string; explain: ExplainAnswer[]; hiddenCount: number }>("/api/preview", { method: "POST", body: input }),
  submit: (input: {
    challengeId: string;
    talent: { id: string; name: string; contact: string };
    answer: string;
    /** The questions answered, from `followups`. Defaults to the latest issued for this task in this page. */
    issueId?: string;
    /** Answers to the issued questions, in order. The server keeps its own wording of each question. */
    explain: (Omit<ExplainAnswer, "question"> & { question?: string })[];
    /** A picture re-encoded in the browser to a JPEG data URL (no metadata), at most 300 kB, checked by the person. */
    attachment?: Pick<Attachment, "kind" | "src" | "alt"> & { confirmed: true };
    /** The answer was spoken; send only the transcript. */
    spoken?: boolean;
    shareWithSimilar: boolean;
    /** The option picked in a "choose" challenge; required there. */
    choice?: "a" | "b";
    /** The person's spoken thinking as text (at most 6,000 characters). Audio and screen stay on the device. */
    thinkAloud?: { transcript: string; seconds: number };
  }) =>
    request<{ proof: OwnProof }>("/api/submissions", { method: "POST", body: { ...input, issueId: input.issueId ?? issuedFor(input.challengeId) } }).then((result) => {
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
  /** The person's portfolio: every finished event task, newest first. The private key goes in a header. */
  portfolio: (talentId: string) => request<Portfolio>("/api/portfolio/me", { headers: keyHeader(talentId) }),
  /** Makes or ends a link to one card, or to the whole portfolio with `cardId` null. */
  setPortfolioLink: (talentId: string, cardId: string | null, on: boolean) =>
    request<{ cardId: string | null; link: string | null }>("/api/portfolio/links", { method: "POST", body: { talentId, cardId, on } }),
  /** Whether the person's links show the decision on one card. */
  setDecisionShown: (talentId: string, cardId: string, shown: boolean) =>
    request<{ cardId: string; decisionShown: boolean }>("/api/portfolio/decision", { method: "POST", body: { talentId, cardId, shown } }),
  /** What a shared link shows. Needs no key. */
  sharedPortfolio: (token: string) => request<Portfolio>(`/api/portfolio/shared/${encodeURIComponent(token)}`),
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
  demoSession: () => cachedSession() ?? rememberSession(withPersona(request<DemoSessionReply>("/api/demo/session"))),
  /** Resets only the caller's sandbox, to the default stage for free exploring. The persona gets a new key. */
  resetDemo: () => rememberSession(withPersona(request<DemoSessionReply>("/api/demo/reset", { method: "POST" }))),
  /** Rebuilds the caller's sandbox at a story stage; the walkthrough calls this on every step. */
  storyStage: (stage: StoryStage) => rememberSession(withPersona(request<DemoSessionReply>("/api/demo/story", { method: "POST", body: { stage } }))),
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
  if (error instanceof ApiError && error.status === 429) return "Too many changes in a short time. Wait a minute and try again.";
  if (error instanceof TypeError) return "You seem to be offline. Check the connection and try again.";
  return "Something went wrong on our side. Try again.";
}

/** Company side: draft and publish a challenge, read the blind queue, decide, confirm a meeting. */
export const companyApi = {
  draft: (need: string) => request<ChallengeDraft>("/api/challenges/draft", { method: "POST", body: { need } }),
  /** One turn of the new-challenge chat: a short question, or the draft. */
  assist: (messages: AssistMessage[]) => request<AssistReply>("/api/challenges/assist", { method: "POST", body: { messages } }),
  publish: (input: { draft: ChallengeDraft; companyId: string; approvedBy: string }) =>
    request<Challenge>("/api/challenges", { method: "POST", body: input }),
  queue: (companyId: string) => request<ReviewQueue>(`/api/companies/${encodeURIComponent(companyId)}/queue`),
  home: (companyId: string) => request<EmployerHome>(`/api/companies/${encodeURIComponent(companyId)}/home`),
  /** A named reviewer's decision with one 1-5 score per core skill. "hold" scores now and decides later. */
  decide: (input: { proofId: string; companyId: string; reviewer: string; decision: DecisionKind; feedback: string; scores: SkillScore[] }) =>
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
  /** Turns a hold into meet or pass; a meeting is created only on meet. */
  decideHold: (decisionId: string, input: { decision: "meet" | "pass"; reviewer: string }) =>
    request<{ decision: Decision; meeting?: Meeting }>(`/api/decisions/${encodeURIComponent(decisionId)}/decide`, { method: "POST", body: input }),
  /** The leaderboard for one task: scored proofs by human total, then the unscored ones, oldest first. */
  top: (companyId: string, taskId: string) =>
    request<TopProofs>(`/api/companies/${encodeURIComponent(companyId)}/tasks/${encodeURIComponent(taskId)}/top`),
  /** The company's tasks with counts and the top human total. */
  tasks: (companyId: string) => request<CompanyTaskSummary[]>(`/api/companies/${encodeURIComponent(companyId)}/tasks`),
  /** Where each skill shows up in the work, by cue words. No number. */
  related: (proofId: string, companyId: string) =>
    request<RelatedPart[]>(`/api/proofs/${encodeURIComponent(proofId)}/related?companyId=${encodeURIComponent(companyId)}`),
  /** Reads a job ad from a link and returns a draft to approve. */
  fromAd: (url: string) => request<ChallengeDraft>("/api/challenges/from-ad", { method: "POST", body: { url } }),
  /** Opens a challenge the city made for the company. */
  claim: (challengeId: string, companyId: string) =>
    request<Challenge>(`/api/challenges/${encodeURIComponent(challengeId)}/claim`, { method: "POST", body: { companyId } }),
  /** Shares scored work with another company, with the person's consent. */
  recommend: (input: { proofId: string; fromCompanyId: string; toCompanyId: string }) =>
    request<Recommendation>("/api/recommendations", { method: "POST", body: input }),
  /** After a talk both sides confirmed: was a follow-up agreed? */
  followUp: (meetingId: string, companyId: string, agreed: boolean) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(meetingId)}/follow-up`, { method: "POST", body: { companyId, agreed } }),
  hired: (meetingId: string, companyId: string) =>
    request<Meeting>(`/api/meetings/${encodeURIComponent(meetingId)}/hired`, { method: "POST", body: { companyId } }),
};

/** City side: publish for a company, read one task's numbers and leaderboard, share good candidates. */
export const cityApi = {
  publishForCompany: (input: { companyId: string; draft: ChallengeDraft; by: string }) =>
    request<{ challenge: Challenge; message: string }>("/api/city/challenges", { method: "POST", body: input }),
  task: (challengeId: string) => request<CityTaskView>(`/api/city/tasks/${encodeURIComponent(challengeId)}`),
  matches: (challengeId: string) => request<ShareMatch[]>(`/api/city/tasks/${encodeURIComponent(challengeId)}/matches`),
  recommend: (input: { proofId: string; toCompanyId: string; by: string }) =>
    request<Recommendation>("/api/city/recommendations", { method: "POST", body: input }),
};
