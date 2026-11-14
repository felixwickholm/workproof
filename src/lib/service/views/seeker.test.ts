import { describe, expect, it } from "vitest";
import { buildSeekerHome } from "./seeker";
import { NOW, PRIVATE, sampleEvent } from "./test-data";

const DAY = 86_400_000;

describe("seeker home", () => {
  it("greets the person by first name with the open invitation", () => {
    const home = buildSeekerHome(sampleEvent(), PRIVATE.olena, NOW);
    expect(home.greeting).toEqual({ firstName: "Olena", fact: "Kaari Home Care wants to meet you." });
    expect(home.counts).toEqual({ proofs: 2, readByPeople: 2, writtenAnswers: 2, invitations: 1 });
    expect(home.invitations).toEqual([
      {
        meetingId: "m1",
        proofId: "p1",
        proofLabel: "Proof P1",
        companyName: "Kaari Home Care",
        sector: "Home care",
        district: "Matinkylä",
        reviewer: "Anna Koivisto",
        feedback: "You saw the blood thinner risk.",
        slot: "Sat 13:00, Table 1",
        status: "invited",
        viaSecondLook: false,
      },
    ]);
    expect(home.passport.map((e) => e.proof.proofId)).toEqual(["p1", "p2"]);
  });

  it("lists every open task newest first, the same order for everyone, and marks only work already sent", () => {
    const mine = buildSeekerHome(sampleEvent(), PRIVATE.olena, NOW).tasks;
    const stranger = buildSeekerHome(sampleEvent(), "t_nobody", NOW).tasks;
    expect(mine.map((t) => t.challenge.id)).toEqual(["ch-b", "ch-pool", "ch-a"]);
    expect(stranger.map((t) => t.challenge.id)).toEqual(["ch-b", "ch-pool", "ch-a"]);
    expect(mine.map((t) => t.mine)).toEqual([true, false, true]);
    expect(stranger.every((t) => !t.mine)).toBe(true);
    const a = mine[2];
    expect(a.proofsSent).toBe(2);
    expect(a.medianReplyHours).toBe(19);
    expect(a.challenge.setAside).toEqual([]);
    expect(mine[1].companies.map((c) => c.id)).toEqual(["co-kaari", "co-kivira"]);
    expect(mine[1].medianReplyHours).toBeNull();
  });

  it("picks the next fact in order: a new answer, then proofs waiting, then the open tasks", () => {
    const data = sampleEvent();
    data.meetings[0].status = "accepted";
    expect(buildSeekerHome(data, PRIVATE.olena, NOW).greeting.fact).toBe("Otso Health wrote you an answer.");
    expect(buildSeekerHome(data, PRIVATE.olena, new Date(NOW.getTime() + 3 * DAY)).greeting.fact).toBe("Three tasks are open today.");
    expect(buildSeekerHome(data, PRIVATE.sam, new Date(NOW.getTime() + 3 * DAY)).greeting.fact).toBe("Your proof waits for a reader.");
    data.decisions = [];
    data.meetings = [];
    expect(buildSeekerHome(data, PRIVATE.olena, NOW).greeting.fact).toBe("Your two proofs wait for a reader.");
  });

  it("has no name for a visitor who has not handed in anything", () => {
    const home = buildSeekerHome(sampleEvent(), "t_nobody", NOW);
    expect(home.greeting.firstName).toBeNull();
    expect(home.counts).toEqual({ proofs: 0, readByPeople: 0, writtenAnswers: 0, invitations: 0 });
    expect(JSON.stringify(home)).not.toContain(PRIVATE.olena);
  });
});
