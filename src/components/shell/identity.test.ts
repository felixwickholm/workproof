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

  it("follows the chosen company in the Company view", () => {
    expect(accountFor(mode("employer"), { reviewer: "Mira Salo", company: "Saarnivo Grid" })).toEqual({ name: "Mira Salo", role: "Saarnivo Grid" });
  });

  it("falls back to the company alone when no reviewer is named", () => {
    expect(accountFor(mode("employer"), { reviewer: "  ", company: "Otso Health" })).toEqual({ name: "Otso Health", role: "Company" });
  });

  it("keeps the fixed account in the other modes", () => {
    const employer = { reviewer: "Mira Salo", company: "Saarnivo Grid" };
    expect(accountFor(mode("seeker"), employer)).toMatchObject({ name: "Mikko Lahtinen", role: "Job seeker" });
    expect(accountFor(mode("city"), employer)).toEqual(mode("city").account);
  });

  it("shows the job seeker their own picture on their own account card", () => {
    expect(accountFor(mode("seeker"), { reviewer: "Mira Salo", company: "Saarnivo Grid" }).avatar).toMatch(/^\/people\/s\d+\.svg$/);
  });

  it("shows a reviewer's own picture in the Company view", () => {
    expect(accountFor(mode("employer"), { reviewer: "Mira Salo", company: "Saarnivo Grid", avatar: "/people/mira-salo.svg" })).toEqual({
      name: "Mira Salo",
      role: "Saarnivo Grid",
      avatar: "/people/mira-salo.svg",
    });
    expect(accountFor(mode("employer"), { reviewer: " ", company: "Otso Health", avatar: "/people/x.svg" }).avatar).toBeUndefined();
  });
});
