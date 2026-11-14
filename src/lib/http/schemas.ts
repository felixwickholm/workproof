import { z } from "zod";
import { PROOF_KINDS, STORY_STAGES, TASK_FORMATS } from "@/lib/domain/kinds";
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
  format: z.enum(TASK_FORMATS),
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
  /** The job-ad link the draft was read from; kept only when the city publishes on the company's behalf. */
  adUrl: z.string().url().max(2000).optional(),
  /** The designer's template, kept through publishing so follow-ups never depend on the editable title. */
  templateId: z.string().max(60).optional(),
  /** Company-side only: dropped before publishing. */
  draftedBy: z.enum(["scripted", "claude", "gemini"]).optional(),
  /** The two options of a "choose" challenge. */
  options: z
    .tuple([
      z.object({ id: z.literal("a"), title: text(120), body: text(600), image: z.string().startsWith("/demo/").max(200).optional() }),
      z.object({ id: z.literal("b"), title: text(120), body: text(600), image: z.string().startsWith("/demo/").max(200).optional() }),
    ])
    .optional(),
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
  /** From `POST /api/followups`: the questions this submission answers. Checked by the service, with one plain message. */
  issueId: z.string().max(100).optional(),
  /** Answers to the issued questions, in order. A question sent along must match the issued one; it is never stored from here. */
  explain: z
    .array(z.object({ question: text(600).optional(), answer: text(LIMITS.explain), spoken: z.boolean().optional() }))
    .max(4)
    .default([]),
  attachment: uploadedPicture.optional(),
  /** The answer was spoken; only its transcript is sent. */
  spoken: z.boolean().optional(),
  /** Opt-in. Missing means no. */
  shareWithSimilar: z.boolean().default(false),
  /** The option picked in a "choose" challenge; required there, checked by the service. */
  choice: z.enum(["a", "b"]).optional(),
  /** The person's spoken thinking as text. A screen clip never comes from a request: only sample clips under /demo exist. */
  thinkAloud: z.object({ transcript: z.string().max(LIMITS.thinkAloud), seconds: z.number().int().min(0).max(3600) }).strict().optional(),
});

export const portfolioLinkRequest = z.object({ talentId: z.string().min(1).max(100), cardId: z.string().min(1).max(100).nullable(), on: z.boolean() });

export const decisionShownRequest = z.object({ talentId: z.string().min(1).max(100), cardId: z.string().min(1).max(100), shown: z.boolean() });

export const sharingRequest = z.object({ talentId: z.string().min(1).max(100), share: z.boolean() });

/** One score per core skill, 1 to 5 points each. Whether they fit the task is checked by the service. */
const skillScores = z.array(z.object({ skillId: z.string().min(1).max(60), points: z.number() })).max(5);

export const decisionRequest = z.object({
  proofId: z.string().min(1),
  companyId: z.string().min(1),
  reviewer: z.string().max(LIMITS.reviewer),
  decision: z.enum(["meet", "pass", "hold"]),
  feedback: z.string().max(LIMITS.feedback),
  scores: skillScores.default([]),
});

/** Turns a hold into meet or pass. The named reviewer must be registered for the company that scored it. */
export const decideHoldRequest = z.object({ decision: z.enum(["meet", "pass"]), reviewer: z.string().max(LIMITS.reviewer) });

export const recommendationRequest = z.object({ proofId: z.string().min(1).max(100), fromCompanyId: z.string().min(1).max(100), toCompanyId: z.string().min(1).max(100) });

export const cityRecommendationRequest = z.object({ proofId: z.string().min(1).max(100), toCompanyId: z.string().min(1).max(100), by: z.string().trim().min(1).max(LIMITS.approvedBy) });

export const followUpAgreedRequest = z.object({ companyId: z.string().min(1).max(100), agreed: z.boolean() });

export const companyRequest = z.object({ companyId: z.string().min(1).max(100) });

export const fromAdRequest = z.object({ url: z.string().trim().min(8).max(2000) });

export const onBehalfRequest = z.object({ companyId: z.string().min(1).max(100), draft: challengeDraftSchema, by: z.string().trim().min(1).max(LIMITS.approvedBy) });

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
