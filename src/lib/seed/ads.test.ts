import { describe, expect, it } from "vitest";
import { draftFromNeed } from "@/lib/ai/scripted/compose";
import { draftProblems } from "@/lib/guard/check-draft";
import { SAMPLE_AD_PATHS, SAMPLE_ADS } from "./ads";
import { COMPANIES } from "./companies";

const words = (ad: (typeof SAMPLE_ADS)[number]) =>
  [ad.title, ad.facts, ad.intro, ...ad.youWill, ...ad.weLookFor].join(" ").split(/\s+/).length;

/** What the ad reader passes to the drafter: the title, then the headings and list items. */
const readAs = (ad: (typeof SAMPLE_ADS)[number]) =>
  [ad.title, "What you will do", ...ad.youWill, "What we look for", ...ad.weLookFor].join(". ");

describe("sample job ads", () => {
  it("gives each ad an invented company from the event, a unique path and 150 to 250 words", () => {
    expect(new Set(SAMPLE_AD_PATHS).size).toBe(SAMPLE_ADS.length);
    for (const ad of SAMPLE_ADS) {
      expect(COMPANIES.find((c) => c.id === ad.companyId)?.name, ad.slug).toBe(ad.company);
      expect(words(ad), ad.slug).toBeGreaterThanOrEqual(150);
      expect(words(ad), ad.slug).toBeLessThanOrEqual(250);
    }
  });

  const roles: Record<string, string> = {
    "kide-chip-verification-engineer": "chip-verification-engineer",
    "halla-ai-developer": "automation-developer",
    "saarnivo-financial-analyst": "business-analyst",
    "revontuli-marketing-specialist": "marketing",
    "tuulos-software-engineer": "ml-engineer",
  };

  it.each(SAMPLE_ADS.map((ad) => [ad.slug, ad] as const))("drafts %s into a fair challenge and sets aside the wishes about a person", (slug, ad) => {
    const draft = draftFromNeed(readAs(ad));
    expect(draft.templateId).toBe(roles[slug]);
    expect(draft.setAside.some((line) => line.startsWith("Not used:"))).toBe(true);
    expect(draftProblems(draft)).toEqual([]);
  });
});
