import { blindWork } from "@/lib/blind/blind-work";
import { atAGlance } from "@/lib/blind/glance";
import { toOwnProof } from "@/lib/blind/project";
import { fullTaskMessage, placesOf } from "@/lib/domain/places";
import type { Attachment, ExplainAnswer, OwnProof, Submission, Talent } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { HIDE_ACTION, SHAPE_ACTION } from "./ai-work";
import { checkPictureRoom, makeRoom } from "./capacity";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { rememberTalent } from "./talent";

/** Follow-up answers about the person's own choices: two for an event task, one for a practice task. */
const FOLLOW_UPS_NEEDED = { event: 2, taster: 1 } as const;

const PICTURE_UNCHECKED =
  "Check your picture first: it must show the work only, with no face, no name, no badge and no contact details";

/** Why the follow-up answers do not keep the promise, or undefined when they do. */
export function followUpProblem(kind: "event" | "taster", explain: ExplainAnswer[]): string | undefined {
  const needed = FOLLOW_UPS_NEEDED[kind];
  const answered = explain.filter((e) => e.question.trim() && e.answer.trim()).length;
  if (answered >= needed) return undefined;
  return needed === 1
    ? "Answer the follow-up question about your own choices"
    : `Answer ${needed} follow-up questions about your own choices (${answered} answered)`;
}

interface SubmitInput {
  challengeId: string;
  /** For a practice task, name and contact are used only to hide them in the text, never stored. */
  talent: Talent;
  answer: string;
  explain: ExplainAnswer[];
  /** Checked by the request schema: a clean JPEG data URL only, confirmed by the person as showing the work only. */
  attachment?: Attachment;
  /** The answer was given by voice; only the transcript arrives. */
  spoken?: boolean;
  shareWithSimilar: boolean;
}

export async function submitWork(input: SubmitInput): Promise<OwnProof> {
  const store = getStore();
  const snapshot = await store.read();
  const challenge = findOrThrow(snapshot.challenges, (c) => c.id === input.challengeId, "Challenge");
  if (challenge.kind === "event" && !challenge.approvedBy) throw new ServiceError(409, "This challenge is not published yet");
  if (!input.answer.trim()) throw new ServiceError(400, "The answer is empty");
  const followUps = followUpProblem(challenge.kind, input.explain);
  if (followUps) throw new ServiceError(400, followUps);
  // Pixels are not analysed, so the person's own check is the rule: no picture without it.
  if (input.attachment && input.attachment.confirmed !== true) throw new ServiceError(400, PICTURE_UNCHECKED);
  if (challenge.kind === "event" && (!input.talent.name.trim() || !input.talent.contact.trim())) {
    throw new ServiceError(400, "Name and contact are needed so the company can reach you after a match");
  }

  const companies = snapshot.companies.map((c) => c.name);
  const blind = blindWork(input.answer, input.explain, { name: input.talent.name, contact: input.talent.contact, companies }, input.attachment);
  // Code, not AI: the shape of the blind text, the same for right and wrong answers.
  const glance = atAGlance(blind.work, blind.explain);

  const submittedAt = clock.now().toISOString();
  // A practice proof keeps only the blind text: the name the person gave hid itself and is not stored anywhere.
  const practice = challenge.kind === "taster";
  const submission: Submission = {
    id: newId("proof"),
    challengeId: challenge.id,
    talentId: input.talent.id,
    answer: practice ? blind.work : input.answer,
    explain: practice ? blind.explain : input.explain,
    ...(input.attachment ? { attachment: { kind: input.attachment.kind, src: input.attachment.src, alt: practice ? (blind.attachment?.alt ?? "") : input.attachment.alt, confirmed: true } } : {}),
    ...(input.spoken ? { spoken: true } : {}),
    shareWithSimilar: input.shareWithSimilar,
    submittedAt,
  };

  return store.update((data) => {
    // Counted inside the write, so two people sending at once cannot both take the last place.
    const places = placesOf(challenge);
    if (places !== null && data.proofs.filter((p) => p.challengeId === challenge.id).length >= places) {
      throw new ServiceError(409, fullTaskMessage(places));
    }
    makeRoom(data);
    if (input.attachment) checkPictureRoom(data);
    const proof = toOwnProof({
      proofId: submission.id,
      challenge,
      work: blind.work,
      explain: blind.explain,
      attachment: blind.attachment,
      spoken: input.spoken,
      glance,
      redactions: blind.report,
      submittedAt,
      takenLabels: new Set(data.proofs.map((p) => p.label)),
    });
    rememberTalent(data.talents, input.talent, challenge.kind === "event");
    data.submissions.push(submission);
    data.proofs.push(proof);
    const hidden = proof.hiddenCount;
    appendAudit(data, {
      actor: "system",
      by: "Blind layer",
      action: HIDE_ACTION,
      detail: `${proof.label}: ${hidden} detail${hidden === 1 ? "" : "s"} hidden before any reviewer or AI model read it.`,
    });
    appendAudit(data, {
      actor: "system",
      by: "At a glance",
      action: SHAPE_ACTION,
      detail: `${proof.label}: counted points, words and code. Nothing about quality.`,
    });
    if (input.shareWithSimilar && challenge.kind === "event") {
      appendAudit(data, {
        actor: "system",
        by: "Second look",
        action: "Recorded consent",
        detail: `${proof.label} may be shown to other employers with the same core skills if the first employer says not now or does not answer in time.`,
      });
    }
    return proof;
  });
}
