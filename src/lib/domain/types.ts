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

/** What the person hands in. Shown as "Writing", "Plan", "Photo", "Short video", "Voice answer", "Design", "Code". */
export type ProofKind = "writing" | "plan" | "photo" | "video" | "voice" | "design" | "code";

/** A picture or clip of the work, never of the person. */
export interface Attachment {
  kind: "photo" | "video" | "design";
  /** A path under /demo for sample data, or a data URL for a visitor's own picture (re-encoded in the browser, no metadata). */
  src: string;
  /** What the picture shows, in words. Runs through the blind layer like any text. */
  alt: string;
  /** Video only. */
  seconds?: number;
  poster?: string;
}

export type EspooDistrict =
  | "Otaniemi"
  | "Tapiola"
  | "Leppävaara"
  | "Matinkylä"
  | "Espoon keskus"
  | "Espoonlahti"
  | "Kera"
  | "Keilaniemi";

/** Where the demo story stands. The server rebuilds a sandbox deterministically at each stage. */
export type StoryStage = "before" | "sent" | "invited" | "met";

export interface Company {
  id: string;
  name: string;
  blurb: string;
  /** For example "Home care". */
  sector: string;
  /** The company carries the place; a task never does. */
  district: EspooDistrict;
  /** For example "120 people". */
  size: string;
  /** Facts about the employer, never about a person. For example "English" or "Finnish and English". */
  workLanguage: string;
  finnishNeeded: boolean;
  permitSupport: boolean;
  relocationHelp: boolean;
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
  /** What the person hands in. Every task also accepts a written or spoken answer instead. */
  proofKind: ProofKind;
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
  /** Given by voice. Only the transcript is stored; audio never leaves the browser. */
  spoken?: boolean;
}

export interface Submission {
  id: string;
  challengeId: string;
  talentId: string;
  answer: string;
  explain: ExplainAnswer[];
  attachment?: Attachment;
  /** The answer was given by voice and is stored only as text. */
  spoken?: boolean;
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
  proofKind: ProofKind;
  work: string;
  explain: ExplainAnswer[];
  /** Picture or clip of the work; its `alt` text has been through the blind layer. */
  attachment?: Attachment;
  /** The answer was spoken and is shown as text. The voice is not shared. */
  spoken?: boolean;
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
  insights: CityInsights;
}

/** Where one proof stands, for the city's flow picture. A proof label and a company, never a person. */
export type FlowState = "sent" | "answered" | "invited" | "met";

/** What the city learns from the event. Counts of tasks, proofs and human decisions; nothing about a person. */
export interface CityInsights {
  /** Core skills asked for most, top 8 by tasks, then by label. */
  demandBySkill: { skillId: string; label: string; tasks: number; proofs: number }[];
  /** Only kinds that at least one task asks for, in PROOF_KINDS order. */
  byProofKind: { kind: ProofKind; tasks: number; proofs: number }[];
  /** Tasks shared by more than one employer: one piece of work, several readers. */
  pooled: { challengeId: string; title: string; companies: string[]; proofs: number }[];
  funnel: { proofs: number; answered: number; invited: number; accepted: number; met: number };
  fairness: {
    automatedDecisions: 0;
    /** Personal details the blind layer hid, over all event proofs. */
    detailsHidden: number;
    decisionsWithNamedHuman: number;
    decisionsWithFeedback: number;
    secondLookConsents: number;
    /** Names shown to an employer, each only after the person accepted. */
    namesShownAfterAccept: number;
    /** Company wishes the task drafter set aside to keep 3-5 core skills. */
    wishesSetAside: number;
  };
  /** Tasks published at least three days before the event day. */
  readiness: { tasks: number; liveThreeDaysBefore: number };
  /** Event proofs, oldest first, at the furthest step any employer took. */
  flows: { proofLabel: string; companyId: string; state: FlowState }[];
  /** Event proofs per day for the 8 days up to the event day (ISO dates), zero-filled. */
  arrivalsByDay: { day: string; proofs: number }[];
  companies: Company[];
}

/** One employer's invitation, as the invited person sees it. */
export interface SeekerInvitation {
  meetingId: string;
  proofId: string;
  proofLabel: string;
  companyName: string;
  sector: string;
  district: EspooDistrict;
  /** The human who chose to meet. */
  reviewer: string;
  feedback: string;
  slot: string;
  status: MeetingStatus;
  viaSecondLook: boolean;
}

/** An open task in the seeker feed. */
export interface SeekerTask {
  /** As talent sees it: no set-aside wishes. */
  challenge: Challenge;
  companies: Company[];
  proofsSent: number;
  /** Median hours from a proof to its first answer on this task, or null before any answer. */
  medianReplyHours: number | null;
  /** The person has handed in work for this task. */
  mine: boolean;
}

/** The work seeker's home. Built for the person themselves, from their private key. */
export interface SeekerHome {
  /** `firstName` is null until the person has given a name. `fact` is one plain sentence from the data. */
  greeting: { firstName: string | null; fact: string };
  counts: { proofs: number; readByPeople: number; writtenAnswers: number; invitations: number };
  /** Newest first. */
  invitations: SeekerInvitation[];
  /** Newest first, the same for everyone: not personalised and not ranked by fit. */
  tasks: SeekerTask[];
  passport: PassportEntry[];
}

export type PipelineStage = "To read" | "Answered" | "Invited" | "Accepted" | "Met";

/** An employer's home. Blind proofs and counts only; no talent id, name or contact. */
export interface EmployerHome {
  company: Company;
  greeting: { fact: string };
  counts: {
    /** Blind proofs this company can read now: its own queue plus Second look. */
    waiting: number;
    /** Proofs sent to this company's own tasks that have no answer yet. */
    feedbackOwed: number;
    medianHoursToRespond: number | null;
    /** Invitations this company sent, whatever their status. */
    meetings: number;
  };
  /** This company's live tasks, newest first. */
  tasks: { challenge: Challenge; proofsReceived: number; waiting: number; daysLive: number }[];
  /** The oldest five waiting proofs, in arrival order. */
  queuePreview: BlindProof[];
  secondLookWaiting: number;
  pipeline: { stage: PipelineStage; count: number }[];
  /** Hours from this company's first task going live to its first Meet decision, or null. */
  hoursToFirstMeeting: number | null;
  /** For each core skill this company asks for: event proofs handed in for any task with that skill. Counts only. */
  pool: { skillId: string; label: string; proofs: number }[];
  /** The whole event, the same numbers as the city totals. */
  event: { proofs: number; proofsAnswered: number; medianHoursToFirstAnswer: number | null };
}

/** The caller's demo sandbox. Returned only to the visitor who owns it. */
export interface DemoSession {
  /** Share code of the caller's sandbox, for `?table=<code>`. Null outside a sandbox (the shared default store). */
  code: string | null;
  /** The demo person's private key in this sandbox, and her name. */
  persona: { talentId: string; name: string };
  stage: StoryStage;
}
