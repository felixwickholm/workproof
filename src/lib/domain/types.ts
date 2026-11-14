/**
 * Domain model. Two rules shape every type here:
 * 1. Identity lives only in `Talent`. Reviewers receive `BlindProof`, which has no identity fields.
 * 2. Nothing describes a person with a score, rank or rating. Decisions are made and logged by humans.
 */

export type TaskFormat = "review" | "plan" | "write" | "build" | "explain";

export interface Skill {
  id: string;
  label: string;
  /** One line: why this skill is core to the role. */
  why: string;
}

export interface ReviewPrompt {
  skillId: string;
  /** What a human reviewer should look for in the work. Never a scale. */
  lookFor: string;
}

export interface Company {
  id: string;
  name: string;
  blurb: string;
}

export interface Challenge {
  id: string;
  /** More than one company means a pooled challenge: one piece of work, several employers. */
  companyIds: string[];
  title: string;
  /** The need as the company first said it. */
  need: string;
  coreSkills: Skill[];
  /** Requirements the draft set aside so the role keeps 3-5 core skills. */
  setAside: string[];
  format: TaskFormat;
  minutes: number;
  /** The situation, written like a message from the team. */
  brief: string;
  /** Optional material to work on, for example a code change to review. */
  material?: { kind: "code" | "text"; title: string; body: string };
  deliverable: string;
  reviewGuide: ReviewPrompt[];
  aiAllowed: boolean;
  kind: "event" | "taster";
  /** AI drafts a challenge. A human at the company approves it before it is published. */
  approvedBy?: string;
  createdAt: string;
}

export type ChallengeDraft = Omit<Challenge, "id" | "approvedBy" | "createdAt" | "companyIds">;

/** The only place a person's identity is stored. */
export interface Talent {
  id: string;
  name: string;
  contact: string;
}

export interface ExplainAnswer {
  question: string;
  answer: string;
}

export interface Submission {
  id: string;
  challengeId: string;
  talentId: string;
  answer: string;
  explain: ExplainAnswer[];
  /** The person agrees that other employers with the same need may see the blind proof. */
  shareWithSimilar: boolean;
  submittedAt: string;
}

export interface RedactionReport {
  names: number;
  contacts: number;
  places: number;
  schools: number;
  employers: number;
  other: number;
}

/** What a reviewer sees. Built by an allow-list projection, never by deleting fields. */
export interface BlindProof {
  proofId: string;
  /** Neutral label such as "Proof K7". */
  label: string;
  challengeId: string;
  challengeTitle: string;
  skills: Skill[];
  work: string;
  explain: ExplainAnswer[];
  /** Describes the work, never the person. Always shown with an AI label. */
  aiSummary: string;
  redactions: RedactionReport;
  submittedAt: string;
}

export type DecisionKind = "meet" | "pass";

export interface Decision {
  id: string;
  proofId: string;
  companyId: string;
  /** The human who decided. */
  reviewer: string;
  decision: DecisionKind;
  /** Two lines of feedback for the person. Required, so nobody is ghosted. */
  feedback: string;
  decidedAt: string;
}

export type MeetingStatus = "invited" | "accepted" | "met";

export interface Meeting {
  id: string;
  proofId: string;
  companyId: string;
  slot: string;
  status: MeetingStatus;
  talentConfirmedMet: boolean;
  companyConfirmedMet: boolean;
}

export interface AuditEvent {
  id: string;
  at: string;
  actor: "ai" | "human" | "system";
  /** Who or what acted, for example "Task drafter" or a reviewer name. */
  by: string;
  action: string;
  detail: string;
}

/** A proof as its author sees it in the passport. */
export interface PassportEntry {
  proof: BlindProof;
  challenge: Pick<Challenge, "id" | "title" | "minutes" | "format">;
  seenByHumans: number;
  responses: {
    companyName: string;
    decision: DecisionKind;
    feedback: string;
    viaSecondLook: boolean;
    meeting?: Meeting;
  }[];
  /** Employers with the same need who can now see this proof. */
  sharedWith: string[];
}

export interface ReviewQueue {
  company: Company;
  challenges: Challenge[];
  /** Proofs for this company's own challenges, oldest first. Order is arrival time, not quality. */
  proofs: BlindProof[];
  /** Proofs another employer passed on, where the challenge shares core skills. Oldest first. */
  secondLook: (BlindProof & { sharedSkills: string[] })[];
  decided: { proof: BlindProof; decision: Decision; meeting?: Meeting; identity?: Talent }[];
}

export interface EmployerRecord {
  company: Company;
  challengeLiveDaysBeforeEvent: number;
  proofsReceived: number;
  feedbackGiven: number;
  feedbackOwed: number;
  medianHoursToRespond: number | null;
  meetingsHeld: number;
}

export interface CityOverview {
  event: { name: string; date: string };
  totals: {
    challenges: number;
    proofs: number;
    humanDecisions: number;
    meetingsInvited: number;
    meetingsConfirmedByBoth: number;
    secondLookMeetings: number;
    automatedDecisions: 0;
  };
  employers: EmployerRecord[];
  audit: AuditEvent[];
}
