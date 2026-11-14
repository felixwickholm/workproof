import { describe, expect, it } from "vitest";
import type { PortfolioCard } from "@/lib/domain/types";
import { eventDate, filterCards, NO_FILTER } from "./filter";

const card = (
  id: string,
  format: PortfolioCard["format"],
  skills: string[],
  title = "A task",
): PortfolioCard => ({
  id,
  event: { name: "Espoo Talent Day", date: "2026-11-14" },
  companyName: "Halla Supply",
  taskTitle: title,
  format,
  skills: skills.map((s) => ({ id: s, label: s })),
  answer: "Find parts by pump model first.",
  submittedAt: "2026-11-14T10:00:00Z",
  responses: [],
});

const cards = [
  card("c", "fix", ["data-quality"]),
  card("b", "choose", ["prioritisation", "planning"], "Choose a request"),
  card("a", "make", ["planning"]),
];

describe("filterCards", () => {
  it("keeps the given order and shows every card without a filter", () => {
    expect(filterCards(cards, NO_FILTER).map((c) => c.id)).toEqual([
      "c",
      "b",
      "a",
    ]);
  });

  it("shows a card with any picked skill, in the same order", () => {
    expect(
      filterCards(cards, {
        ...NO_FILTER,
        skills: ["planning", "data-quality"],
      }).map((c) => c.id),
    ).toEqual(["c", "b", "a"]);
    expect(
      filterCards(cards, { ...NO_FILTER, skills: ["prioritisation"] }).map(
        (c) => c.id,
      ),
    ).toEqual(["b"]);
  });

  it("narrows by kind of task and by words", () => {
    expect(
      filterCards(cards, { ...NO_FILTER, format: "make" }).map((c) => c.id),
    ).toEqual(["a"]);
    expect(
      filterCards(cards, { ...NO_FILTER, text: "choose REQUEST" }).map(
        (c) => c.id,
      ),
    ).toEqual(["b"]);
    expect(
      filterCards(cards, { ...NO_FILTER, text: "pump halla" }),
    ).toHaveLength(3);
  });
});

describe("eventDate", () => {
  it("writes the day the same everywhere", () => {
    expect(eventDate("2026-04-02")).toBe("2 Apr 2026");
  });
});
