import type { FlowMapCompany, FlowMapFlow } from "@/components/espoo-map";
import type { CityOverview, Company, ImpactCounts, SeekerInvitation } from "@/lib/domain/types";
import { STORY_PROOF_ID } from "@/lib/seed/story";
import type { StoreData } from "@/lib/store/types";
import { buildCityOverview } from "@/lib/service/views/city";
import { buildSeekerHome } from "@/lib/service/views/seeker";
import type { HeroCounts } from "./counts";

/** One core skill of the story task, with the reviewer's points when the decision carries them. */
export interface StorySkill {
  label: string;
  /** 1 to 5 from the named reviewer, or null for a decision recorded before scores existed. */
  points: number | null;
}

/** The story persona's proof: what she wrote, what the company reads, how it was scored, and the answer she got. */
export interface StoryProof {
  /** The demo person's first name, from the seed. */
  personFirstName: string;
  label: string;
  original: string;
  blind: string;
  hiddenCount: number;
  reviewer: string;
  companyName: string;
  feedback: string;
  taskTitle: string;
  minutes: number;
  /** Who at the company approved the drafted challenge. */
  approvedBy: string | null;
  /** Her spoken thinking as the reviewer reads it: the think-aloud transcript, or a spoken follow-up answer. */
  thinking: string | null;
  skills: StorySkill[];
  /** Average points × 2, out of 10, when the decision carries scores. */
  total: number | null;
}

export interface LandingData {
  eventName: string;
  counts: HeroCounts;
  /** Proofs at each step of the event, each proof counted once. */
  impact: ImpactCounts;
  map: { companies: FlowMapCompany[]; flows: FlowMapFlow[] };
  story: StoryProof;
  invitation: SeekerInvitation | null;
}

function mapOf(companies: Company[], flows: CityOverview["insights"]["flows"]): LandingData["map"] {
  return {
    companies: companies.map(({ id, name, sector, district }) => ({ id, name, sector, district })),
    flows: flows.map(({ proofLabel, companyId, state }) => ({ proofLabel, companyId, state })),
  };
}

function storyOf(data: StoreData): StoryProof {
  const proof = data.proofs.find((p) => p.proofId === STORY_PROOF_ID);
  const submission = data.submissions.find((s) => s.id === STORY_PROOF_ID);
  // The company that asked to meet her: read from the seed, so the story can change without this file.
  const decision = data.decisions.find((d) => d.proofId === STORY_PROOF_ID && d.decision === "meet");
  const company = decision && data.companies.find((c) => c.id === decision.companyId);
  const challenge = proof && data.challenges.find((c) => c.id === proof.challengeId);
  if (!proof || !submission || !decision || !company || !challenge) throw new Error("The demo event has no story proof with an answer.");
  const points = new Map((decision.scores ?? []).map((s) => [s.skillId, s.points]));
  return {
    personFirstName: data.demo.personaName.split(" ")[0] ?? data.demo.personaName,
    label: proof.label,
    original: submission.answer,
    blind: proof.work,
    hiddenCount: proof.hiddenCount,
    reviewer: decision.reviewer,
    companyName: company.name,
    feedback: decision.feedback,
    taskTitle: challenge.title,
    minutes: challenge.minutes,
    approvedBy: challenge.approvedBy ?? null,
    thinking: proof.thinkAloud?.transcript ?? proof.explain.find((e) => e.spoken)?.answer ?? proof.explain[0]?.answer ?? null,
    skills: challenge.coreSkills.map((s) => ({ label: s.label, points: points.get(s.id) ?? null })),
    total: decision.total ?? null,
  };
}

/**
 * The event's steps from the city view. Older city views carry only the funnel, so the scored and
 * follow-up steps are then counted from the records here: the same rule, each proof once.
 */
function impactOf(data: StoreData, insights: CityOverview["insights"]): ImpactCounts {
  const counted: Partial<CityOverview["insights"]> = insights;
  if (counted.impact) return counted.impact.event;
  const eventProofs = new Set(data.proofs.map((p) => p.proofId));
  const proofsWhere = (ids: string[]) => new Set(ids.filter((id) => eventProofs.has(id))).size;
  const { funnel } = insights;
  return {
    took: funnel.proofs,
    scored: proofsWhere(data.decisions.filter((d) => d.scores?.length).map((d) => d.proofId)),
    invited: funnel.invited,
    agreed: funnel.accepted,
    met: funnel.met,
    followUps: proofsWhere(data.meetings.filter((m) => m.followUpAgreed).map((m) => m.proofId)),
    hires: proofsWhere(data.meetings.filter((m) => m.hired).map((m) => m.proofId)),
  };
}

/**
 * Everything the landing page and /how-it-works show, read from one demo event with the same view
 * builders the app uses, so every number and fragment on them is true to the product. Pure: the
 * caller builds the event (and caches the result).
 */
export function buildLandingData(data: StoreData, now: Date): LandingData {
  const city = buildCityOverview(data);
  const seeker = buildSeekerHome(data, data.demo.personaTalentId, now);
  const impact = impactOf(data, city.insights);
  return {
    eventName: data.event.name,
    counts: {
      took: impact.took,
      invited: impact.invited,
      met: impact.met,
      automatedDecisions: city.totals.automatedDecisions,
    },
    impact,
    map: mapOf(data.companies, city.insights.flows),
    story: storyOf(data),
    invitation: seeker.invitations[0] ?? null,
  };
}
