import { describe, expect, it } from "vitest";
import { companyName } from "@/lib/seed/companies";
import { STORY_COMPANY_ID, STORY_REVIEWER } from "@/lib/seed/story";
import { accountFor } from "./identity";
import { MODES } from "./modes";

const mode = (id: string) => MODES.find((m) => m.id === id)!;

describe("accountFor", () => {
  it("matches the demo account for the default company", () => {
    expect(accountFor(mode("employer"), { reviewer: STORY_REVIEWER, company: companyName(STORY_COMPANY_ID) })).toEqual(mode("employer").account);
  });

  it("follows the chosen company in Hiring mode", () => {
    expect(accountFor(mode("employer"), { reviewer: "Mira Salo", company: "Saarnivo Grid" })).toEqual({ name: "Mira Salo", role: "Saarnivo Grid" });
  });

  it("falls back to the company alone when no reviewer is named", () => {
    expect(accountFor(mode("employer"), { reviewer: "  ", company: "Otso Health" })).toEqual({ name: "Otso Health", role: "Hiring" });
  });

  it("keeps the fixed account in the other modes", () => {
    const employer = { reviewer: "Mira Salo", company: "Saarnivo Grid" };
    expect(accountFor(mode("seeker"), employer)).toEqual({ name: "Olena Kovalenko", role: "Demo person" });
    expect(accountFor(mode("city"), employer)).toEqual({ name: "Event organiser", role: "City of Espoo" });
  });
});
