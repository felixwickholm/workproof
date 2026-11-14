import { describe, expect, it } from "vitest";
import { DEFAULT_COMPANY_ID, knownCompanyId } from "./company-choice";

describe("knownCompanyId", () => {
  it("keeps a stored company the event still has", () => {
    expect(knownCompanyId("co-otso")).toBe("co-otso");
  });

  it("falls back to Kaari Home Care for a company that is gone, or none", () => {
    expect(knownCompanyId("co-lumo")).toBe(DEFAULT_COMPANY_ID);
    expect(knownCompanyId(null)).toBe("co-kaari");
  });

  it("checks against the list it is given", () => {
    expect(knownCompanyId("co-otso", ["co-kaari"])).toBe("co-kaari");
  });
});
