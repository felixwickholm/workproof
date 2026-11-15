import { describe, expect, it } from "vitest";
import { NAMED_PERSON_NEEDED } from "@/lib/domain/guardrails";
import { addReviewerLabel, reviewerStanding } from "./reviewer-step";

const HALLA = ["Laura Niemi"];

describe("reviewerStanding", () => {
  it("lets a registered name decide, whatever its spacing or case", () => {
    expect(reviewerStanding(HALLA, "  laura   NIEMI ")).toEqual({ kind: "registered" });
  });

  it("offers the one-tap step to a person who is not registered", () => {
    expect(reviewerStanding(HALLA, "Eeva Example")).toEqual({ kind: "unregistered" });
  });

  it("refuses a name that reads as software with the server's sentence", () => {
    expect(reviewerStanding(HALLA, "AI bot")).toEqual({ kind: "refused", reason: NAMED_PERSON_NEEDED });
    expect(reviewerStanding(HALLA, "x")).toEqual({ kind: "refused", reason: NAMED_PERSON_NEEDED });
  });

  it("says nothing while the name is empty", () => {
    expect(reviewerStanding(HALLA, "  ")).toEqual({ kind: "none" });
  });

  it("trusts the server's 403 over a stale list on the screen", () => {
    expect(reviewerStanding(HALLA, "Laura Niemi", "Laura Niemi")).toEqual({ kind: "unregistered" });
    expect(reviewerStanding(HALLA, "Laura Niemi", "Someone Else")).toEqual({ kind: "registered" });
  });
});

describe("addReviewerLabel", () => {
  it("names the company", () => {
    expect(addReviewerLabel("Halla Supply")).toBe("Add me as a reviewer for Halla Supply");
  });
});
