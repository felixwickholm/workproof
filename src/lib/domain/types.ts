/**
 * Domain model. Two rules shape every type here:
 * 1. Identity lives only in `Talent`. Reviewers receive `BlindProof`, which has no identity fields.
 * 2. Scores are given only by a named human reviewer. Software never scores, ranks or decides.
 */

/** How a challenge is done. Shown to people as Choose, Make, Fix, Read. */
export type TaskFormat = "choose" | "make" | "fix" | "read";

/** One of the two options in a "choose" challenge. */
export interface ChoiceOption {
  id: "a" | "b";
  title: string;
  body: string;
  /** A path under /demo for a sample picture. */
  image?: string;
}

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
  /**
   * The person checked their own picture: it shows the work only, with no face, name, badge or contact details.
   * Required for a visitor's picture; pixels are not analysed, so this is the person's own check. Never shown to a reviewer.
   */
  confirmed?: true;
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
  /**
   * The people registered to decide for this company. A decision must name one of them, so no
   * decision can come from a nameless process. Read it through `companyReviewers`.
   */
  reviewers?: string[];
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
  /**
   * How many answers an event task takes, chosen by the employer when publishing (5 to 30). Unset
   * means 12; read it through `placesOf` in `places.ts`. A practice task has no limit.
   */
  places?: number;
  /**
   * Facts about the job, shown to talent as "Good to know": a work language, a language level, a licence
   * or permit the law asks for. Fixed neutral forms only ("Nurse licence needed"), never the company's words.
   */
  requirements?: string[];
  /** AI drafts a challenge. A human at the company approves it before it is published. */
  approvedBy?: string;
  createdAt: string;
  /** The two options of a "choose" challenge. */
  options?: [ChoiceOption, ChoiceOption];
  /** The city made this challenge for the company, from its words or its job-ad link. */
  onBehalf?: { by: string; adUrl?: string };
  /** When the company opened a challenge the city made for it (one click). Unset while unclaimed. */
  claimedAt?: string;
  /**
   * The library template the scripted designer built the task from ("backend", or "generic"). Follow-up
   * questions read it, never the editable title. Unset for a task a model wrote: the generic role answers.
   */
  templateId?: string;
}

/** The designer that wrote a draft: the built-in scripted one or a live model. */
export type DraftedBy = "scripted" | "claude" | "gemini";

/**
 * What became of one wish the company wrote: kept as a core skill, set aside with a reason, or read as a
 * fact about the job (a language or a licence) that talent sees under "Good to know".
 * A wish about the person carries only its neutral category name ("age", "school"), never the words typed.
 */
export interface WishOutcome {
  text: string;
  outcome: "kept" | "set-aside" | "fact";
  /** The core skill a kept wish became. */
  skillId?: string;
  /** Why a wish was set aside, in a full sentence. */
  reason?: string;
}

export type ChallengeDraft = Omit<Challenge, "id" | "approvedBy" | "createdAt" | "companyIds" | "requirements"> & {
  /** Facts about the job in fixed forms, for the company's draft screen. Published as the challenge's `requirements`. */
  facts?: string[];
  /** The designer whose output was accepted, for the company's draft screen. Never published or stored. */
  draftedBy?: DraftedBy;
  /** The company's own sentence, returned only to the company's draft screen. Never published. */
  yourWords?: string;
  /** A note for the company, for example when no library role matched. Never published. */
  note?: string;
  /** Each wish the company wrote and what became of it, for the company's draft screen. Never published. */
  wishes?: WishOutcome[];
  /** The job-ad link the draft was read from. Kept only as `onBehalf.adUrl` when the city publishes it. */
  adUrl?: string;
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

/**
 * The person's spoken thinking while they worked. Only the text is stored; audio and screen video stay on the
 * device, except sample clips under /demo.
 */
export interface ThinkAloud {
  /** Runs through the blind layer like all text before any reviewer reads it. */
  transcript: string;
  seconds: number;
  /** A screen recording: a sample clip under /demo only. */
  screen?: Attachment;
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
  /** A reviewer reported the picture as possibly identifying, and it was removed for every reader. */
  pictureRemoved?: true;
  /** The option picked in a "choose" challenge. */
  choice?: "a" | "b";
  thinkAloud?: ThinkAloud;
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
  /** "At a glance": the shape of the work (points, length, code, opening words), built by code, never about quality. */
  glance: string;
  submittedAt: string;
  /** The option picked in a "choose" challenge. */
  choice?: "a" | "b";
  /** The think-aloud transcript after the blind layer, with its length and any sample screen clip. */
  thinkAloud?: ThinkAloud;
}

/**
 * A proof as its author sees it: the blind proof plus what was hidden. The count stays with the author:
 * shown to a reviewer, more hidden details (foreign places, schools, names) would hint at a background.
 */
export interface OwnProof extends BlindProof {
  /** How many personal details were hidden, as one total. */
  hiddenCount: number;
  redactions: RedactionReport;
}

/** "hold": scored, not decided yet. A hold later becomes "meet" or "pass"; its scores and reason stay. */
export type DecisionKind = "meet" | "pass" | "hold";

/** A human reviewer's points for one skill. Never produced by software. */
export interface SkillScore {
  skillId: string;
  points: 1 | 2 | 3 | 4 | 5;
}

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
  /** One score per core skill of the task, from the named reviewer. Required for new decisions; older records may lack it. */
  scores?: SkillScore[];
  /** Average points × 2, one decimal, 0 to 10. Set with `scores`. */
  total?: number;
}

/** "declined": the person said no. Their name is never shown to the company. */
export type MeetingStatus = "invited" | "accepted" | "declined" | "met";

export interface Meeting {
  id: string;
  proofId: string;
  companyId: string;
  /** A proposed time and table, for example "Sat 13:15, Table 2", or "Time to be agreed" when the event day is full. */
  slot: string;
  status: MeetingStatus;
  talentConfirmedMet: boolean;
  companyConfirmedMet: boolean;
  /** Set by the company after the talk: a follow-up was agreed, or not. */
  followUpAgreed?: boolean;
  /** Set by the company once the person was hired. */
  hired?: boolean;
}

/**
 * A company tips another company about a proof it scored. Needs the person's sharing consent. The receiving
 * company sees who recommended it and the blind proof, never the sender's scores.
 */
export interface Recommendation {
  id: string;
  proofId: string;
  /** The company whose challenge the proof answered, and which scored it. */
  fromCompanyId: string;
  toCompanyId: string;
  at: string;
  /** Set when the city made the recommendation: the person at the city who sent it. */
  byCity?: string;
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
  /** The person's own words before the blind layer. Returned only to the person, never to a company or the city. */
  original: { answer: string; explain: ExplainAnswer[] };
  challenge: Pick<Challenge, "id" | "title" | "minutes" | "format" | "kind">;
  /** Decisions on this proof, one per company reviewer who decided. Kept while screens still read it; see `reviewersAnswered`. */
  seenByHumans: number;
  /**
   * Reviewers who decided on this proof, with a written answer. Opening or reading a proof is not recorded,
   * so this counts answers, never reads. The same value as `seenByHumans`.
   */
  reviewersAnswered: number;
  responses: {
    companyName: string;
    /** The person who decided, for "Not now" as much as for "Meet". */
    reviewer: string;
    /** The reviewer's points per skill, with the skill's label, so the person sees how their work was scored. */
    scores?: (SkillScore & { label: string })[];
    total?: number;
    decision: DecisionKind;
    feedback: string;
    viaSecondLook: boolean;
    meeting?: Meeting;
  }[];
  /** Employers with the same need who can now see this proof. */
  sharedWith: string[];
  /** Companies another company shared this proof with: "Shared with {to} by {from}". */
  recommendedTo: { to: string; by: string }[];
  /** Whether the person currently lets other employers see this proof through Second look. Event proofs only. */
  sharing: boolean;
  /** A reviewer reported the picture as possibly identifying; it was removed and the written answer stays. */
  pictureRemoved: boolean;
}

/**
 * A finished task from an earlier Espoo event, kept for the person's portfolio. The event is over, so it is a
 * fixed record: the words the company read (already blind), the named reviewer's points and written answer.
 */
export interface PastWork {
  id: string;
  /** The person's private key. Never leaves the server. */
  talentId: string;
  event: { name: string; date: string };
  companyName: string;
  taskTitle: string;
  format: TaskFormat;
  skills: Pick<Skill, "id" | "label">[];
  /** The answer as the company read it, with personal details already hidden. */
  answer: string;
  submittedAt: string;
  reviewer: string;
  decision: Exclude<DecisionKind, "hold">;
  /** The reviewer's points, one per skill, in the order of `skills`. */
  scores: SkillScore[];
  feedback: string;
}

/**
 * One finished task in the portfolio: the work, the people, their words and the reviewer's own points.
 * Never a rank or a place among other people.
 */
export interface PortfolioCard {
  /** The proof id for this event's work, the record id for an earlier event's. */
  id: string;
  /** Set for this event's work, which has its own page under /my-work. */
  proofId?: string;
  event: { name: string; date: string };
  /** Who posted the task. */
  companyName: string;
  taskTitle: string;
  format: TaskFormat;
  skills: Pick<Skill, "id" | "label">[];
  /** The owner sees their own words; a shared link shows the words the company read. */
  answer: string;
  submittedAt: string;
  /**
   * Each reviewer's written answer. `decision`, `total` and `scores` are left out of a shared link unless the
   * person shows them; the owner always sees them.
   */
  responses: {
    reviewer: string;
    companyName: string;
    feedback: string;
    decision?: "meet" | "pass";
    /** The reviewer's total out of 10. */
    total?: number;
    /** The reviewer's points per skill. */
    scores?: (SkillScore & { label: string })[];
  }[];
  /** Owner only: whether a shared link shows the decision and the score. */
  decisionShown?: boolean;
  /** Owner only: the link for this card alone, or null while it is private. */
  link?: string | null;
}

/** Plain facts about the person's own work. Counts only, never a score or a place in a list. */
export interface PortfolioFacts {
  tasks: number;
  events: number;
  /** Companies that wrote an answer. */
  companiesAnswered: number;
  /** "Meet" invitations received. */
  invitations: number;
}

/** The person's record of finished work across Espoo events, newest first. */
export interface Portfolio {
  facts: PortfolioFacts;
  /** Tasks per skill the person has shown work in. A count of tasks, never a level. */
  skills: { id: string; label: string; tasks: number }[];
  cards: PortfolioCard[];
  /** Owner only: the link for the whole portfolio, or null while it is private. */
  link?: string | null;
}

export interface ReviewQueue {
  company: Company;
  challenges: Challenge[];
  /** Proofs for this company's own challenges, oldest first. Order is arrival time, not quality. */
  proofs: BlindProof[];
  /** Proofs another employer passed on, where the challenge shares core skills. Oldest first. */
  secondLook: (BlindProof & { sharedSkills: string[] })[];
  /** Proofs another company recommended to this one, oldest first. Never the sender's scores. */
  recommended: (BlindProof & { recommendedBy: string })[];
  /**
   * `identity` appears only after the person accepts. It never carries the talent id.
   * `withdrawn`: the person turned Second look off after this company answered through it, and no meeting
   * was accepted. The decision and feedback stay; the proof is reduced to its label.
   */
  decided: { proof: BlindProof; decision: Decision; meeting?: Meeting; identity?: Pick<Talent, "name" | "contact">; withdrawn?: true }[];
}

/**
 * One employer's record for the city. The own-task counts add up: received = answered + owed.
 * Answers given to other employers' proofs through Second look are counted apart, so they never exceed the proofs.
 */
export interface EmployerRecord {
  company: Company;
  challengeLiveDaysBeforeEvent: number;
  /** Proofs sent to this company's own tasks. */
  proofsReceived: number;
  /** Of those, proofs this company answered in writing. */
  proofsAnswered: number;
  /** Of those, proofs still waiting for this company's answer. */
  proofsOwed: number;
  /** Written answers to other employers' proofs, given through Second look. */
  secondLookAnswered: number;
  /** Median hours from arrival to this company's answer, over its own-task proofs. */
  medianHoursToRespond: number | null;
  meetingsHeld: number;
}

export interface CityOverview {
  event: { name: string; date: string };
  totals: {
    challenges: number;
    proofs: number;
    /** Event proofs with at least one employer decision. A person who sent two answered proofs counts twice here. */
    proofsAnswered: number;
    /** Distinct people with at least one answered event proof. Counted from private keys on the server; only the number leaves. */
    peopleAnswered: number;
    /** Median hours from sending a proof to its first decision, or null before any answer. */
    medianHoursToFirstAnswer: number | null;
    humanDecisions: number;
    meetingsInvited: number;
    meetingsConfirmedByBoth: number;
    secondLookMeetings: number;
    /** Decisions in the log not made by a registered person. Counted over the log, not assumed. */
    automatedDecisions: number;
  };
  employers: EmployerRecord[];
  audit: AuditEvent[];
  insights: CityInsights;
}

/** Where one proof stands, for the city's flow picture. A proof label and a company, never a person. */
export type FlowState = "sent" | "answered" | "scored" | "invited" | "met";

/** What the city learns from the event. Counts of tasks, proofs and human decisions; nothing about a person. */
export interface CityInsights {
  /** Core skills asked for most, top 8 by tasks, then by label. */
  demandBySkill: { skillId: string; label: string; tasks: number; proofs: number }[];
  /** Only kinds that at least one task asks for, in PROOF_KINDS order. */
  byProofKind: { kind: ProofKind; tasks: number; proofs: number }[];
  /** Tasks shared by more than one employer: one piece of work, several readers. */
  pooled: { challengeId: string; title: string; companies: string[]; proofs: number }[];
  /**
   * Proofs at each step, each proof counted once: invited means at least one invitation, accepted at least one
   * meeting the person accepted (or held), met at least one meeting both sides confirmed.
   */
  funnel: { proofs: number; answered: number; invited: number; accepted: number; met: number };
  /** Meeting records by status, as activity: one proof invited by two employers counts twice here. */
  meetings: { invited: number; accepted: number; met: number; declined: number };
  /** Proofs at each step for the whole event, and per task. */
  impact: { event: ImpactCounts; tasks: TaskImpact[] };
  fairness: {
    /** Decisions in the log not made by a registered person. Counted over the log, not assumed. */
    automatedDecisions: number;
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

/**
 * Proofs at each step, each proof counted once: took (sent), scored (at least one human score), invited,
 * agreed (the person accepted a meeting), met (both confirmed), followUps (a follow-up agreed after the talk), hires.
 */
export interface ImpactCounts {
  took: number;
  scored: number;
  invited: number;
  agreed: number;
  met: number;
  followUps: number;
  hires: number;
}

export interface TaskImpact extends ImpactCounts {
  challengeId: string;
  title: string;
  companies: string[];
  /** The highest human total on this task, or null before any score. */
  topTotal: number | null;
  /** Scored proofs as a share of proofs sent, 0 to 1 (0 when none were sent). */
  scoredShare: number;
}

/** One scored proof as the city sees it: a label and a total, never a name or the work. */
export interface CityTopEntry {
  proofId: string;
  proofLabel: string;
  total: number;
  /** The person turned sharing on, so the city may offer this proof to another company. */
  canShare: boolean;
  /** Companies this proof was already shared with. */
  sharedWith: string[];
}

/** One task for the city: its counts and its leaderboard as labels and totals only. */
export interface CityTaskView extends TaskImpact {
  challenge: Challenge;
  top: CityTopEntry[];
}

/** A company that may receive a shared proof from a task: it has a task sharing at least 2 core skills. */
export interface ShareMatch {
  companyId: string;
  name: string;
  sharedSkills: string[];
}

/** Proofs of one task at the company's first steps, each counted once. */
export interface TaskCounts {
  took: number;
  scored: number;
  invited: number;
  agreed: number;
}

/** One proof on a task's leaderboard. Blind; identity only after the person accepted this company's meeting. */
export interface TopProof {
  proof: BlindProof;
  total: number;
  /** The reviewer's points in the task's skill order. */
  scores: SkillScore[];
  /** The scoring decision: reviewer, kind ("hold" until decided), feedback. */
  decision: Decision;
  meeting?: Meeting;
  identity?: Pick<Talent, "name" | "contact">;
}

/** The leaderboard for one task: scored proofs highest total first (ties by arrival), unscored ones oldest first. */
export interface TopProofs {
  challenge: Challenge;
  scored: TopProof[];
  waiting: BlindProof[];
  counts: TaskCounts;
}

/** One of a company's tasks for its home: the counts and the top total. */
export interface CompanyTaskSummary {
  challenge: Challenge;
  counts: TaskCounts;
  topTotal: number | null;
}

/** Where each core skill shows up in the work: sentences found by cue words. No model, no number. */
export interface RelatedPart {
  skillId: string;
  label: string;
  quotes: string[];
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
  /** Answers this task still takes; at 0 it accepts no new work. */
  placesLeft: number;
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
  tasks: {
    challenge: Challenge;
    proofsReceived: number;
    waiting: number;
    daysLive: number;
    places: number;
    placesLeft: number;
    /** Hours from this task going live to this company's first Meet decision on a proof for it, or null before one. */
    hoursToFirstInvitation: number | null;
    /** Proofs for this task this company scored. */
    scored: number;
    /** The highest human total on this task, or null before any score. */
    topTotal: number | null;
  }[];
  /** Challenges the city made for this company that it has not opened yet, with the proofs already sent. */
  unclaimed: { challenge: Challenge; proofs: number }[];
  /** An estimate: proofs waiting to be read, at about 4 minutes each. */
  readingMinutesOwed: number;
  /** The oldest five waiting proofs, in arrival order. */
  queuePreview: BlindProof[];
  secondLookWaiting: number;
  pipeline: { stage: PipelineStage; count: number }[];
  /**
   * Hours from this company's oldest task going live to its first Meet decision on any task, or null. It measures an
   * invitation, not a held meeting; kept while screens still read it. Per task: `tasks[].hoursToFirstInvitation`.
   */
  hoursToFirstMeeting: number | null;
  /** For each core skill this company asks for: event proofs handed in for any task with that skill. Counts only. */
  pool: { skillId: string; label: string; proofs: number }[];
  /** The whole event, the same numbers as the city totals. */
  /** Event totals, plus the hours an employer has to answer before a consented proof opens to Second look. */
  event: { proofs: number; proofsAnswered: number; medianHoursToFirstAnswer: number | null; responseWindowHours: number };
}

/** The caller's demo sandbox. Returned only to the visitor who owns it. */
export interface DemoSession {
  /** Share code of the caller's sandbox, for `?table=<code>`. Null outside a sandbox (the shared default store). */
  code: string | null;
  /** The demo person's private key in this sandbox, and her name. */
  persona: { talentId: string; name: string };
  stage: StoryStage;
}

/**
 * What `GET /api/demo/session` answers. A request without a sandbox of its own reads the shared event, which
 * belongs to nobody, so it gets no persona key: `persona` is null and `code` is null.
 */
export type DemoSessionReply = Omit<DemoSession, "persona"> & { persona: DemoSession["persona"] | null };

/** An invitation from the person hosting the booth table to the author of one practice proof. */
export type TableInviteStatus = "invited" | "accepted" | "declined";

export interface TableInvite {
  proofId: string;
  /** The person hosting the table, as they signed the invitation. */
  host: string;
  /** Two sentences to the person. Only the proof's author reads them. */
  message: string;
  status: TableInviteStatus;
  /** The first name the person chose to show. Stored only when they accept; never before, never on a decline. */
  shownName?: string;
  invitedAt: string;
}

/**
 * One row on the public table screen. No work text, no follow-ups and no count of hidden details:
 * the room sees that a proof arrived and what it was for, nothing a person wrote.
 */
export interface TableProof {
  proofId: string;
  label: string;
  taskTitle: string;
  proofKind: ProofKind;
  submittedAt: string;
  invite?: Pick<TableInvite, "status" | "host" | "shownName">;
}

/** The table's invitation as the proof's author reads it, with the host's own words. */
export interface MyTableInvite {
  invite?: Pick<TableInvite, "status" | "host" | "message">;
}
