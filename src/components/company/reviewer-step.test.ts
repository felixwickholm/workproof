import { describe, expect, it } from "vitest";
import { NAMED_PERSON_NEEDED } from "@/lib/domain/guardrails";
import { addReviewerLabel, reviewerStanding } from "./reviewer-step";

const KAARI = ["Anna Koivisto"];

describe("reviewerStanding", () => {
  it("lets a registered name decide, whatever its spacing or case", () => {
    expect(reviewerStanding(KAARI, "  anna   KOIVISTO ")).toEqual({ kind: "registered" });
  });

  it("offers the one-tap step to a person who is not registered", () => {
    expect(reviewerStanding(KAARI, "Eeva Example")).toEqual({ kind: "unregistered" });
  });

  it("refuses a name that reads as software with the server's sentence", () => {
    expect(reviewerStanding(KAARI, "AI bot")).toEqual({ kind: "refused", reason: NAMED_PERSON_NEEDED });
    expect(reviewerStanding(KAARI, "x")).toEqual({ kind: "refused", reason: NAMED_PERSON_NEEDED });
  });

  it("says nothing while the name is empty", () => {
    expect(reviewerStanding(KAARI, "  ")).toEqual({ kind: "none" });
  });

  it("trusts the server's 403 over a stale list on the screen", () => {
    expect(reviewerStanding(KAARI, "Anna Koivisto", "Anna Koivisto")).toEqual({ kind: "unregistered" });
    expect(reviewerStanding(KAARI, "Anna Koivisto", "Someone Else")).toEqual({ kind: "registered" });
  });
});

describe("addReviewerLabel", () => {
  it("names the company", () => {
    expect(addReviewerLabel("Kaari Home Care")).toBe("Add me as a reviewer for Kaari Home Care");
  });
});
