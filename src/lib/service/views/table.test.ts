import { describe, expect, it } from "vitest";
import type { StoreData } from "@/lib/store";
import { buildTableProofs } from "./table";
import { PRIVATE, sampleEvent } from "./test-data";

const withInvite = (invite: NonNullable<StoreData["tableInvites"]>[number]): StoreData => ({ ...sampleEvent(), tableInvites: [invite] });

describe("buildTableProofs", () => {
  it("lists only practice proofs, newest first", () => {
    const proofs = buildTableProofs(sampleEvent());
    expect(proofs.map((p) => p.proofId)).toEqual(["p5"]);
  });

  it("is a label, a task and a kind: no work, no follow-up, no hidden count, no identity", () => {
    const [row] = buildTableProofs(sampleEvent());
    expect(Object.keys(row).sort()).toEqual(["label", "proofId", "proofKind", "submittedAt", "taskTitle"]);
    const json = JSON.stringify(buildTableProofs(sampleEvent()));
    for (const key of Object.values(PRIVATE)) expect(json).not.toContain(key);
  });

  it("shows who invited, and no name while the person has not said yes", () => {
    const [row] = buildTableProofs(withInvite({ proofId: "p5", host: "Rami", message: "Two lines. For the person only.", status: "invited", invitedAt: "2026-11-14T10:00:00.000Z" }));
    expect(row.invite).toEqual({ status: "invited", host: "Rami" });
    expect(JSON.stringify(row)).not.toContain("For the person only");
  });

  it("shows the first name once the person accepted", () => {
    const [row] = buildTableProofs(withInvite({ proofId: "p5", host: "Rami", message: "x", status: "accepted", shownName: "Mikko", invitedAt: "2026-11-14T10:00:00.000Z" }));
    expect(row.invite).toEqual({ status: "accepted", host: "Rami", shownName: "Mikko" });
  });

  it("loads data saved before the table could invite", () => {
    const old: StoreData = sampleEvent();
    delete old.tableInvites;
    expect(buildTableProofs(old)[0].invite).toBeUndefined();
  });
});
