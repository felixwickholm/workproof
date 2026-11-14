import { blindWork } from "@/lib/blind/blind-work";
import { atAGlance } from "@/lib/blind/glance";
import { toOwnProof } from "@/lib/blind/project";
import type { ExplainAnswer, OwnProof, Submission, Talent } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { HIDE_ACTION, SHAPE_ACTION } from "./ai-work";
import { makeRoom } from "./capacity";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { rememberTalent } from "./talent";

export interface SubmitInput {
  challengeId: string;
  talent: Talent;
  answer: string;
  explain: ExplainAnswer[];
  shareWithSimilar: boolean;
}

export async function submitWork(input: SubmitInput): Promise<OwnProof> {
  const store = getStore();
  const snapshot = await store.read();
  const challenge = findOrThrow(snapshot.challenges, (c) => c.id === input.challengeId, "Challenge");
  if (challenge.kind === "event" && !challenge.approvedBy) throw new ServiceError(409, "This challenge is not published yet");
  if (!input.answer.trim()) throw new ServiceError(400, "The answer is empty");
  if (challenge.kind === "event" && (!input.talent.name.trim() || !input.talent.contact.trim())) {
    throw new ServiceError(400, "Name and contact are needed so the company can reach you after a match");
  }

  const companies = snapshot.companies.map((c) => c.name);
  const blind = blindWork(input.answer, input.explain, { name: input.talent.name, contact: input.talent.contact, companies });
  // Code, not AI: the shape of the blind text, the same for right and wrong answers.
  const glance = atAGlance(blind.work, blind.explain);

  const submittedAt = clock.now().toISOString();
  const submission: Submission = {
    id: newId("proof"),
    challengeId: challenge.id,
    talentId: input.talent.id,
    answer: input.answer,
    explain: input.explain,
    shareWithSimilar: input.shareWithSimilar,
    submittedAt,
  };

  return store.update((data) => {
    makeRoom(data);
    const proof = toOwnProof({
      proofId: submission.id,
      challenge,
      work: blind.work,
      explain: blind.explain,
      aiSummary: glance,
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
