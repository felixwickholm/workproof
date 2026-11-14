import { z } from "zod";

const text = (max: number) => z.string().max(max);

const skill = z.object({ id: z.string().min(1).max(60), label: text(80), why: text(300) });

export const challengeDraftSchema = z.object({
  title: z.string().min(3).max(120),
  need: text(2000),
  coreSkills: z.array(skill).min(3).max(5),
  setAside: z.array(text(300)).max(30),
  format: z.enum(["review", "plan", "write", "build", "explain"]),
  minutes: z.number().int().min(2).max(30),
  brief: z.string().min(10).max(1500),
  material: z.object({ kind: z.enum(["code", "text"]), title: text(120), body: text(6000) }).optional(),
  deliverable: z.string().min(5).max(600),
  reviewGuide: z.array(z.object({ skillId: z.string().min(1).max(60), lookFor: text(400) })).min(1).max(5),
  aiAllowed: z.boolean(),
  kind: z.enum(["event", "taster"]),
});

export const draftRequest = z.object({ need: z.string().trim().min(10).max(2000) });

export const approveRequest = z.object({
  draft: challengeDraftSchema,
  companyId: z.string().min(1),
  approvedBy: z.string().trim().min(1).max(80),
});

export const tasterRequest = z.object({ dreamJob: z.string().trim().min(2).max(200) });

export const followUpRequest = z.object({ challengeId: z.string().min(1), answer: z.string().max(12000) });

export const submissionRequest = z.object({
  challengeId: z.string().min(1),
  talent: z.object({ id: z.string().min(1).max(100), name: text(120), contact: text(200) }),
  answer: z.string().min(1).max(12000),
  explain: z.array(z.object({ question: text(600), answer: text(4000) })).max(4).default([]),
  shareWithSimilar: z.boolean(),
});

export const decisionRequest = z.object({
  proofId: z.string().min(1),
  companyId: z.string().min(1),
  reviewer: z.string().max(80),
  decision: z.enum(["meet", "pass"]),
  feedback: z.string().max(2000),
});

export const confirmRequest = z.object({ side: z.enum(["talent", "company"]) });
