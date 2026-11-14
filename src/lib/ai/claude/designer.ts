import { z } from "zod";
import type { ChallengeDraft } from "@/lib/domain/types";
import { SKILL_IDS, SKILLS, toSkill, type SkillId } from "@/lib/skills/vocabulary";
import { EVENT_MINUTES, TASTER_MINUTES } from "../scripted/compose";
import { parseNeed, protectedNames } from "../scripted/parse-need";
import type { TaskDesigner } from "../task-designer";
import { draftPrompt, followUpPrompt, summaryPrompt, SYSTEM, tasterPrompt } from "./prompts";

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

function toDraft(raw: unknown, extra: Pick<ChallengeDraft, "need" | "kind" | "minutes">, notUsed: string[]): ChallengeDraft {
  const task = taskSchema.parse(raw);
  const authored = [task.title, task.brief, task.deliverable, task.material.body].join("\n");
  if (protectedNames(authored).length > 0) throw new Error("Draft mentions a protected attribute");

  const skills = task.coreSkills.map((s) => toSkill(s.id, s.why));
  const guide = new Map(task.reviewGuide.map((g) => [g.skillId, g.lookFor]));
  const setAside = task.setAside.filter((item) => !item.startsWith("Not used") && protectedNames(item).length === 0);
  if (notUsed.length > 0) setAside.push(`Not used: ${notUsed.join(", ")} (not skills)`);

  return {
    title: task.title,
    need: extra.need,
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
      const raw = await ask(draftPrompt(parsed.cleanedNeed), apiKey, model);
      return toDraft(raw, { need: parsed.cleanedNeed, kind: "event", minutes: EVENT_MINUTES }, parsed.notUsed);
    },
    async taster(dreamJob) {
      const raw = await ask(tasterPrompt(dreamJob), apiKey, model);
      const draft = toDraft(raw, { need: dreamJob.trim().slice(0, 120), kind: "taster", minutes: TASTER_MINUTES }, []);
      return { ...draft, setAside: [] };
    },
    async followUps(challenge, answer) {
      const count = challenge.kind === "taster" ? 1 : 2;
      const raw = await ask(followUpPrompt(challenge.brief, answer, count), apiKey, model);
      const { questions } = z.object({ questions: z.array(z.string().min(5).max(300)).min(count) }).parse(raw);
      return questions.slice(0, count);
    },
    async summariseWork(challenge, answer, explain) {
      const raw = await ask(summaryPrompt(challenge.brief, answer, explain.map((e) => e.answer).join("\n")), apiKey, model);
      return z.object({ summary: z.string().min(10).max(600) }).parse(raw).summary;
    },
  };
}
