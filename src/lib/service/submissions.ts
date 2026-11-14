import { blindWork } from "@/lib/blind/blind-work";
import { addReports, redact } from "@/lib/blind/redact";
import { atAGlance } from "@/lib/blind/glance";
import { toOwnProof } from "@/lib/blind/project";
import { fullTaskMessage, placesOf } from "@/lib/domain/places";
import type { Attachment, Challenge, OwnProof, Submission, Talent } from "@/lib/domain/types";
import { getStore, type StoreData } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { HIDE_ACTION, SHAPE_ACTION } from "./ai-work";
import { checkPictureRoom, makeRoom } from "./capacity";
import { checkTakesWork, issuedFollowUps, useIssue, type SentFollowUp } from "./follow-ups";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { rememberTalent } from "./talent";

const PICTURE_UNCHECKED =
  "Check your picture first: it must show the work only, with no face, no name, no badge and no contact details";

export const ALREADY_ANSWERED = "You already answered this task. Your proof is in your passport.";

/** One proof per person per event task, so a double tap or a retry never takes a second place. Practice tasks have no limit. */
function checkNotAnswered(data: StoreData, challenge: Challenge, talentId: string): void {
  if (challenge.kind !== "event") return;
  if (data.submissions.some((s) => s.challengeId === challenge.id && s.talentId === talentId)) throw new ServiceError(409, ALREADY_ANSWERED);
}

interface SubmitInput {
  challengeId: string;
  /** For a practice task, name and contact are used only to hide them in the text, never stored. */
  talent: Talent;
  answer: string;
  /** The follow-up questions the server issued for this answer. The submission answers exactly those, in order. */
  issueId?: string;
  explain: SentFollowUp[];
  /** Checked by the request schema: a clean JPEG data URL only, confirmed by the person as showing the work only. */
  attachment?: Attachment;
  /** The answer was given by voice; only the transcript arrives. */
  spoken?: boolean;
  shareWithSimilar: boolean;
  /** The option picked in a "choose" challenge. Required there, dropped anywhere else. */
  choice?: "a" | "b";
  /** The person's spoken thinking as text. Its transcript runs through the blind layer like every text. */
  thinkAloud?: { transcript: string; seconds: number };
}

export const CHOICE_NEEDED = "Pick one of the two options first";

export async function submitWork(input: SubmitInput): Promise<OwnProof> {
  const store = getStore();
  const snapshot = await store.read();
  const challenge = findOrThrow(snapshot.challenges, (c) => c.id === input.challengeId, "Challenge");
  checkTakesWork(snapshot, challenge);
  if (!input.answer.trim()) throw new ServiceError(400, "The answer is empty");
  checkNotAnswered(snapshot, challenge, input.talent.id);
  // The questions come from the server's own record, never from the request.
  const explain = issuedFollowUps(snapshot, challenge, input);
  // Pixels are not analysed, so the person's own check is the rule: no picture without it.
  if (input.attachment && input.attachment.confirmed !== true) throw new ServiceError(400, PICTURE_UNCHECKED);
  if (challenge.kind === "event" && (!input.talent.name.trim() || !input.talent.contact.trim())) {
    throw new ServiceError(400, "Name and contact are needed so the company can reach you after a match");
  }

  const companies = snapshot.companies.map((c) => c.name);
  const choice = challenge.format === "choose" ? input.choice : undefined;
  if (challenge.format === "choose" && !choice) throw new ServiceError(400, CHOICE_NEEDED);
  const known = { name: input.talent.name, contact: input.talent.contact, companies };
  const blind = blindWork(input.answer, explain, known, input.attachment);
  const spokenThinking = input.thinkAloud?.transcript.trim() ? redact(input.thinkAloud.transcript, known) : undefined;
  const thinkAloud = spokenThinking && input.thinkAloud ? { transcript: spokenThinking.text, seconds: input.thinkAloud.seconds } : undefined;
  const redactions = spokenThinking ? addReports(blind.report, spokenThinking.report) : blind.report;
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
    explain: practice ? blind.explain : explain,
    ...(input.attachment ? { attachment: { kind: input.attachment.kind, src: input.attachment.src, alt: practice ? (blind.attachment?.alt ?? "") : input.attachment.alt, confirmed: true } } : {}),
    ...(input.spoken ? { spoken: true } : {}),
    shareWithSimilar: input.shareWithSimilar,
    submittedAt,
    ...(choice ? { choice } : {}),
    // A practice proof keeps only blind text, the spoken thinking included.
    ...(input.thinkAloud && thinkAloud ? { thinkAloud: practice ? thinkAloud : { transcript: input.thinkAloud.transcript, seconds: input.thinkAloud.seconds } } : {}),
  };

  return store.update((data) => {
    // Checked again inside the write, so two sends at once cannot both pass: one proof per person per
    // event task, and each set of follow-up questions answers one submission only.
    checkNotAnswered(data, challenge, input.talent.id);
    issuedFollowUps(data, challenge, input);
    useIssue(data, input.issueId);
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
      ...(choice ? { choice } : {}),
      ...(thinkAloud ? { thinkAloud } : {}),
      glance,
      redactions,
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
