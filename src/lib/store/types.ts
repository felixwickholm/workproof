import type {
  AuditEvent,
  Challenge,
  Company,
  Decision,
  Meeting,
  OwnProof,
  PastWork,
  Recommendation,
  StoryStage,
  Submission,
  TableInvite,
  Talent,
} from "@/lib/domain/types";

/**
 * Follow-up questions the server wrote for one answer to one task. A submission must name it and answer
 * exactly these questions; the server takes their wording from here, never from the request.
 */
export interface FollowUpIssue {
  id: string;
  challengeId: string;
  /** SHA-256 of the trimmed answer the questions were written for. The answer itself is not kept here. */
  answerHash: string;
  questions: string[];
  issuedAt: string;
}

/** What one person chose to share from their portfolio. Everything is private until they make a link. */
export interface PortfolioPrefs {
  talentId: string;
  /** Links the person made. `cardId` null is the whole portfolio. Removing a link ends it. */
  links: { token: string; cardId: string | null; createdAt: string }[];
  /** Cards whose decision a shared link shows. */
  decisionShown: string[];
}

/** The demo person this copy of the event is built around. */
export interface DemoInfo {
  /** The persona's private key inside this sandbox only. */
  personaTalentId: string;
  personaName: string;
  stage: StoryStage;
}

interface EventInfo {
  name: string;
  /** ISO date of the event day. */
  date: string;
  /** Hours an owning company has to respond before a consented proof opens to Second look. */
  responseWindowHours: number;
}

export interface StoreData {
  version: 1;
  event: EventInfo;
  companies: Company[];
  challenges: Challenge[];
  /** Identity. Read only by the passport and by revealed meetings. */
  talents: Talent[];
  submissions: Submission[];
  /** Blind projections, keyed by proofId, which equals the submission id. */
  proofs: OwnProof[];
  decisions: Decision[];
  meetings: Meeting[];
  audit: AuditEvent[];
  demo: DemoInfo;
  /** Invitations sent from the booth table to practice proofs. Missing in data saved before the table could invite. */
  tableInvites?: TableInvite[];
  /** Proofs one company shared with another, with the person's consent. Missing in data saved before sharing existed. */
  recommendations?: Recommendation[];
  /** Follow-up questions issued and not yet used, newest last. Missing in data saved before they were recorded. */
  followUpIssues?: FollowUpIssue[];
  /** Finished tasks from earlier Espoo events, for each person's portfolio. Missing in data saved before portfolios. */
  history?: PastWork[];
  /** Each person's portfolio links and choices. Missing in data saved before portfolios. */
  portfolios?: PortfolioPrefs[];
}

/**
 * Storage for WorkProof. `read` returns the live data: callers only read it and never change it.
 * `update` applies a change and persists it. The shape is small enough to keep as one document in any backend.
 */
export interface ProofStore {
  read(): Promise<StoreData>;
  update<T>(change: (data: StoreData) => T): Promise<T>;
  replace(data: StoreData): Promise<void>;
  /** Writes pending changes now. */
  flush(): void;
}
