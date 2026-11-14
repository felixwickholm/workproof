import { describe, expect, it } from "vitest";
import { choosePlaces, DEFAULT_PLACES, fullTaskMessage, placesLeft, placesOf, readingMinutes } from "./places";

describe("places", () => {
  it("gives a task 12 places unless the employer chose 5 to 30", () => {
    expect(choosePlaces()).toBe(DEFAULT_PLACES);
    expect(choosePlaces(20)).toBe(20);
    expect(choosePlaces(2)).toBe(5);
    expect(choosePlaces(400)).toBe(30);
    expect(choosePlaces(Number.NaN)).toBe(DEFAULT_PLACES);
  });

  it("has no limit for a practice task", () => {
    expect(placesOf({ kind: "taster", places: 5 })).toBeNull();
    expect(placesLeft({ kind: "taster" }, 400)).toBeNull();
  });

  it("counts the places left and never goes below zero", () => {
    expect(placesLeft({ kind: "event" }, 9)).toBe(3);
    expect(placesLeft({ kind: "event", places: 5 }, 5)).toBe(0);
    expect(placesLeft({ kind: "event", places: 5 }, 7)).toBe(0);
  });

  it("says a full task is full, with no waiting list", () => {
    expect(fullTaskMessage(12)).toBe("This task has all its 12 answers. Choose another task.");
    expect(fullTaskMessage(12)).not.toMatch(/waiting list/i);
  });

  it("estimates reading time at 4 minutes a proof", () => {
    expect(readingMinutes(6)).toBe(24);
    expect(readingMinutes(0)).toBe(0);
  });
});
