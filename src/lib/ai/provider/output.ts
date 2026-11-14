import { z } from "zod";
import { PROOF_KINDS } from "@/lib/domain/kinds";
import type { TaskFormat } from "@/lib/domain/types";
import { SKILL_IDS, type SkillId } from "@/lib/skills/vocabulary";

/** What a model must return, checked twice: as a JSON Schema the API enforces, then strictly with zod here. */

const FORMATS = ["review", "plan", "write", "build", "explain"] as const satisfies readonly TaskFormat[];
const MATERIAL_KINDS = ["code", "text"] as const;

const skillId = z.enum(SKILL_IDS as [SkillId, ...SkillId[]]);

export const taskSchema = z.strictObject({
  title: z.string().trim().min(3).max(120),
  format: z.enum(FORMATS),
  /** Optional here so a model that leaves it out still drafts; the scripted draft supplies it then. */
  proofKind: z.enum(PROOF_KINDS).optional(),
  brief: z.string().trim().min(20).max(900),
  material: z.strictObject({ kind: z.enum(MATERIAL_KINDS), title: z.string().trim().min(1).max(120), body: z.string().min(10).max(4000) }),
  deliverable: z.string().trim().min(10).max(400),
  coreSkills: z.array(z.strictObject({ id: skillId, why: z.string().trim().min(5).max(240) })).min(3).max(5),
  reviewGuide: z.array(z.strictObject({ skillId, lookFor: z.string().trim().min(5).max(400) })).max(5),
  setAside: z.array(z.string().trim().max(200)).max(12),
});

export type ModelTask = z.infer<typeof taskSchema>;

/** Exactly the asked number of questions, each short and ending with a question mark. */
export function followUpSchema(count: number) {
  return z.strictObject({ questions: z.array(z.string().trim().min(5).max(240).regex(/\?$/)).length(count) });
}

export type JsonSchema = Record<string, unknown>;

const text = { type: "string" };

function object(properties: Record<string, JsonSchema>): JsonSchema {
  return { type: "object", properties, required: Object.keys(properties), additionalProperties: false };
}

function list(items: JsonSchema): JsonSchema {
  return { type: "array", items };
}

function oneOf(values: readonly string[]): JsonSchema {
  return { type: "string", enum: [...values] };
}

/**
 * Only keywords both APIs accept: types, enums, required and `additionalProperties: false`.
 * Lengths and counts are left to zod, since Claude rejects them in a schema.
 */
export const TASK_JSON_SCHEMA = object({
  title: text,
  format: oneOf(FORMATS),
  proofKind: oneOf(PROOF_KINDS),
  brief: text,
  material: object({ kind: oneOf(MATERIAL_KINDS), title: text, body: text }),
  deliverable: text,
  coreSkills: list(object({ id: oneOf(SKILL_IDS), why: text })),
  reviewGuide: list(object({ skillId: oneOf(SKILL_IDS), lookFor: text })),
  setAside: list(text),
});

export const FOLLOW_UP_JSON_SCHEMA = object({ questions: list(text) });

/** The JSON object in a model's reply. A code fence or a stray sentence around it is tolerated. */
export function parseModelJson(reply: string, label: string): unknown {
  const start = reply.indexOf("{");
  const end = reply.lastIndexOf("}");
  try {
    if (start < 0 || end < start) throw new SyntaxError("no object");
    return JSON.parse(reply.slice(start, end + 1));
  } catch {
    throw new Error(`${label} returned malformed JSON`);
  }
}
