import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/client/api";
import { companyErrorText, firstLine, proofHref } from "./format";

describe("firstLine", () => {
  it("skips empty lines and trims", () => {
    expect(firstLine("\n  \n  Keep in the morning:\n- A 08:00")).toBe("Keep in the morning:");
    expect(firstLine("")).toBe("");
  });
});

describe("companyErrorText", () => {
  it("shows the API's own words for a validation error", () => {
    expect(companyErrorText(new ApiError("Feedback needs at least 4 words", 400))).toBe("Feedback needs at least 4 words");
  });

  it("uses plain words for anything else", () => {
    expect(companyErrorText(new ApiError("boom", 500))).toBe("Something went wrong on our side. Try again.");
  });
});

describe("proofHref", () => {
  it("encodes the id", () => {
    expect(proofHref("p 1")).toBe("/company/review/p%201");
  });
});
