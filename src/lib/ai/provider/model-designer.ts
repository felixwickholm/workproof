import type { z } from "zod";
import type { ChallengeDraft, ChoiceOption } from "@/lib/domain/types";
import { isNeutral, neutralSetAside, NOT_USED_PREFIX, talentNeed } from "@/lib/guard/check-draft";
import { SKILLS, toSkill, type SkillId } from "@/lib/skills/vocabulary";
import { draftFromNeed, tasterFor } from "../scripted/compose";
import { matchRole } from "../scripted/match-role";
import { parseNeed } from "../scripted/parse-need";
import type { TaskDesigner } from "../task-designer";
import { FOLLOW_UP_JSON_SCHEMA, followUpSchema, parseModelJson, TASK_JSON_SCHEMA, taskSchema, type JsonSchema, type ModelTask } from "./output";
import { draftPrompt, followUpPrompt, SYSTEM, tasterPrompt } from "./prompts";

export interface ModelRequest {
  system: string;
  prompt: string;
  schema: JsonSchema;
}

/** Sends one request to a model API and returns the text of its reply. Each provider adapter supplies one. */
type Complete = (request: ModelRequest) => Promise<string>;

/** Parses a reply with the schema. A wrong shape becomes one short line naming the first bad field. */
function validate<T>(schema: z.ZodType<T>, reply: string, label: string): T {
  const result = schema.safeParse(parseModelJson(reply, label));
  if (result.success) return result.data;
  const path = result.error.issues[0]?.path.join(".") || "the top level";
  throw new Error(`${label} returned JSON in the wrong shape at ${path}`);
}

/** The two options of a "choose" task as A and B. A "choose" task without exactly two cannot be done, so it fails over. */
function choiceOptions(task: ModelTask): [ChoiceOption, ChoiceOption] | undefined {
  if (task.format !== "choose") return undefined;
  const [a, b] = task.options ?? [];
  if (!a || !b) throw new Error("A choose task needs exactly two options");
  return [
    { id: "a", ...a },
    { id: "b", ...b },
  ];
}

/**
 * Builds a draft from the model's task on top of the scripted draft for the same input.
 * The scripted draft supplies kind, minutes and, when the model leaves it out, the proof kind.
 * Set-aside lines that judge or name a protected attribute are dropped. The scripted "Not used" note and the
 * job facts (languages, licences) are kept as the code read them, so the model never words a fact itself.
 */
function toDraft(task: ModelTask, base: ChallengeDraft, need: (skills: SkillId[]) => string): ChallengeDraft {
  const ids = [...new Set(task.coreSkills.map((s) => s.id))];
  const skills = ids.map((id) => toSkill(id, task.coreSkills.find((s) => s.id === id)?.why));
  const guide = new Map(task.reviewGuide.map((g) => [g.skillId, g.lookFor]));
  const fixed = (line: string) => line.startsWith(NOT_USED_PREFIX);
  const options = choiceOptions(task);
  const setAside = base.kind === "taster" ? [] : [...neutralSetAside(task.setAside.filter((line) => !fixed(line))), ...base.setAside.filter(fixed)];

  return {
    title: task.title,
    need: need(ids),
    coreSkills: skills,
    setAside,
    format: task.format,
    proofKind: task.proofKind ?? base.proofKind,
    minutes: base.minutes,
    brief: task.brief,
    material: task.material,
    ...(options ? { options } : {}),
    deliverable: task.deliverable,
    reviewGuide: ids.map((id) => ({ skillId: id, lookFor: guide.get(id) ?? SKILLS[id].lookFor })),
    aiAllowed: true,
    kind: base.kind,
    ...(base.facts ? { facts: base.facts } : {}),
    // The job description is a courtesy: wording the guard would refuse drops it, and the built-in one is used instead.
    ...(base.kind !== "taster" && task.jobAd && isNeutral(task.jobAd) ? { jobAd: task.jobAd } : {}),
  };
}

/**
 * The provider-neutral designer: prompts, output checks and draft building, shared by every model API.
 * Use it through `guarded`, so the no-judgement guard runs on every output and the scripted designer answers on any failure.
 */
export function modelDesigner(name: "claude" | "gemini", complete: Complete): TaskDesigner {
  const ask = async <T>(prompt: string, jsonSchema: JsonSchema, schema: z.ZodType<T>) =>
    validate(schema, await complete({ system: SYSTEM, prompt, schema: jsonSchema }), name);

  return {
    name,
    async draftChallenge(need) {
      const parsed = parseNeed(need);
      const role = matchRole(need)?.title;
      const base = draftFromNeed(need);
      // The model reads the company's words with protected wishes already removed, as data.
      const prompt = draftPrompt({ need: parsed.cleanedNeed, role, skills: base.coreSkills.map((s) => s.label) });
      const task = await ask(prompt, TASK_JSON_SCHEMA, taskSchema);
      return toDraft(task, base, (ids) => talentNeed(role, ids));
    },
    async taster(dreamJob) {
      const task = await ask(tasterPrompt(dreamJob), TASK_JSON_SCHEMA, taskSchema);
      return toDraft(task, tasterFor(dreamJob), (ids) => talentNeed(matchRole(dreamJob)?.title, ids));
    },
    async followUps(challenge, answer) {
      const count = challenge.kind === "taster" ? 1 : 2;
      const { questions } = await ask(followUpPrompt(challenge.brief, answer, count), FOLLOW_UP_JSON_SCHEMA, followUpSchema(count));
      return questions;
    },
  };
}
