import { draftFromNeed, roleFor } from "@/lib/ai/scripted/compose";
import { talentNeed } from "@/lib/guard/check-draft";
import { SKILLS, toSkill } from "@/lib/skills/vocabulary";
import { DEFAULT_PLACES } from "@/lib/domain/places";
import type { Challenge, ChallengeDraft, StoryStage } from "@/lib/domain/types";
import { DRAFT_ACTION } from "@/lib/service/ai-work";
import type { StoreData } from "@/lib/store/types";
import { omit } from "@/lib/util/object";
import { ON_BEHALF, SEED_CHALLENGES, type SeedChallengeKey } from "./challenges";
import { avatarOfName } from "./avatars";
import { COMPANIES, companyName, REVIEWERS } from "./companies";
import type { SeedTask } from "./extra-challenges";
import { mikkoHistory } from "./history";
import { PEOPLE, PERSONA } from "./people";
import { AUTOMATION_PROOFS } from "./proofs/automation";
import { CHIP_PROOFS } from "./proofs/chip";
import { DATA_PROOFS } from "./proofs/data";
import { ENGINEERING_PROOFS } from "./proofs/engineering";
import { EXTRA_PROOFS } from "./proofs/extra";
import { FINANCE_PROOFS } from "./proofs/finance";
import { LEGAL_AND_SALES_PROOFS } from "./proofs/legal-and-sales";
import { MARKETING_PROOFS } from "./proofs/marketing";
import { PRODUCT_AND_DESIGN_PROOFS } from "./proofs/product-and-design";
import { RESEARCH_PROOFS } from "./proofs/research";
import { SEED_ROLES } from "./roles";
import { SEED_RECOMMENDATIONS } from "./recommendations";
import {
  MIKKO_ACCEPTED_HOURS_AGO,
  MIKKO_EARLIER,
  MIKKO_STORY,
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
  ...EXTRA_PROOFS,
];

/** The proofs that exist at a story stage, oldest first, the way they arrived. */
export function proofsAt(stage: StoryStage): SeedProof[] {
  const story = stageReached(stage, "sent") ? [MIKKO_STORY] : [];
  return [...WORLD_PROOFS, ...MIKKO_EARLIER, ...story].sort((a, b) => b.hoursAgo - a.hoursAgo);
}

/**
 * A task the company wrote out in full: its own title, situation and material, with the library role from
 * `need` kept for the follow-up questions and the reviewer notes. Nothing a company wishes about a person is in it.
 */
function withTask(draft: ChallengeDraft, task: SeedTask): ChallengeDraft {
  const role = roleFor(draft);
  const skills = [...task.skills];
  return {
    ...omit(draft, ["options"]),
    title: task.title,
    need: talentNeed(role.title, skills),
    coreSkills: skills.map((id) => toSkill(id, role.why?.[id])),
    setAside: [],
    format: task.format,
    proofKind: task.proofKind,
    minutes: task.minutes,
    brief: task.brief,
    material: { ...task.material },
    deliverable: task.deliverable,
    reviewGuide: skills.map((id) => ({ skillId: id, lookFor: role.lookFor?.[id] ?? SKILLS[id].lookFor })),
    ...(task.options ? { options: [{ ...task.options[0] }, { ...task.options[1] }] } : {}),
  };
}

function publishChallenges(write: ReturnType<typeof seedWriter>, data: StoreData): Map<SeedChallengeKey, Challenge> {
  const byKey = new Map<SeedChallengeKey, Challenge>();
  for (const seed of SEED_CHALLENGES) {
    const draft = "task" in seed ? withTask(omit(draftFromNeed(seed.need), ["note"]), seed.task) : omit(draftFromNeed(seed.need), ["note"]);
    const onBehalf = seed.key === ON_BEHALF.key ? { by: ON_BEHALF.by, adUrl: ON_BEHALF.adUrl } : undefined;
    const approvedBy = onBehalf?.by ?? REVIEWERS[seed.companyIds[0]];
    const hoursAgo = seed.daysBeforeEvent * 24;
    const challenge: Challenge = {
      ...draft,
      id: `ch-${seed.key}`,
      places: "places" in seed ? seed.places : DEFAULT_PLACES,
      companyIds: [...seed.companyIds],
      roles: [...SEED_ROLES[seed.key]],
      approvedBy,
      createdAt: write.at(hoursAgo),
      publishedAt: write.at(hoursAgo),
      image: `/challenges/ch-${seed.key}.webp`,
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
 * blind layer, scores and decision shape as live data. `stage` sets how far Mikko's story has gone.
 */
export function buildSeed(now: Date, stage: StoryStage = "invited"): StoreData {
  const data: StoreData = {
    version: 1,
    event: { name: "Espoo Talent Day", date: now.toISOString().slice(0, 10), responseWindowHours: 48 },
    companies: COMPANIES.map((c) => ({ ...c, reviewers: [...c.reviewers], reviewerAvatars: Object.fromEntries(c.reviewers.map((name) => [name, avatarOfName(name)])) })),
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
    write.acceptMeeting(STORY_PROOF_ID, STORY_DECISION.companyId, MIKKO_ACCEPTED_HOURS_AGO);
    write.confirmMet(STORY_PROOF_ID, STORY_DECISION.companyId, STORY_MET_HOURS_AGO, { followUpAgreed: true });
  }

  data.demo.personaTalentId = write.talentId(PERSONA);
  data.history = mikkoHistory(now, data.demo.personaTalentId);
  data.audit.sort((a, b) => a.at.localeCompare(b.at));
  return data;
}
