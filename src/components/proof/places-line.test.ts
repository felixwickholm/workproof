import { describe, expect, it } from "vitest";
import { fullReason, placesState } from "./places-line";

describe("places line", () => {
  it("counts the places left out of the task's places", () => {
    expect(placesState({ kind: "event" }, 7)).toEqual({ text: "7 of 12 places left", few: false, full: false });
    expect(placesState({ kind: "event", places: 20 }, 3)).toEqual({ text: "3 of 20 places left", few: true, full: false });
  });

  it("says Full at zero, and nothing for a practice task", () => {
    expect(placesState({ kind: "event" }, 0)).toEqual({ text: "Full", few: true, full: true });
    expect(placesState({ kind: "taster" }, 0)).toBeNull();
  });

  it("gives the reason Start is off, without a waiting list", () => {
    expect(fullReason({ kind: "event", places: 5 })).toBe("This challenge has all its 5 answers, so an employer can read them all. Pick another challenge.");
  });
});
