import type {
  AuditEvent,
  Challenge,
  Company,
  Decision,
  Meeting,
  OwnProof,
  StoryStage,
  Submission,
  TableInvite,
  Talent,
} from "@/lib/domain/types";

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
}

/**
 * Storage for Workprint. `read` returns the live data: callers only read it and never change it.
 * `update` applies a change and persists it. The shape is small enough to keep as one document in any backend.
 */
export interface ProofStore {
  read(): Promise<StoreData>;
  update<T>(change: (data: StoreData) => T): Promise<T>;
  replace(data: StoreData): Promise<void>;
  /** Writes pending changes now. */
  flush(): void;
}
