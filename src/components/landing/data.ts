import type { FlowMapCompany, FlowMapFlow } from "@/components/espoo-map";
import type { Attachment, BlindProof, CityOverview, Company, EmployerHome, ExplainAnswer, ProofKind, SeekerHome, SeekerInvitation, SeekerTask } from "@/lib/domain/types";
import { STORY_PROOF_ID } from "@/lib/seed/story";
import type { StoreData } from "@/lib/store/types";
import { buildCityOverview } from "@/lib/service/views/city";
import { buildEmployerHome } from "@/lib/service/views/employer";
import { buildSeekerHome } from "@/lib/service/views/seeker";
import type { HeroCounts } from "./counts";

/** The company whose reviewer reads Olena's story proof. */
const STORY_COMPANY = "co-kaari";

/**
 * The seven proofs the "Proof for every profession" section shows, one per kind of proof, in the order
 * the mosaic places them. Ids from the seed; each is shown as the company reads it.
 */
export const MOSAIC = [
  { slot: "photo", proofId: "proof_beam_01" },
  { slot: "plan", proofId: "proof_lab_01" },
  { slot: "design", proofId: "proof_design_01" },
  { slot: "video", proofId: "proof_board_01" },
  { slot: "letter", proofId: "proof_care_05" },
  { slot: "voice", proofId: "proof_call_01" },
  { slot: "code", proofId: "proof_data_01" },
] as const;

export type MosaicSlot = (typeof MOSAIC)[number]["slot"];

/** One proof in the mosaic: the work as the company reads it, with what it is and who asked. */
export interface WorkFragment {
  slot: MosaicSlot;
  label: string;
  kind: ProofKind;
  companyName: string;
  minutes: number;
  taskTitle: string;
  /** The blind text, which may hold `[hidden]` tokens. */
  work: string;
  attachment?: Attachment;
  spoken: boolean;
}

/** Olena's story proof: what she wrote, what the company reads, and the answer she got. */
export interface StoryProof {
  label: string;
  original: string;
  blind: string;
  hiddenCount: number;
  reviewer: string;
  companyName: string;
  feedback: string;
}

export interface LandingData {
  eventName: string;
  counts: HeroCounts;
  map: { companies: FlowMapCompany[]; flows: FlowMapFlow[] };
  story: StoryProof;
  fragments: WorkFragment[];
  seeker: { firstName: string; fact: string; counts: SeekerHome["counts"]; invitation: SeekerInvitation | null; tasks: SeekerTask[]; companies: Company[] };
  /** `opener`: the story proof's follow-up answers, which the meeting with its author starts from. */
  employer: { greeting: string; queue: BlindProof[]; pipeline: EmployerHome["pipeline"]; opener: ExplainAnswer[] };
  city: { greeting: string; totals: CityOverview["totals"]; fairness: CityOverview["insights"]["fairness"] };
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
  const decision = data.decisions.find((d) => d.proofId === STORY_PROOF_ID && d.companyId === STORY_COMPANY);
  const company = data.companies.find((c) => c.id === STORY_COMPANY);
  if (!proof || !submission || !decision || !company) throw new Error("The demo event has no story proof with an answer.");
  return {
    label: proof.label,
    original: submission.answer,
    blind: proof.work,
    hiddenCount: proof.hiddenCount,
    reviewer: decision.reviewer,
    companyName: company.name,
    feedback: decision.feedback,
  };
}

function fragmentsOf(data: StoreData): WorkFragment[] {
  return MOSAIC.flatMap(({ slot, proofId }) => {
    const proof = data.proofs.find((p) => p.proofId === proofId);
    const challenge = proof && data.challenges.find((c) => c.id === proof.challengeId);
    const company = challenge && data.companies.find((c) => c.id === challenge.companyIds[0]);
    if (!proof || !challenge || !company) return [];
    return [
      {
        slot,
        label: proof.label,
        kind: proof.proofKind,
        companyName: company.name,
        minutes: challenge.minutes,
        taskTitle: challenge.title,
        work: proof.work,
        ...(proof.attachment ? { attachment: proof.attachment } : {}),
        spoken: Boolean(proof.spoken),
      },
    ];
  });
}

/**
 * Everything the landing page shows, read from one demo event with the same view builders the
 * app uses, so every number and fragment on it is true to the product. Pure: the caller builds
 * the event (and caches the result).
 */
export function buildLandingData(data: StoreData, now: Date): LandingData {
  const city = buildCityOverview(data);
  const seeker = buildSeekerHome(data, data.demo.personaTalentId, now);
  const employer = buildEmployerHome(data, STORY_COMPANY, now);
  const { totals } = city;
  return {
    eventName: data.event.name,
    counts: {
      proofs: totals.proofs,
      writtenAnswers: totals.proofsAnswered,
      invitations: totals.meetingsInvited,
      automatedDecisions: totals.automatedDecisions,
    },
    map: mapOf(data.companies, city.insights.flows),
    story: storyOf(data),
    fragments: fragmentsOf(data),
    seeker: {
      firstName: seeker.greeting.firstName ?? data.demo.personaName.split(" ")[0],
      fact: seeker.greeting.fact,
      counts: seeker.counts,
      invitation: seeker.invitations[0] ?? null,
      tasks: seeker.tasks.slice(0, 2),
      companies: data.companies,
    },
    employer: {
      greeting: `${employer.company.name}. ${employer.greeting.fact}`,
      queue: employer.queuePreview.slice(0, 3),
      pipeline: employer.pipeline,
      opener: data.proofs.find((p) => p.proofId === STORY_PROOF_ID)?.explain ?? [],
    },
    city: { greeting: `${data.event.name}. ${totals.proofsAnswered} people got a written answer.`, totals, fairness: city.insights.fairness },
  };
}
