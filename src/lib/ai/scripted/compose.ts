import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { SKILLS, toSkill, type SkillId } from "@/lib/skills/vocabulary";
import { genericRole } from "./generic-role";
import { matchRole } from "./match-role";
import { parseNeed } from "./parse-need";
import type { RoleTemplate, TaskTemplate } from "./role-template";
import { ROLES } from "./roles";

export const EVENT_MINUTES = 20;
export const TASTER_MINUTES = 2;

/** When a company lists many wishes, the card keeps four. Otherwise up to five. */
function skillLimit(wishCount: number): number {
  return wishCount >= 6 ? 4 : 5;
}

function chooseSkills(role: RoleTemplate, wished: SkillId[], wishCount: number): { kept: SkillId[]; dropped: SkillId[] } {
  const limit = skillLimit(wishCount);
  const kept = wished.slice(0, limit);
  const dropped = wished.slice(limit);
  for (const id of role.skills) {
    if (kept.length >= 3) break;
    if (!kept.includes(id)) kept.push(id);
  }
  return { kept, dropped };
}

function toDraft(role: RoleTemplate, task: TaskTemplate, skills: SkillId[], extra: Pick<ChallengeDraft, "need" | "setAside" | "kind" | "minutes">): ChallengeDraft {
  return {
    title: task.title,
    need: extra.need,
    coreSkills: skills.map((id) => toSkill(id, role.why?.[id])),
    setAside: extra.setAside,
    format: task.format,
    minutes: extra.minutes,
    brief: task.brief,
    material: { ...task.material },
    deliverable: task.deliverable,
    reviewGuide: skills.map((id) => ({ skillId: id, lookFor: role.lookFor?.[id] ?? SKILLS[id].lookFor })),
    aiAllowed: true,
    kind: extra.kind,
  };
}

export function draftFromNeed(need: string): ChallengeDraft {
  const role = matchRole(need) ?? genericRole(need);
  const parsed = parseNeed(need, role.keywords);
  const { kept, dropped } = chooseSkills(role, parsed.wishedSkills, parsed.wishes.length);

  const setAside = [
    ...dropped.map((id) => `${SKILLS[id].label}: not core for this task`),
    ...parsed.otherWishes,
  ];
  if (parsed.notUsed.length > 0) setAside.push(`Not used: ${parsed.notUsed.join(", ")} (not skills)`);

  return toDraft(role, role.challenge, kept, {
    need: parsed.cleanedNeed,
    setAside,
    kind: "event",
    minutes: EVENT_MINUTES,
  });
}

export function tasterFor(dreamJob: string): ChallengeDraft {
  const role = matchRole(dreamJob) ?? genericRole(dreamJob);
  return toDraft(role, role.taster, role.skills.slice(0, 3), {
    need: dreamJob.trim().slice(0, 120),
    setAside: [],
    kind: "taster",
    minutes: TASTER_MINUTES,
  });
}

type ChallengeRef = Pick<Challenge, "kind" | "material" | "need" | "title">;

function taskOf(role: RoleTemplate, challenge: ChallengeRef): TaskTemplate {
  return challenge.kind === "taster" ? role.taster : role.challenge;
}

/** Finds the role a challenge was built from, so its planted flaws and constraints can be used. */
export function roleFor(challenge: ChallengeRef): RoleTemplate {
  const known = ROLES.find((role) => {
    const task = taskOf(role, challenge);
    return task.title === challenge.title && task.material.title === challenge.material?.title;
  });
  return known ?? genericRole(challenge.need);
}

/** The planted flaws for a challenge, or none when it was written by hand or by a model. */
export function flawsFor(challenge: ChallengeRef) {
  const role = roleFor(challenge);
  const task = taskOf(role, challenge);
  return task.title === challenge.title ? task.flaws : [];
}
