import { beforeEach, describe, expect, it } from "vitest";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { createTaster } from "./challenges";
import { issueFollowUps } from "./follow-ups";
import { submitWork } from "./submissions";
import { acceptTableInvite, declineTableInvite, inviteFromTable, myTableInvite, TABLE_INVITE_ACTION } from "./table";
import { inviteCheck, shownNameProblem } from "./table-rules";
import { buildTableProofs } from "./views/table";

const NOW = new Date("2026-11-14T12:00:00Z");
const KEY = "t_table_test_6d1a";
const MESSAGE = "Your plan for the shared board caught my eye. I would like to hear how you check the sauce.";

/** A practice proof sent without a name, so any name found later can only have come from accepting. */
async function practiceProof() {
  const taster = await createTaster("Chef");
  const answer = "I would keep the gluten-free bread on its own board and tell the guest what is in the sauce.";
  return submitWork({
    challengeId: taster.id,
    talent: { id: KEY, name: "", contact: "" },
    answer,
    issueId: (await issueFollowUps(taster.id, answer)).issueId,
    explain: [{ answer: "One shared board undoes the rest of the plate." }],
    shareWithSimilar: false,
  });
}

const storedText = async () => JSON.stringify(await getStore().read());

beforeEach(async () => {
  await getStore().replace(buildSeed(NOW));
});

describe("inviteFromTable", () => {
  it("asks for a named host and two sentences, in the employer's words", async () => {
    const { proofId } = await practiceProof();
    await expect(inviteFromTable(proofId, { host: "Rami", message: "Come over." })).rejects.toMatchObject({ status: 400, message: "Write 1 more sentence." });
    await expect(inviteFromTable(proofId, { host: "-", message: MESSAGE })).rejects.toMatchObject({ status: 400, message: "Add your name." });
    await expect(inviteFromTable(proofId, { host: "Rami", message: MESSAGE })).resolves.toEqual({ invite: { status: "invited", host: "Rami", message: MESSAGE } });
  });

  it("sends one invitation per proof and writes it to the audit log as a person's act", async () => {
    const { proofId } = await practiceProof();
    await inviteFromTable(proofId, { host: "Rami", message: MESSAGE });
    await expect(inviteFromTable(proofId, { host: "Sara", message: MESSAGE })).rejects.toMatchObject({ status: 409 });
    const audit = (await getStore().read()).audit.filter((e) => e.action === TABLE_INVITE_ACTION);
    expect(audit).toHaveLength(1);
    expect(audit[0]).toMatchObject({ actor: "human", by: "Rami" });
  });

  it("refuses an event proof: the table's loop is for practice only", async () => {
    const event = (await getStore().read()).proofs.find((p) => !p.challengeId.startsWith("taster"));
    if (!event) throw new Error("The seed has event proofs");
    await expect(inviteFromTable(event.proofId, { host: "Rami", message: MESSAGE })).rejects.toMatchObject({ status: 409 });
  });
});

describe("the author's side", () => {
  it("lets only the author read the host's words", async () => {
    const { proofId } = await practiceProof();
    await expect(myTableInvite(proofId, KEY)).resolves.toEqual({});
    await inviteFromTable(proofId, { host: "Rami", message: MESSAGE });
    await expect(myTableInvite(proofId, KEY)).resolves.toEqual({ invite: { status: "invited", host: "Rami", message: MESSAGE } });
    await expect(myTableInvite(proofId, "t_guess")).rejects.toMatchObject({ status: 403 });
    await expect(myTableInvite(proofId, "")).rejects.toMatchObject({ status: 403 });
  });

  it("stores the first name only on accept, and only on the invitation", async () => {
    const { proofId } = await practiceProof();
    expect(await storedText()).not.toContain("Mikko");
    await inviteFromTable(proofId, { host: "Rami", message: MESSAGE });
    expect(await storedText()).not.toContain("Mikko");

    await expect(acceptTableInvite(proofId, "t_guess", "Mikko")).rejects.toMatchObject({ status: 403 });
    await expect(acceptTableInvite(proofId, KEY, " . ")).rejects.toMatchObject({ status: 400 });
    await expect(acceptTableInvite(proofId, KEY, "Mikko")).resolves.toMatchObject({ invite: { status: "accepted" } });

    const data = await getStore().read();
    expect(data.tableInvites).toEqual([expect.objectContaining({ proofId, status: "accepted", shownName: "Mikko" })]);
    expect(data.talents.some((t) => t.id === KEY)).toBe(false);
    expect(JSON.stringify(data.audit)).not.toContain("Mikko");
    expect(buildTableProofs(data).find((p) => p.proofId === proofId)?.invite).toEqual({ status: "accepted", host: "Rami", shownName: "Mikko" });
  });

  it("declines without storing anything about the person, and the answer is final", async () => {
    const { proofId } = await practiceProof();
    await inviteFromTable(proofId, { host: "Rami", message: MESSAGE });
    await expect(declineTableInvite(proofId, "t_guess")).rejects.toMatchObject({ status: 403 });
    await expect(declineTableInvite(proofId, KEY)).resolves.toMatchObject({ invite: { status: "declined" } });
    await expect(declineTableInvite(proofId, KEY)).resolves.toMatchObject({ invite: { status: "declined" } });
    await expect(acceptTableInvite(proofId, KEY, "Mikko")).rejects.toMatchObject({ status: 409 });

    const data = await getStore().read();
    expect(data.tableInvites?.[0].shownName).toBeUndefined();
    expect(JSON.stringify(data)).not.toContain("Mikko");
  });

  it("has nothing to answer before an invitation arrives", async () => {
    const { proofId } = await practiceProof();
    await expect(acceptTableInvite(proofId, KEY, "Mikko")).rejects.toMatchObject({ status: 404 });
    await expect(declineTableInvite(proofId, KEY)).rejects.toMatchObject({ status: 404 });
  });
});

describe("table rules", () => {
  it("names the first thing still missing", () => {
    expect(inviteCheck("Rami", "").waitingFor).toBe("Write your answer to the person first.");
    expect(inviteCheck("Rami", "One line here.").waitingFor).toBe("Write 1 more sentence.");
    expect(inviteCheck("", MESSAGE).waitingFor).toBe("Add your name.");
    expect(inviteCheck("Rami", MESSAGE)).toMatchObject({ sentences: 2, waitingFor: null });
  });

  it("takes a first name with a letter, up to 40 characters", () => {
    expect(shownNameProblem("Mikko")).toBeUndefined();
    expect(shownNameProblem("Ana-María")).toBeUndefined();
    expect(shownNameProblem("  ")).toBe("Type your first name to accept.");
    expect(shownNameProblem("42")).toBe("Type your first name to accept.");
    expect(shownNameProblem("A".repeat(41))).toMatch(/up to 40/);
  });
});
