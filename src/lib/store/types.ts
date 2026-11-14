import type {
  AuditEvent,
  BlindProof,
  Challenge,
  Company,
  Decision,
  Meeting,
  Submission,
  Talent,
} from "@/lib/domain/types";

export interface EventInfo {
  name: string;
  /** ISO date of the event day. */
  date: string;
  /** Hours an owning company has to respond before a consented proof opens to Second Look. */
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
  proofs: BlindProof[];
  decisions: Decision[];
  meetings: Meeting[];
  audit: AuditEvent[];
}

/**
 * Storage for Tryout. Reads return a snapshot; `update` applies a change and persists it.
 * The shape is small enough to keep as one document in any backend.
 */
export interface ProofStore {
  read(): Promise<StoreData>;
  update<T>(change: (data: StoreData) => T): Promise<T>;
  replace(data: StoreData): Promise<void>;
}
