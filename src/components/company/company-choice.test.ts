import { describe, expect, it } from "vitest";
import { COMPANIES } from "@/lib/seed/companies";
import { DEFAULT_COMPANY_ID, knownCompanyId } from "./company-choice";

const other = COMPANIES.find((c) => c.id !== DEFAULT_COMPANY_ID)!.id;

describe("knownCompanyId", () => {
  it("keeps a stored company the event still has", () => {
    expect(knownCompanyId(other)).toBe(other);
  });

  it("falls back to the demo company for a company that is gone, or none", () => {
    expect(knownCompanyId("co-gone")).toBe(DEFAULT_COMPANY_ID);
    expect(knownCompanyId(null)).toBe(DEFAULT_COMPANY_ID);
  });

  it("checks against the list it is given", () => {
    expect(knownCompanyId(other, [DEFAULT_COMPANY_ID])).toBe(DEFAULT_COMPANY_ID);
  });
});
