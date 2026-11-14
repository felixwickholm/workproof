import { isNamedReviewer } from "@/lib/domain/decision-rules";
import { getStore } from "@/lib/store";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { buildQueue } from "./views/queue";

export const REPORT_PICTURE_ACTION = "Reported a picture";

/**
 * A reviewer reports a picture that might identify the person. Pixels are not analysed, so a human
 * reader is the second check after the person's own: the picture is removed from the blind proof and
 * the submission for every reader at once, and the person is told. The written answer stays.
 * Only a named reviewer at a company that can read the proof may report it.
 */
export async function reportPicture(proofId: string, companyId: string, reviewer: string): Promise<{ proofId: string; pictureRemoved: true }> {
  const name = reviewer.trim();
  if (!isNamedReviewer(name)) throw new ServiceError(400, "Add the name of the person who reports the picture");

  return getStore().update((data) => {
    const company = findOrThrow(data.companies, (c) => c.id === companyId, "Company");
    const proof = findOrThrow(data.proofs, (p) => p.proofId === proofId, "Proof");
    const submission = findOrThrow(data.submissions, (s) => s.id === proofId, "Proof");
    const queue = buildQueue(data, company.id, clock.now());
    const readable = [...queue.proofs, ...queue.secondLook, ...queue.decided.filter((d) => !d.withdrawn).map((d) => d.proof)].some((p) => p.proofId === proofId);
    if (!readable) throw new ServiceError(403, `This proof is not in the queue of ${company.name}`);
    if (!proof.attachment && !submission.attachment) return { proofId, pictureRemoved: true };

    delete proof.attachment;
    delete submission.attachment;
    submission.pictureRemoved = true;
    appendAudit(data, {
      actor: "human",
      by: name,
      action: REPORT_PICTURE_ACTION,
      detail: `${company.name} on ${proof.label}: the picture may identify the person. It was removed for every reader; the written answer stays.`,
    });
    return { proofId, pictureRemoved: true };
  });
}
