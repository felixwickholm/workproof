import { z } from "zod";
import type { ChallengeDraft } from "@/lib/domain/types";
import { neutralSetAside, NOT_USED_PREFIX, talentNeed } from "@/lib/guard/check-draft";
import { matchRole } from "../scripted/match-role";
import { SKILL_IDS, SKILLS, toSkill, type SkillId } from "@/lib/skills/vocabulary";
import { EVENT_MINUTES, TASTER_MINUTES } from "../scripted/compose";
import { parseNeed } from "../scripted/parse-need";
import type { TaskDesigner } from "../task-designer";
import { draftPrompt, followUpPrompt, SYSTEM, tasterPrompt } from "./prompts";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-opus-5-5";
const TIMEOUT_MS = 30_000;

const skillId = z.enum(SKILL_IDS as [SkillId, ...SkillId[]]);

const taskSchema = z.object({
  title: z.string().min(3).max(120),
  format: z.enum(["review", "plan", "write", "build", "explain"]),
  brief: z.string().min(20).max(900),
  material: z.object({ kind: z.enum(["code", "text"]), title: z.string().min(1), body: z.string().min(10) }),
  deliverable: z.string().min(10),
  coreSkills: z.array(z.object({ id: skillId, why: z.string().min(5) })).min(3).max(5),
  reviewGuide: z.array(z.object({ skillId, lookFor: z.string().min(5) })),
  setAside: z.array(z.string()).default([]),
});

/** Follow-up questions: exactly the asked number, short, and each one a question. */
function followUpSchema(count: number) {
  return z.object({ questions: z.array(z.string().trim().min(5).max(240).regex(/\?$/)).length(count) });
}

async function ask(prompt: string, apiKey: string, model: string): Promise<unknown> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
    body: JSON.stringify({ model, max_tokens: 2000, system: SYSTEM, messages: [{ role: "user", content: prompt }] }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`Claude request failed with status ${response.status}`);
  const body = (await response.json()) as { content?: { type: string; text?: string }[] };
  const text = body.content?.find((block) => block.type === "text")?.text ?? "";
  const json = text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1);
  return JSON.parse(json);
}

/**
 * Builds a draft from the model's JSON. Every field is checked again by the guard; set-aside lines
 * that judge or name a protected attribute are dropped here, so the note shows only neutral names.
 */
function toDraft(raw: unknown, extra: Pick<ChallengeDraft, "kind" | "minutes"> & { need: (skills: SkillId[]) => string }, notUsed: string[]): ChallengeDraft {
  const task = taskSchema.parse(raw);
  const ids = [...new Set(task.coreSkills.map((s) => s.id))];
  const skills = ids.map((id) => toSkill(id, task.coreSkills.find((s) => s.id === id)?.why));
  const guide = new Map(task.reviewGuide.map((g) => [g.skillId, g.lookFor]));
  const setAside = neutralSetAside(task.setAside.filter((item) => !item.startsWith(NOT_USED_PREFIX)));
  if (notUsed.length > 0) setAside.push(`${NOT_USED_PREFIX} ${notUsed.join(", ")} (not skills)`);

  return {
    title: task.title,
    need: extra.need(ids),
    coreSkills: skills,
    setAside,
    format: task.format,
    minutes: extra.minutes,
    brief: task.brief,
    material: task.material,
    deliverable: task.deliverable,
    reviewGuide: skills.map((s) => ({ skillId: s.id, lookFor: guide.get(s.id as SkillId) ?? SKILLS[s.id as SkillId].lookFor })),
    aiAllowed: true,
    kind: extra.kind,
  };
}

/** Designer backed by the Claude Messages API. Use through `guarded` with the scripted fallback. */
export function claudeDesigner(apiKey: string, model = DEFAULT_MODEL): TaskDesigner {
  return {
    name: "claude",
    async draftChallenge(need) {
      const parsed = parseNeed(need, []);
      const role = matchRole(need);
      // The model never reads the company's sentence: only the role and the skills found in it.
      const skills = parsed.wishedSkills.length > 0 ? parsed.wishedSkills : (role?.skills ?? []);
      const raw = await ask(draftPrompt(talentNeed(role?.title, skills, parsed.workingLanguages)), apiKey, model);
      const shown = (kept: SkillId[]) => talentNeed(role?.title, kept, parsed.workingLanguages);
      return toDraft(raw, { need: shown, kind: "event", minutes: EVENT_MINUTES }, parsed.notUsed);
    },
    async taster(dreamJob) {
      const raw = await ask(tasterPrompt(dreamJob), apiKey, model);
      const need = (skills: SkillId[]) => talentNeed(matchRole(dreamJob)?.title, skills);
      const draft = toDraft(raw, { need, kind: "taster", minutes: TASTER_MINUTES }, []);
      return { ...draft, setAside: [] };
    },
    async followUps(challenge, answer) {
      const count = challenge.kind === "taster" ? 1 : 2;
      const raw = await ask(followUpPrompt(challenge.brief, answer, count), apiKey, model);
      // Any other shape throws, and the guarded wrapper answers with the scripted questions instead.
      return followUpSchema(count).parse(raw).questions;
    },
  };
}
