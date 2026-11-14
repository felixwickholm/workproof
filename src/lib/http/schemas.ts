import { z } from "zod";
import { LIMITS } from "./limits";

const text = (max: number) => z.string().max(max);

const skill = z.object({ id: z.string().min(1).max(60), label: text(80), why: text(300) });

const challengeDraftSchema = z.object({
  title: z.string().min(3).max(120),
  need: text(2000),
  coreSkills: z.array(skill).min(3).max(5),
  setAside: z.array(text(300)).max(30),
  format: z.enum(["review", "plan", "write", "build", "explain"]),
  minutes: z.number().int().min(2).max(30),
  brief: z.string().min(10).max(LIMITS.brief),
  material: z.object({ kind: z.enum(["code", "text"]), title: text(120), body: text(6000) }).optional(),
  deliverable: z.string().min(5).max(600),
  reviewGuide: z.array(z.object({ skillId: z.string().min(1).max(60), lookFor: text(400) })).min(1).max(5),
  aiAllowed: z.boolean(),
  kind: z.enum(["event", "taster"]),
});

export const draftRequest = z.object({ need: z.string().trim().min(10).max(LIMITS.need) });

export const approveRequest = z.object({
  draft: challengeDraftSchema,
  companyId: z.string().min(1),
  approvedBy: z.string().trim().min(1).max(LIMITS.approvedBy),
});

export const tasterRequest = z.object({ dreamJob: z.string().trim().min(2).max(LIMITS.dreamJob) });

export const followUpRequest = z.object({
  challengeId: z.string().min(1).max(100),
  answer: z.string().max(LIMITS.answer),
  /** Optional: the author's own name and contact, so they are removed before the question writer reads the answer. */
  talent: z.object({ name: text(LIMITS.name), contact: text(LIMITS.contact) }).optional(),
});

export const submissionRequest = z.object({
  challengeId: z.string().min(1),
  talent: z.object({ id: z.string().min(1).max(100), name: text(LIMITS.name), contact: text(LIMITS.contact) }),
  answer: z.string().min(1).max(LIMITS.answer),
  explain: z.array(z.object({ question: text(600), answer: text(LIMITS.explain) })).max(4).default([]),
  /** Opt-in. Missing means no. */
  shareWithSimilar: z.boolean().default(false),
});

export const sharingRequest = z.object({ talentId: z.string().min(1).max(100), share: z.boolean() });

export const decisionRequest = z.object({
  proofId: z.string().min(1),
  companyId: z.string().min(1),
  reviewer: z.string().max(LIMITS.reviewer),
  decision: z.enum(["meet", "pass"]),
  feedback: z.string().max(LIMITS.feedback),
});

export const acceptRequest = z.object({ talentId: z.string().min(1).max(100) });

export const confirmRequest = z.discriminatedUnion("side", [
  z.object({ side: z.literal("talent"), talentId: z.string().min(1).max(100) }),
  z.object({ side: z.literal("company"), companyId: z.string().min(1).max(100) }),
]);
