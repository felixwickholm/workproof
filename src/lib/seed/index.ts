import { draftFromNeed } from "@/lib/ai/scripted/compose";
import { DEFAULT_PLACES } from "@/lib/domain/places";
import type { Challenge, StoryStage } from "@/lib/domain/types";
import { DRAFT_ACTION } from "@/lib/service/ai-work";
import type { StoreData } from "@/lib/store/types";
import { omit } from "@/lib/util/object";
import { ON_BEHALF, SEED_CHALLENGES, type SeedChallengeKey } from "./challenges";
import { COMPANIES, companyName, REVIEWERS } from "./companies";
import { olenaHistory } from "./history";
import { PEOPLE, PERSONA } from "./people";
import { AUTOMATION_PROOFS } from "./proofs/automation";
import { CHIP_PROOFS } from "./proofs/chip";
import { DATA_PROOFS } from "./proofs/data";
import { ENGINEERING_PROOFS } from "./proofs/engineering";
import { FINANCE_PROOFS } from "./proofs/finance";
import { LEGAL_AND_SALES_PROOFS } from "./proofs/legal-and-sales";
import { MARKETING_PROOFS } from "./proofs/marketing";
import { PRODUCT_AND_DESIGN_PROOFS } from "./proofs/product-and-design";
import { RESEARCH_PROOFS } from "./proofs/research";
import { SEED_RECOMMENDATIONS } from "./recommendations";
import {
  OLENA_ACCEPTED_HOURS_AGO,
  OLENA_EARLIER,
  OLENA_STORY,
  STORY_DECISION,
  STORY_MET_HOURS_AGO,
  STORY_PROOF_ID,
  STORY_REVIEWER,
  stageReached,
} from "./story";
import type { SeedProof } from "./types";
import { seedWriter } from "./writer";

/** Everyone else's work at the event. The same at every story stage. */
export const WORLD_PROOFS: readonly SeedProof[] = [
  ...AUTOMATION_PROOFS,
  ...DATA_PROOFS,
  ...FINANCE_PROOFS,
  ...LEGAL_AND_SALES_PROOFS,
  ...ENGINEERING_PROOFS,
  ...CHIP_PROOFS,
  ...MARKETING_PROOFS,
  ...PRODUCT_AND_DESIGN_PROOFS,
  ...RESEARCH_PROOFS,
];

/** The proofs that exist at a story stage, oldest first, the way they arrived. */
export function proofsAt(stage: StoryStage): SeedProof[] {
  const story = stageReached(stage, "sent") ? [OLENA_STORY] : [];
  return [...WORLD_PROOFS, ...OLENA_EARLIER, ...story].sort((a, b) => b.hoursAgo - a.hoursAgo);
}

function publishChallenges(write: ReturnType<typeof seedWriter>, data: StoreData): Map<SeedChallengeKey, Challenge> {
  const byKey = new Map<SeedChallengeKey, Challenge>();
  for (const seed of SEED_CHALLENGES) {
    const draft = omit(draftFromNeed(seed.need), ["note"]);
    const onBehalf = seed.key === ON_BEHALF.key ? { by: ON_BEHALF.by, adUrl: ON_BEHALF.adUrl } : undefined;
    const approvedBy = onBehalf?.by ?? REVIEWERS[seed.companyIds[0]];
    const hoursAgo = seed.daysBeforeEvent * 24;
    const challenge: Challenge = {
      ...draft,
      id: `ch-${seed.key}`,
      places: "places" in seed ? seed.places : DEFAULT_PLACES,
      companyIds: [...seed.companyIds],
      approvedBy,
      createdAt: write.at(hoursAgo),
      ...(onBehalf ? { onBehalf } : {}),
    };
    byKey.set(seed.key, challenge);
    data.challenges.push(challenge);
    const owners = seed.companyIds.map(companyName).join(" and ");
    write.log(hoursAgo + 1 / 3, {
      actor: "ai",
      by: "Task drafter",
      action: DRAFT_ACTION,
      detail: `"${draft.title}": ${draft.coreSkills.length} core skills kept, ${draft.setAside.length} wishes set aside. Waiting for a human to approve.`,
    });
    write.log(hoursAgo, {
      actor: "human",
      by: approvedBy,
      action: onBehalf ? "Published a challenge for a company" : "Approved a Problem Card",
      detail: onBehalf
        ? `The City of Espoo published "${draft.title}" for ${owners} from its job ad. ${owners} has not opened it yet.`
        : `${owners} published "${draft.title}".`,
    });
  }
  return byKey;
}

/**
 * A synthetic event, "Espoo Talent Day", built relative to `now` so the demo always looks current.
 * All companies, people and work are invented. Content runs through the same scripted designer,
 * blind layer, scores and decision shape as live data. `stage` sets how far Olena's story has gone.
 */
export function buildSeed(now: Date, stage: StoryStage = "invited"): StoreData {
  const data: StoreData = {
    version: 1,
    event: { name: "Espoo Talent Day", date: now.toISOString().slice(0, 10), responseWindowHours: 48 },
    companies: COMPANIES.map((c) => ({ ...c, reviewers: [...c.reviewers] })),
    challenges: [],
    talents: [],
    submissions: [],
    proofs: [],
    decisions: [],
    meetings: [],
    audit: [],
    recommendations: [],
    demo: { personaTalentId: "", personaName: PEOPLE[PERSONA].name, stage },
  };
  const write = seedWriter(now, data);
  const challenges = publishChallenges(write, data);

  const proofs = proofsAt(stage);
  for (const seed of proofs) write.addProof(seed, challenges.get(seed.challenge) as Challenge);

  for (const seed of proofs) {
    if (!seed.decision) continue;
    const { hoursToReply, ...decision } = seed.decision;
    write.addDecision({ proofId: seed.id, ...decision, hoursAgo: seed.hoursAgo - hoursToReply });
  }
  for (const share of SEED_RECOMMENDATIONS) write.recommend(share.proofId, share.fromCompanyId, share.toCompanyId, share.hoursAgo);

  if (stageReached(stage, "invited")) {
    const { hoursAgo, ...decision } = STORY_DECISION;
    write.addDecision({ proofId: STORY_PROOF_ID, ...decision, hoursAgo }, STORY_REVIEWER);
  }
  if (stageReached(stage, "met")) {
    write.acceptMeeting(STORY_PROOF_ID, STORY_DECISION.companyId, OLENA_ACCEPTED_HOURS_AGO);
    write.confirmMet(STORY_PROOF_ID, STORY_DECISION.companyId, STORY_MET_HOURS_AGO, { followUpAgreed: true });
  }

  data.demo.personaTalentId = write.talentId(PERSONA);
  data.history = olenaHistory(now, data.demo.personaTalentId);
  data.audit.sort((a, b) => a.at.localeCompare(b.at));
  return data;
}
