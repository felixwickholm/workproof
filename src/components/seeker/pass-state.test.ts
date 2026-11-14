import { describe, expect, it } from "vitest";
import type { Meeting, PassportEntry } from "@/lib/domain/types";
import { passportCounts, passState, proofTimeline } from "./pass-state";

type Response = PassportEntry["responses"][number];

function entry(responses: Response[], kind: "event" | "taster" = "event") {
  return {
    challenge: { id: "c", title: "T", minutes: 20, format: "plan" as const, kind },
    responses,
    seenByHumans: responses.length,
    proof: { submittedAt: "2026-11-14T08:00:00.000Z" },
  };
}

const meeting = (status: Meeting["status"], both = false): Meeting => ({
  id: "m",
  proofId: "p",
  companyId: "co",
  slot: "Sat 13:00",
  status,
  talentConfirmedMet: both,
  companyConfirmedMet: both,
});

const pass: Response = { companyName: "Kirkas", decision: "pass", feedback: "Needs a licence.", viaSecondLook: false };
const meet = (status: Meeting["status"], both = false): Response => ({
  companyName: "Kaari",
  decision: "meet",
  feedback: "Let us meet.",
  viaSecondLook: false,
  meeting: meeting(status, both),
});

describe("pass state", () => {
  it("waits for a reader until a person answers", () => {
    expect(passState(entry([])).label).toBe("Waiting for a reader");
  });

  it("says not now with a reason, in a neutral tone", () => {
    expect(passState(entry([pass]))).toEqual({ id: "not-now", label: "Not now, with a reason", tone: "neutral" });
  });

  it("takes the furthest step any company reached", () => {
    expect(passState(entry([pass, meet("invited")])).id).toBe("invited");
    expect(passState(entry([meet("invited"), meet("accepted")])).id).toBe("accepted");
    expect(passState(entry([meet("accepted", true)])).id).toBe("met");
    expect(passState(entry([meet("met")])).label).toBe("Met");
  });

  it("says the person declined, in a neutral tone, unless another invitation is still open or further", () => {
    expect(passState(entry([pass, meet("declined")]))).toEqual({ id: "declined", label: "You said not now to the invitation", tone: "neutral" });
    expect(passState(entry([meet("declined"), meet("invited")])).id).toBe("invited");
    expect(passState(entry([meet("accepted"), meet("declined")])).id).toBe("accepted");
  });

  it("marks practice proofs, which no company reads", () => {
    expect(passState(entry([], "taster")).id).toBe("practice");
  });
});

describe("proof timeline", () => {
  it("marks each step reached, with the time it was sent", () => {
    const steps = proofTimeline(entry([meet("accepted")]));
    expect(steps.map((s) => [s.label, s.done])).toEqual([
      ["Sent", true],
      ["Read by a person", true],
      ["Answered", true],
      ["Invited", true],
      ["Accepted", true],
      ["Met", false],
    ]);
    expect(steps[0].at).toBe("2026-11-14T08:00:00.000Z");
  });

  it("marks a declined invitation as invited, never accepted", () => {
    const done = proofTimeline(entry([meet("declined")])).filter((s) => s.done).map((s) => s.label);
    expect(done).toEqual(["Sent", "Read by a person", "Answered", "Invited"]);
  });

  it("stops at Sent while nobody has read it", () => {
    expect(proofTimeline(entry([])).filter((s) => s.done).map((s) => s.label)).toEqual(["Sent"]);
  });
});

describe("passport counts", () => {
  it("counts proofs, written answers and invitations", () => {
    expect(passportCounts([entry([pass, meet("invited")]), entry([])])).toBe("2 proofs · 2 written reasons · 1 invitation");
    expect(passportCounts([entry([pass])])).toBe("1 proof · 1 written reason · 0 invitations");
  });
});
