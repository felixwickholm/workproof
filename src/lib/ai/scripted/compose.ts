import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { neutralSetAside, NOT_USED_PREFIX, talentNeed } from "@/lib/guard/check-draft";
import { isSkillId, SKILLS, toSkill, type SkillId } from "@/lib/skills/vocabulary";
import { GENERIC_NOTE, genericRole, nearestNote, NO_EXACT_TASK_NOTE, NO_SKILLS_NOTE } from "./generic-role";
import { matchRole } from "./match-role";
import { parseNeed, type ParsedNeed } from "./parse-need";
import type { RoleTemplate, TaskTemplate } from "./role-template";
import { ROLES } from "./roles";

const EVENT_MINUTES = 20;
const TASTER_MINUTES = 2;

/** The set-aside reason for a skill beyond what one task can test. */
const MORE_THAN_FIVE = "more than five, a task tests 3 to 5 core skills";

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
    proofKind: task.proofKind,
    minutes: extra.minutes,
    brief: task.brief,
    material: { ...task.material },
    deliverable: task.deliverable,
    reviewGuide: skills.map((id) => ({ skillId: id, lookFor: role.lookFor?.[id] ?? SKILLS[id].lookFor })),
    aiAllowed: true,
    kind: extra.kind,
  };
}

/**
 * For a need that names no role, the library role whose skills cover most of the skills the
 * sentence describes. Ties go to the role that has the first described skill, then to library order.
 */
function roleForSkills(wished: SkillId[]): RoleTemplate | undefined {
  let chosen: RoleTemplate | undefined;
  let best = 0;
  for (const role of ROLES) {
    const shared = wished.filter((id) => role.skills.includes(id)).length;
    const score = shared * 2 + (wished[0] && role.skills.includes(wished[0]) ? 1 : 0);
    if (shared >= 2 && score > best) {
      chosen = role;
      best = score;
    }
  }
  return chosen;
}

/** The role a need is drafted for: the library role it names, else the nearest by the skills it describes, else the generic one. */
function roleForNeed(need: string): { role: RoleTemplate; nearest: boolean; generic: boolean } {
  const named = matchRole(need);
  const nearest = named ? undefined : roleForSkills(parseNeed(need).wishedSkills);
  const role = named ?? nearest ?? genericRole();
  return { role, nearest: nearest !== undefined, generic: role.id === "generic" };
}

/** The need read against its role. The generic role has no skills of its own to prefer. */
export function parseForRole(need: string): ParsedNeed {
  const { role, generic } = roleForNeed(need);
  return parseNeed(need, generic ? undefined : role);
}

export function draftFromNeed(need: string): ChallengeDraft {
  const { role, nearest, generic } = roleForNeed(need);
  const parsed = parseNeed(need, generic ? undefined : role);
  const { kept, dropped } = chooseSkills(role, parsed.wishedSkills, parsed.wishes.length);

  const otherWishes = neutralSetAside(parsed.otherWishes);
  const setAside = [
    ...dropped.map((id) => `${SKILLS[id].label}: ${MORE_THAN_FIVE}`),
    ...otherWishes,
  ];
  // A wish that judges a person is left out of the card, and counted with the protected ones.
  const notUsed = [...parsed.notUsed, ...(otherWishes.length < parsed.otherWishes.length ? ["wishes about the person"] : [])];
  if (notUsed.length > 0) setAside.push(`${NOT_USED_PREFIX} ${notUsed.join(", ")} (not skills)`);

  const draft = toDraft(role, role.challenge, kept, {
    need: talentNeed(generic ? undefined : role.title, kept),
    setAside,
    kind: "event",
    minutes: EVENT_MINUTES,
  });
  // Languages and licences are facts about the job: never skills, never set aside.
  if (parsed.facts.length > 0) draft.facts = parsed.facts;
  if (generic) return { ...draft, note: parsed.wishedSkills.length === 0 ? NO_SKILLS_NOTE : GENERIC_NOTE };
  return nearest ? { ...draft, note: nearestNote(role.title) } : draft;
}

export function tasterFor(dreamJob: string): ChallengeDraft {
  const role = matchRole(dreamJob) ?? genericRole();
  const generic = role.id === "generic";
  const skills = role.skills.slice(0, 3);
  const draft = toDraft(role, role.taster, skills, {
    need: talentNeed(generic ? undefined : role.title, skills),
    setAside: [],
    kind: "taster",
    minutes: TASTER_MINUTES,
  });
  return generic ? { ...draft, note: NO_EXACT_TASK_NOTE } : draft;
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
  return known ?? genericRole();
}

/**
 * The talent-visible need for a draft about to be published, rebuilt on the server from the
 * library role (when the card still matches one) and the core skills. Whatever need the request carries is ignored.
 */
export function publishedNeed(draft: ChallengeDraft): string {
  const role = roleFor(draft);
  const skills = draft.coreSkills.map((s) => s.id).filter(isSkillId);
  return talentNeed(role.id === "generic" ? undefined : role.title, skills);
}

/** The planted flaws for a challenge, or none when it was written by hand or by a model. */
export function flawsFor(challenge: ChallengeRef) {
  const role = roleFor(challenge);
  const task = taskOf(role, challenge);
  return task.title === challenge.title ? task.flaws : [];
}
