import { describe, expect, it } from "vitest";
import type { ChoiceOption } from "@/lib/domain/types";
import { composeAnswer, READ_LIMIT, workReady } from "./answer";

const options: ChoiceOption[] = [
  { id: "a", title: "The courier's day", body: "Fast cuts." },
  { id: "b", title: "One customer, one problem", body: "A story." },
];

describe("work answer", () => {
  it("needs what each format asks for", () => {
    expect(workReady("choose", { main: "" })).toBe(false);
    expect(workReady("choose", { main: "", choice: "a" })).toBe(true);
    expect(workReady("fix", { main: "x" })).toBe(false);
    expect(workReady("fix", { main: "x", marked: "Travel: 42 000" })).toBe(true);
    expect(workReady("read", { main: "y".repeat(READ_LIMIT) })).toBe(true);
    expect(workReady("read", { main: "y".repeat(READ_LIMIT + 1) })).toBe(false);
    expect(workReady("make", { main: "  " })).toBe(false);
  });

  it("writes the pick, the marked part and the fields out, so the text stands alone", () => {
    expect(composeAnswer("choose", { choice: "b", main: "People share stories." }, options)).toBe("I pick B: One customer, one problem.\n\nPeople share stories.");
    expect(composeAnswer("choose", { choice: "a", main: "" }, options)).toBe("I pick A: The courier's day.");
    expect(composeAnswer("fix", { marked: "Travel: 42 000", main: "It should be 24 000." })).toBe("What is wrong: Travel: 42 000\n\nThe fix: It should be 24 000.");
    expect(composeAnswer("read", { main: "Use drops at weekends.", next: "" })).toBe("The one thing: Use drops at weekends.");
    expect(composeAnswer("read", { main: "A", next: "B" })).toBe("The one thing: A\n\nWhat I would check next: B");
    expect(composeAnswer("make", { main: " plan " })).toBe("plan");
  });
});
