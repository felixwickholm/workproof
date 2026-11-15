import { describe, expect, it } from "vitest";
import type { Meeting, Submission } from "@/lib/domain/types";
import { MEETING_TABLES, parseSlot, pickMeetingSlot, SLOT_TIMES_OF_DAY, TIME_TO_BE_AGREED } from "./decisions";

const submission = (id: string, talentId: string): Submission => ({
  id,
  challengeId: "c",
  talentId,
  answer: "a",
  explain: [],
  shareWithSimilar: false,
  submittedAt: "2026-11-14T08:00:00Z",
});

/** A small store: proofs by two people, and the meetings already placed. */
function store(meetings: Meeting[] = [], extra: Submission[] = []) {
  return {
    event: { name: "Test day", date: "2026-11-14", responseWindowHours: 48 },
    submissions: [submission("p1", "t_mikko"), submission("p2", "t_mikko"), submission("p3", "t_sam"), submission("p4", "t_sam"), ...extra],
    meetings,
  };
}

/** Places an invitation the way `decide` does, so the next pick sees it. */
function invite(data: ReturnType<typeof store>, proofId: string, companyId: string, status: Meeting["status"] = "invited"): Meeting {
  const meeting: Meeting = { id: `m_${data.meetings.length}`, proofId, companyId, slot: pickMeetingSlot(data, proofId, companyId), status, talentConfirmedMet: false, companyConfirmedMet: false };
  data.meetings.push(meeting);
  return meeting;
}

describe("pickMeetingSlot", () => {
  it("proposes the first slot of the event day, named by its weekday", () => {
    expect(pickMeetingSlot(store(), "p1", "co-halla")).toBe("Sat 13:00, Table 1");
    expect(SLOT_TIMES_OF_DAY).toHaveLength(16);
    expect(SLOT_TIMES_OF_DAY.at(-1)).toBe("16:45");
  });

  it("never gives one person two meetings at the same time", () => {
    const data = store();
    const halla = invite(data, "p1", "co-halla");
    const otso = invite(data, "p2", "co-otso");
    expect(parseSlot(halla.slot)?.time).not.toBe(parseSlot(otso.slot)?.time);
  });

  it("never gives one company two meetings at the same time and table, and other companies take the free tables", () => {
    const data = store();
    const first = invite(data, "p1", "co-halla");
    const second = invite(data, "p3", "co-halla");
    const other = invite(data, "p4", "co-otso");
    expect(first.slot).toBe("Sat 13:00, Table 1");
    expect(second.slot).toBe("Sat 13:15, Table 1");
    expect(other.slot).toBe("Sat 13:00, Table 2");
  });

  it("frees the slot of a declined invitation", () => {
    const data = store();
    invite(data, "p1", "co-halla", "declined");
    expect(invite(data, "p3", "co-halla").slot).toBe("Sat 13:00, Table 1");
  });

  it("is the same for the same store", () => {
    const data = store([{ id: "m", proofId: "p1", companyId: "co-halla", slot: "Sat 13:00, Table 1", status: "accepted", talentConfirmedMet: false, companyConfirmedMet: false }]);
    expect(pickMeetingSlot(data, "p3", "co-otso")).toBe(pickMeetingSlot(data, "p3", "co-otso"));
  });

  it("keeps every (time, table) unique when the day fills up, then asks to agree a time", () => {
    const people = Array.from({ length: SLOT_TIMES_OF_DAY.length * MEETING_TABLES + 3 }, (_, i) => submission(`x${i}`, `t_${i}`));
    const data = store([], people);
    const slots = people.map((p, i) => invite(data, p.id, `co-${i % 7}`).slot);
    const placed = slots.filter((s) => s !== TIME_TO_BE_AGREED);
    expect(new Set(placed).size).toBe(placed.length);
    expect(placed.length).toBeLessThanOrEqual(SLOT_TIMES_OF_DAY.length * MEETING_TABLES);
    expect(slots.at(-1)).toBe(TIME_TO_BE_AGREED);
  });

  it("says 'Time to be agreed' when the person has no free time left", () => {
    const own = SLOT_TIMES_OF_DAY.map((_, i) => submission(`o${i}`, "t_busy"));
    const data = store([], [...own, submission("o_last", "t_busy")]);
    for (const [i, s] of own.entries()) invite(data, s.id, `co-${i}`);
    expect(pickMeetingSlot(data, "o_last", "co-new")).toBe(TIME_TO_BE_AGREED);
  });
});
