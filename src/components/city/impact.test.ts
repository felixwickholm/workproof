import { describe, expect, it } from "vitest";
import type { ImpactCounts, TaskImpact } from "@/lib/domain/types";
import {
  followUpSentence,
  funnelSteps,
  greeting,
  shareInWords,
  sortTasks,
  taskState,
  tasksFor,
  topEntryLine,
} from "./impact";

const counts = (c: Partial<ImpactCounts> = {}): ImpactCounts => ({ took: 0, scored: 0, invited: 0, agreed: 0, met: 0, followUps: 0, hires: 0, ...c });

const task = (title: string, c: Partial<TaskImpact> = {}): TaskImpact => ({
  challengeId: title.toLowerCase(),
  title,
  companies: ["Kaari Home Care"],
  topTotal: null,
  scoredShare: 0,
  ...counts(),
  ...c,
});

describe("shareInWords", () => {
  it("says a part of a whole as a plain fraction", () => {
    expect(shareInWords(40, 61)).toBe("about 2 in 3");
    expect(shareInWords(5, 61)).toBe("about 1 in 12");
    expect(shareInWords(5, 5)).toBe("all");
    expect(shareInWords(0, 5)).toBe("none");
    expect(shareInWords(3, 0)).toBe("none");
  });
});

describe("funnelSteps", () => {
  it("lists the six steps in order, each with its share of the step before", () => {
    const steps = funnelSteps(counts({ took: 61, scored: 40, invited: 20, agreed: 12, met: 10, followUps: 9 }));
    expect(steps.map((s) => s.label)).toEqual(["Took a challenge", "Scored by a company", "Invited", "Said yes", "Talked at the event", "Follow-up agreed"]);
    expect(steps.map((s) => s.value)).toEqual([61, 40, 20, 12, 10, 9]);
    expect(steps[0].share).toBeNull();
    expect(steps[1].share).toBe("about 2 in 3");
    expect(steps[2].share).toBe("about 1 in 2");
  });
  it("gives no share when a step counts more than the one before", () => {
    expect(funnelSteps(counts({ took: 47, scored: 2, invited: 10 }))[2].share).toBeNull();
  });
});

describe("greeting and followUpSentence", () => {
  it("names the event and today's facts from the data", () => {
    expect(greeting("Espoo Talent Day", counts({ took: 61, agreed: 9 }))).toBe("Espoo Talent Day. 61 pieces of work done. 9 talks are agreed.");
    expect(greeting("Espoo Talent Day", counts({ took: 1, agreed: 1 }))).toBe("Espoo Talent Day. 1 piece of work done. 1 talk is agreed.");
    expect(greeting("Espoo Talent Day", counts({ took: 4 }))).toBe("Espoo Talent Day. 4 pieces of work done. No talk is agreed yet.");
    expect(greeting("Espoo Talent Day", counts())).toBe("Espoo Talent Day. No work is done yet.");
  });
  it("states the follow-up talks, or that none are agreed yet", () => {
    expect(followUpSentence(9)).toBe("9 follow-up talks came out of this event. Companies marked each one.");
    expect(followUpSentence(1)).toBe("1 follow-up talk came out of this event. Companies marked each one.");
    expect(followUpSentence(0)).toBe("No follow-up talk is agreed yet. Companies mark each one after the talk.");
  });
});

describe("sortTasks and tasksFor", () => {
  it("puts the most work first, then the most scored, then the title", () => {
    const sorted = sortTasks([task("B", { took: 3, scored: 1 }), task("A", { took: 3, scored: 1 }), task("C", { took: 3, scored: 2 }), task("D", { took: 9 })]);
    expect(sorted.map((t) => t.title)).toEqual(["D", "C", "A", "B"]);
  });
  it("keeps one company's challenges, including shared ones", () => {
    const tasks = [task("A"), task("B", { companies: ["Otso Health"] }), task("C", { companies: ["Kaari Home Care", "Otso Health"] })];
    expect(tasksFor(tasks, "Otso Health").map((t) => t.title)).toEqual(["B", "C"]);
    expect(tasksFor(tasks, null)).toHaveLength(3);
  });
});

describe("taskState", () => {
  it("says how much work waits for a score and how long the oldest waited", () => {
    expect(taskState({ took: 5, scored: 2 }, 50)).toBe("3 wait for a score · oldest 2 days");
    expect(taskState({ took: 5, scored: 4 }, 3)).toBe("1 waits for a score · oldest less than a day");
    expect(taskState({ took: 5, scored: 2 }, null)).toBe("3 wait for a score");
    expect(taskState({ took: 5, scored: 5 }, null)).toBe("All scored");
    expect(taskState({ took: 0, scored: 0 }, null)).toBe("No work yet");
  });
});

describe("topEntryLine", () => {
  it("shows the work's label and its total out of 10, never a name", () => {
    expect(topEntryLine({ proofLabel: "Proof K7", total: 9 })).toBe("Work K7 · 9.0 of 10");
  });
});
