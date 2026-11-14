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
  /** The need as talent sees it: rebuilt from the role and core skills, never the company's own sentence. */
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

export type ChallengeDraft = Omit<Challenge, "id" | "approvedBy" | "createdAt" | "companyIds"> & {
  /** The company's own sentence, returned only to the company's draft screen. Never published. */
  yourWords?: string;
  /** A note for the company, for example when no library role matched. Never published. */
  note?: string;
  /** How many wishes the company's own sentence listed, for the company's draft screen. Never published. */
  wishCount?: number;
};

/** The only place a person's identity is stored. */
export interface Talent {
  /** The person's private key in this no-login demo. Never sent to a company or the city. */
  id: string;
  name: string;
  contact: string;
  /** Set by the first event submission with both name and contact. After that, nobody can change them. */
  locked?: boolean;
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
  /** Opt-in: other employers with matching tasks may see the blind proof. The person can withdraw it. */
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
  /**
   * "At a glance": the shape of the work (points, length, code, opening words), built by code.
   * Not written by AI and never about quality. The name is kept for API compatibility.
   */
  aiSummary: string;
  /** How many personal details were hidden, as one total. Categories stay with the author. */
  hiddenCount: number;
  submittedAt: string;
}

/** A proof as its author sees it: the blind proof plus what was hidden, by category. */
export interface OwnProof extends BlindProof {
  redactions: RedactionReport;
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
  proof: OwnProof;
  challenge: Pick<Challenge, "id" | "title" | "minutes" | "format" | "kind">;
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
  /** Whether the person currently lets other employers see this proof through Second look. Event proofs only. */
  sharing: boolean;
}

export interface ReviewQueue {
  company: Company;
  challenges: Challenge[];
  /** Proofs for this company's own challenges, oldest first. Order is arrival time, not quality. */
  proofs: BlindProof[];
  /** Proofs another employer passed on, where the challenge shares core skills. Oldest first. */
  secondLook: (BlindProof & { sharedSkills: string[] })[];
  /** `identity` appears only after the person accepts. It never carries the talent id. */
  decided: { proof: BlindProof; decision: Decision; meeting?: Meeting; identity?: Pick<Talent, "name" | "contact"> }[];
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
    /** Event proofs with at least one employer decision: people who got an answer. */
    proofsAnswered: number;
    /** Median hours from sending a proof to its first decision, or null before any answer. */
    medianHoursToFirstAnswer: number | null;
    humanDecisions: number;
    meetingsInvited: number;
    meetingsConfirmedByBoth: number;
    secondLookMeetings: number;
    automatedDecisions: 0;
  };
  employers: EmployerRecord[];
  audit: AuditEvent[];
}
