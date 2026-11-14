import { z } from "zod";
import { PROOF_KINDS, STORY_STAGES } from "@/lib/domain/kinds";
import { DEFAULT_PLACES, MAX_PLACES, MIN_PLACES } from "@/lib/domain/places";
import { pictureProblem } from "./jpeg";
import { LIMITS } from "./limits";

const text = (max: number) => z.string().max(max);

const skill = z.object({ id: z.string().min(1).max(60), label: text(80), why: text(300) });

/**
 * A visitor's own picture of the work. Only a re-encoded JPEG data URL: paths under /demo belong
 * to the seed, and a request can never point at one. No video from a request. Pixels are not analysed,
 * so the person must confirm they checked it shows the work only.
 */
const uploadedPicture = z
  .object({
    kind: z.enum(["photo", "design"]),
    src: z.string().superRefine((src, ctx) => {
      const problem = pictureProblem(src);
      if (problem) ctx.addIssue({ code: "custom", message: problem });
    }),
    alt: z.string().trim().min(1).max(LIMITS.attachmentAlt),
    confirmed: z.literal(true, { error: "check the picture first: no face, no name, no badge, no contact details" }),
  })
  .strict();

const challengeDraftSchema = z.object({
  title: z.string().min(3).max(120),
  need: text(2000),
  coreSkills: z.array(skill).min(3).max(5),
  setAside: z.array(text(300)).max(30),
  format: z.enum(["review", "plan", "write", "build", "explain"]),
  proofKind: z.enum(PROOF_KINDS),
  minutes: z.number().int().min(2).max(30),
  brief: z.string().min(10).max(LIMITS.brief),
  material: z.object({ kind: z.enum(["code", "text"]), title: text(120), body: text(6000) }).optional(),
  deliverable: z.string().min(5).max(600),
  reviewGuide: z.array(z.object({ skillId: z.string().min(1).max(60), lookFor: text(400) })).min(1).max(5),
  aiAllowed: z.boolean(),
  kind: z.enum(["event", "taster"]),
  /** Answers the task takes; the employer chooses when publishing. */
  places: z.number().int().min(MIN_PLACES).max(MAX_PLACES).default(DEFAULT_PLACES),
  /** Company-side only: dropped before publishing. */
  draftedBy: z.enum(["scripted", "claude", "gemini"]).optional(),
  /** Job facts in fixed forms. Published as requirements only when each one matches a fixed form. */
  facts: z.array(text(120)).max(20).optional(),
  /** Company-side only: dropped before publishing. */
  wishes: z
    .array(
      z.object({
        text: text(300),
        outcome: z.enum(["kept", "set-aside", "fact"]),
        skillId: z.string().max(60).optional(),
        reason: text(300).optional(),
      }),
    )
    .max(40)
    .optional(),
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
  explain: z
    .array(z.object({ question: text(600), answer: text(LIMITS.explain), spoken: z.boolean().optional() }))
    .max(4)
    .default([]),
  attachment: uploadedPicture.optional(),
  /** The answer was spoken; only its transcript is sent. */
  spoken: z.boolean().optional(),
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

/** Only the name: whether it is a person is checked by the service, with one plain message. */
export const reviewerRequest = z.object({ name: z.string().max(LIMITS.reviewer) });

export const pictureReportRequest = z.object({ companyId: z.string().min(1).max(100), reviewer: z.string().max(LIMITS.reviewer) });

export const acceptRequest = z.object({ talentId: z.string().min(1).max(100) });

export const declineRequest = z.object({ talentId: z.string().min(1).max(100) });

export const confirmRequest = z.discriminatedUnion("side", [
  z.object({ side: z.literal("talent"), talentId: z.string().min(1).max(100) }),
  z.object({ side: z.literal("company"), companyId: z.string().min(1).max(100) }),
]);

export const storyRequest = z.object({ stage: z.enum(STORY_STAGES) });
