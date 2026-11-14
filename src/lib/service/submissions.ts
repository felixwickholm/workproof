import { getTaskDesigner } from "@/lib/ai";
import { toBlindProof } from "@/lib/blind/project";
import { addReports, emptyReport, redact } from "@/lib/blind/redact";
import type { BlindProof, ExplainAnswer, Submission, Talent } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";

export interface SubmitInput {
  challengeId: string;
  talent: Talent;
  answer: string;
  explain: ExplainAnswer[];
  shareWithSimilar: boolean;
}

export async function submitWork(input: SubmitInput): Promise<BlindProof> {
  const store = getStore();
  const snapshot = await store.read();
  const challenge = findOrThrow(snapshot.challenges, (c) => c.id === input.challengeId, "Challenge");
  if (challenge.kind === "event" && !challenge.approvedBy) throw new ServiceError(409, "This challenge is not published yet");
  if (!input.answer.trim()) throw new ServiceError(400, "The answer is empty");
  if (challenge.kind === "event" && (!input.talent.name.trim() || !input.talent.contact.trim())) {
    throw new ServiceError(400, "Name and contact are needed so the company can reach you after a match");
  }

  // The blind layer runs before the AI sees the work, so the summary never sees identity.
  const known = { name: input.talent.name, contact: input.talent.contact };
  const work = redact(input.answer, known);
  let report = work.report;
  const explain = input.explain.map(({ question, answer }) => {
    const q = redact(question, known);
    const a = redact(answer, known);
    report = addReports(report, addReports(q.report, a.report));
    return { question: q.text, answer: a.text };
  });
  const summary = await getTaskDesigner().summariseWork(challenge, work.text, explain);

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
  const proof = toBlindProof({
    proofId: submission.id,
    challenge,
    work: work.text,
    explain,
    aiSummary: summary,
    redactions: report ?? emptyReport(),
    submittedAt,
  });

  await store.update((data) => {
    const talent = data.talents.find((t) => t.id === input.talent.id);
    if (talent) {
      if (input.talent.name.trim()) talent.name = input.talent.name.trim();
      if (input.talent.contact.trim()) talent.contact = input.talent.contact.trim();
    } else {
      data.talents.push({ id: input.talent.id, name: input.talent.name.trim(), contact: input.talent.contact.trim() });
    }
    data.submissions.push(submission);
    data.proofs.push(proof);
    const hidden = Object.values(report).reduce((sum, n) => sum + n, 0);
    appendAudit(data, {
      actor: "system",
      by: "Blind layer",
      action: "Hid identity from the work",
      detail: `${proof.label}: ${hidden} detail${hidden === 1 ? "" : "s"} hidden before any reviewer or AI read it.`,
    });
    appendAudit(data, {
      actor: "ai",
      by: "Work describer",
      action: "Described the work",
      detail: `${proof.label}: a neutral summary of what the work contains. No score, no ranking.`,
    });
    if (input.shareWithSimilar && challenge.kind === "event") {
      appendAudit(data, {
        actor: "system",
        by: "Second look",
        action: "Recorded consent",
        detail: `${proof.label} may be shown to other employers with the same core skills if the first employer passes.`,
      });
    }
  });
  return proof;
}
