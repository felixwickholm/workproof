import { describe, expect, it } from "vitest";
import { findJudgement } from "@/lib/guard/no-judgement";
import { REVIEWERS } from "./companies";
import { mikkoHistory } from "./history";
import { PEOPLE } from "./people";

describe("mikkoHistory", () => {
  const now = new Date("2026-11-14T10:00:00Z");
  const history = mikkoHistory(now, "t_test");

  it("gives Mikko four earlier tasks across two Espoo events, all before now", () => {
    expect(history).toHaveLength(4);
    expect(new Set(history.map((w) => w.event.name)).size).toBe(2);
    expect(
      history.every(
        (w) => w.talentId === "t_test" && w.submittedAt < now.toISOString(),
      ),
    ).toBe(true);
  });

  it("has a registered reviewer and real written feedback on each, and Meet as well as Not now", () => {
    const reviewers = Object.values(REVIEWERS);
    for (const w of history) {
      expect(reviewers).toContain(w.reviewer);
      expect(w.feedback.trim().split(/\s+/).length).toBeGreaterThanOrEqual(4);
      expect(w.feedback.length).toBeGreaterThanOrEqual(20);
    }
    expect(new Set(history.map((w) => w.decision))).toEqual(
      new Set(["meet", "pass"]),
    );
  });

  it("keeps her identity and any judging phrase out of the words", () => {
    const words = history.flatMap((w) => [w.answer, w.taskTitle]);
    for (const text of words) {
      expect(text).not.toContain(PEOPLE.mikko.name.split(" ")[0]);
      expect(findJudgement(text)).toEqual([]);
    }
  });
});
