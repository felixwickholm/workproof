import { describe, expect, it } from "vitest";
import { createBudget } from "./budget";

describe("live call budget", () => {
  it("allows calls up to the number at once and frees a place when one ends", () => {
    const budget = createBudget({ perMinute: 10, atOnce: 2 }, () => 0);
    const first = budget.take();
    const second = budget.take();
    expect(first).toBeDefined();
    expect(second).toBeDefined();
    expect(budget.take()).toBeUndefined();
    first?.();
    expect(budget.take()).toBeDefined();
  });

  it("counts a release only once", () => {
    const budget = createBudget({ perMinute: 10, atOnce: 1 }, () => 0);
    const release = budget.take();
    release?.();
    release?.();
    expect(budget.take()).toBeDefined();
    expect(budget.take()).toBeUndefined();
  });

  it("stops at the per-minute count and starts again in the next minute", () => {
    let now = 0;
    const budget = createBudget({ perMinute: 3, atOnce: 10 }, () => now);
    for (let i = 0; i < 3; i++) budget.take()?.();
    expect(budget.take()).toBeUndefined();
    now = 59_999;
    expect(budget.take()).toBeUndefined();
    now = 60_000;
    expect(budget.take()).toBeDefined();
  });
});
