import { draftFromNeed } from "@/lib/ai/scripted/compose";
import { DEFAULT_PLACES } from "@/lib/domain/places";
import type { Challenge, StoryStage } from "@/lib/domain/types";
import { DRAFT_ACTION } from "@/lib/service/ai-work";
import type { StoreData } from "@/lib/store/types";
import { omit } from "@/lib/util/object";
import { SEED_CHALLENGES, type SeedChallengeKey } from "./challenges";
import { COMPANIES, companyName, REVIEWERS } from "./companies";
import { PEOPLE, PERSONA } from "./people";
import { CALL_AND_DESIGN_PROOFS } from "./proofs/calls-and-design";
import { CARE_PROOFS } from "./proofs/care";
import { ENGINEERING_PROOFS } from "./proofs/engineering";
import { FOOD_PROOFS } from "./proofs/food";
import { LAB_PROOFS } from "./proofs/laboratory";
import { MODEL_AND_DATA_PROOFS } from "./proofs/model-and-data";
import { SOFTWARE_PROOFS } from "./proofs/software";
import { SECOND_LOOK_DECISIONS } from "./second-look";
import {
  ANNA_DECISION,
  OLENA_ACCEPTED_HOURS_AGO,
  OLENA_EARLIER,
  OLENA_STORY,
  OTSO_SECOND_LOOK,
  STORY_PROOF_ID,
  stageReached,
} from "./story";
import type { SeedProof } from "./types";
import { seedWriter } from "./writer";

/** Everyone else's work at the event. The same at every story stage. */
export const WORLD_PROOFS: readonly SeedProof[] = [
  ...FOOD_PROOFS,
  ...ENGINEERING_PROOFS,
  ...CALL_AND_DESIGN_PROOFS,
  ...LAB_PROOFS,
  ...CARE_PROOFS,
  ...MODEL_AND_DATA_PROOFS,
  ...SOFTWARE_PROOFS,
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
    const approvedBy = REVIEWERS[seed.companyIds[0]];
    const hoursAgo = seed.daysBeforeEvent * 24;
    const challenge: Challenge = {
      ...draft,
      id: `ch-${seed.key}`,
      places: "places" in seed ? seed.places : DEFAULT_PLACES,
      companyIds: [...seed.companyIds],
      approvedBy,
      createdAt: write.at(hoursAgo),
    };
    byKey.set(seed.key, challenge);
    data.challenges.push(challenge);
    write.log(hoursAgo + 1 / 3, {
      actor: "ai",
      by: "Task drafter",
      action: DRAFT_ACTION,
      detail: `"${draft.title}": ${draft.coreSkills.length} core skills kept, ${draft.setAside.length} wishes set aside. Waiting for a human to approve.`,
    });
    write.log(hoursAgo, {
      actor: "human",
      by: approvedBy,
      action: "Approved a Problem Card",
      detail: `${seed.companyIds.map(companyName).join(" and ")} published "${draft.title}".`,
    });
  }
  return byKey;
}

/**
 * A synthetic event, "Espoo Talent Day", built relative to `now` so the demo always looks current.
 * All companies, people and work are invented. Content runs through the same scripted designer,
 * blind layer and decision shape as live data. `stage` sets how far Olena's story has gone.
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
    demo: { personaTalentId: "", personaName: PEOPLE[PERSONA].name, stage },
  };
  const write = seedWriter(now, data);
  const challenges = publishChallenges(write, data);

  const proofs = proofsAt(stage);
  for (const seed of proofs) write.addProof(seed, challenges.get(seed.challenge) as Challenge);

  for (const seed of proofs) {
    if (!seed.decision) continue;
    const { companyId, kind, feedback, hoursToReply, meeting } = seed.decision;
    const hoursAgo = seed.hoursAgo - hoursToReply;
    write.addDecision({ proofId: seed.id, companyId, kind, feedback, hoursAgo, meeting });
    if (kind === "pass" && seed.shareWithSimilar) write.logSecondLookOpened(seed.id, hoursAgo);
  }
  for (const look of SECOND_LOOK_DECISIONS) write.addDecision(look, true);

  if (stageReached(stage, "invited")) write.addDecision({ proofId: STORY_PROOF_ID, ...ANNA_DECISION });
  if (stageReached(stage, "met")) {
    write.acceptMeeting(STORY_PROOF_ID, ANNA_DECISION.companyId, OLENA_ACCEPTED_HOURS_AGO);
    write.addDecision(OTSO_SECOND_LOOK, true);
  }

  data.demo.personaTalentId = write.talentId(PERSONA);
  data.audit.sort((a, b) => a.at.localeCompare(b.at));
  return data;
}
