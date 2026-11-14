import { beforeEach, describe, expect, it } from "vitest";
import { CLEAN, dataUrl } from "@/lib/http/jpeg-test-data";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { REPORT_PICTURE_ACTION, reportPicture } from "./pictures";
import { submitWork } from "./submissions";
import { buildPassport } from "./views/passport";
import { buildQueue } from "./views/queue";

const NOW = new Date("2026-11-14T12:00:00Z");
const person = { id: "t_pictures_test_8b1d", name: "Ilona Koski", contact: "ilona.koski@example.org" };
const picture = { kind: "photo" as const, src: dataUrl(CLEAN), alt: "Frames sorted into two piles", confirmed: true as const };

async function sendWithPicture() {
  return submitWork({
    challengeId: "ch-tuulos-ml",
    talent: person,
    answer: "Split by grasp attempt.",
    explain: [
      { question: "Why split by attempt?", answer: "Frames of one attempt look alike." },
      { question: "What would you check first?", answer: "Where the threshold was chosen." },
    ],
    attachment: picture,
    shareWithSimilar: false,
  });
}

beforeEach(async () => {
  await getStore().replace(buildSeed(NOW));
});

describe("reportPicture", () => {
  it("removes the picture for every reader, keeps the written answer and tells the person", async () => {
    const proof = await sendWithPicture();
    expect(buildQueue(await getStore().read(), "co-tuulos", NOW).proofs.find((p) => p.proofId === proof.proofId)?.attachment).toBeDefined();

    await expect(reportPicture(proof.proofId, "co-tuulos", "Mira Salo")).resolves.toEqual({ proofId: proof.proofId, pictureRemoved: true });
    const data = await getStore().read();
    for (const company of data.companies) expect(JSON.stringify(buildQueue(data, company.id, NOW))).not.toContain(picture.src);
    expect(data.submissions.find((s) => s.id === proof.proofId)).toMatchObject({ answer: "Split by grasp attempt.", pictureRemoved: true });
    expect(data.submissions.find((s) => s.id === proof.proofId)?.attachment).toBeUndefined();
    const entry = buildPassport(data, person.id, NOW).find((e) => e.proof.proofId === proof.proofId);
    expect(entry?.pictureRemoved).toBe(true);
    expect(entry?.proof.attachment).toBeUndefined();
    expect(data.audit.at(-1)).toMatchObject({ actor: "human", by: "Mira Salo", action: REPORT_PICTURE_ACTION });
  });

  it("needs a named reviewer at a company that can read the proof", async () => {
    const proof = await sendWithPicture();
    await expect(reportPicture(proof.proofId, "co-tuulos", " . ")).rejects.toMatchObject({ status: 400 });
    await expect(reportPicture(proof.proofId, "co-kaari", "Anna Koivisto")).rejects.toMatchObject({ status: 403 });
    await expect(reportPicture("proof_missing", "co-tuulos", "Mira Salo")).rejects.toMatchObject({ status: 404 });
    expect((await getStore().read()).submissions.find((s) => s.id === proof.proofId)?.attachment).toBeDefined();
  });

  it("answers a second report of the same picture without a second audit line", async () => {
    const proof = await sendWithPicture();
    await reportPicture(proof.proofId, "co-tuulos", "Mira Salo");
    const lines = (await getStore().read()).audit.length;
    await expect(reportPicture(proof.proofId, "co-tuulos", "Mira Salo")).resolves.toMatchObject({ pictureRemoved: true });
    expect((await getStore().read()).audit).toHaveLength(lines);
  });
});
