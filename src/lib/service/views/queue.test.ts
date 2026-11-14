import { describe, expect, it } from "vitest";
import { buildQueue, WITHDRAWN_LINE } from "./queue";
import { NOW, sampleEvent } from "./test-data";

/** Kaari answered Mikko's proof P2 (Otso's task) through Second look. */
function answeredThroughSecondLook() {
  const data = sampleEvent();
  data.proofs.find((p) => p.proofId === "p2")!.work = "Dear patient, your result is normal.";
  data.decisions.push({ id: "d4", proofId: "p2", companyId: "co-kaari", reviewer: "Anna Koivisto", decision: "meet", feedback: "Clear letter. We would like to talk about plain language.", decidedAt: "2026-11-14T11:00:00.000Z" });
  data.meetings.push({ id: "m4", proofId: "p2", companyId: "co-kaari", slot: "Sat 13:15, Table 1", status: "invited", talentConfirmedMet: false, companyConfirmedMet: false });
  return data;
}

const kaariEntry = (data: ReturnType<typeof sampleEvent>) => buildQueue(data, "co-kaari", NOW).decided.find((d) => d.proof.proofId === "p2");

describe("buildQueue after a Second look withdrawal", () => {
  it("shows the Second look employer the full proof while consent stands", () => {
    const entry = kaariEntry(answeredThroughSecondLook());
    expect(entry?.withdrawn).toBeUndefined();
    expect(entry?.proof.work).toBe("Dear patient, your result is normal.");
  });

  it("keeps the decision and feedback but replaces the proof with the withdrawal line", () => {
    const data = answeredThroughSecondLook();
    data.submissions.find((s) => s.id === "p2")!.shareWithSimilar = false;
    const entry = kaariEntry(data);
    expect(entry?.withdrawn).toBe(true);
    expect(entry?.decision.feedback).toBe("Clear letter. We would like to talk about plain language.");
    expect(entry?.proof).toMatchObject({ label: "Proof P2", work: WITHDRAWN_LINE, explain: [], skills: [], glance: "" });
    expect(entry?.proof.attachment).toBeUndefined();
    expect(JSON.stringify(entry)).not.toContain("result is normal");
  });

  it("keeps the proof readable once the person accepted that employer's meeting, and for the owner", () => {
    const data = answeredThroughSecondLook();
    data.submissions.find((s) => s.id === "p2")!.shareWithSimilar = false;
    data.meetings.find((m) => m.id === "m4")!.status = "accepted";
    expect(kaariEntry(data)?.withdrawn).toBeUndefined();
    expect(kaariEntry(data)?.proof.work).toBe("Dear patient, your result is normal.");
    const owner = buildQueue(data, "co-otso", NOW).decided.find((d) => d.proof.proofId === "p2");
    expect(owner?.withdrawn).toBeUndefined();
    expect(owner?.proof.work).toBe("Dear patient, your result is normal.");
  });
});
