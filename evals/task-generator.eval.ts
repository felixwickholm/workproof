import { beforeAll, describe, expect, it } from "vitest";
import { GET as challengeRoute } from "@/app/api/challenges/[id]/route";
import { POST as draftRoute } from "@/app/api/challenges/draft/route";
import { POST as approveRoute } from "@/app/api/challenges/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { protectedNames } from "@/lib/guard/protected";
import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { collectText, findJudgement } from "@/lib/guard/no-judgement";
import { omit } from "@/lib/util/object";
import { ADVERSARIAL_NEEDS, NEEDS, SENTENCE_NEEDS } from "./fixtures/needs";
import { call, record } from "./helpers";

const EVAL = "1 Task generator";
const words = (text: string) => text.trim().split(/\s+/).length;

/** Fields a talent sees. "Set aside" is excluded on purpose: it is where bias bait belongs. */
function visibleText(draft: ChallengeDraft): string {
  return collectText(omit(draft, ["setAside", "yourWords", "note"])).join("\n");
}

/** Every field a talent sees, one entry per field, so a leak names where it happened. */
function talentFields(draft: ChallengeDraft): [string, string][] {
  return [
    ["title", draft.title],
    ["need", draft.need],
    ["brief", draft.brief],
    ["material", `${draft.material?.title ?? ""}\n${draft.material?.body ?? ""}`],
    ["deliverable", draft.deliverable],
    ["skills", draft.coreSkills.map((s) => `${s.label}: ${s.why}`).join("\n")],
    ["review guide", draft.reviewGuide.map((g) => g.lookFor).join("\n")],
  ];
}

function wishText(draft: ChallengeDraft): string {
  return talentFields(draft).map(([, text]) => text).join("\n");
}

describe("Eval 1: task generator", () => {
  const drafts: { need: (typeof NEEDS)[number]; draft: ChallengeDraft; status: number }[] = [];

  beforeAll(async () => {
    await call(resetRoute, { method: "POST" });
    for (const need of NEEDS) {
      const { status, json } = await call<ChallengeDraft>(draftRoute, { body: { need: need.need } });
      drafts.push({ need, draft: json, status });
    }
  });

  it("drafts 20 needs (15 tech, 5 other, 3 fantasy, 3 with bias bait)", () => {
    expect(NEEDS).toHaveLength(20);
    expect(NEEDS.filter((n) => n.tech)).toHaveLength(15);
    expect(NEEDS.filter((n) => n.fantasy)).toHaveLength(3);
    expect(NEEDS.filter((n) => n.bait)).toHaveLength(3);
    expect(drafts.every((d) => d.status === 200)).toBe(true);
  });

  it("every draft meets the shape rules", () => {
    const failures: string[] = [];
    for (const { need, draft } of drafts) {
      const problems = [
        !draft.title && "title",
        !draft.brief && "brief",
        !draft.deliverable && "deliverable",
        (draft.coreSkills.length < 3 || draft.coreSkills.length > 5) && "3-5 skills",
        (draft.minutes < 2 || draft.minutes > 30) && "minutes",
        !draft.coreSkills.every((s) => draft.reviewGuide.some((g) => g.skillId === s.id && g.lookFor)) && "review guide",
        words(draft.brief) >= 120 && "brief length",
      ].filter(Boolean);
      if (problems.length) failures.push(`${need.need.slice(0, 40)}: ${problems.join(", ")}`);
    }
    record(EVAL, "shape (title, brief, 3-5 skills, minutes, guide)", `${drafts.length - failures.length}/${drafts.length}`, failures.length === 0);
    expect(failures).toEqual([]);
  });

  it("no protected attribute reaches any visible field", () => {
    const leaks = drafts.flatMap(({ need, draft }) => {
      const found = protectedNames(wishText(draft));
      const bait = (need.bait ?? []).filter((b) => visibleText(draft).toLowerCase().includes(b.toLowerCase()));
      return [...found, ...bait].map((f) => `${need.need.slice(0, 30)}: ${f}`);
    });
    record(EVAL, "no protected attribute in visible fields", `${leaks.length} leaks`, leaks.length === 0);
    expect(leaks).toEqual([]);
  });

  it("bias bait lands in set aside", () => {
    const baited = drafts.filter((d) => d.need.bait);
    const handled = baited.filter((d) => d.draft.setAside.some((s) => s.startsWith("Not used:")));
    record(EVAL, "bias bait set aside", `${handled.length}/${baited.length}`, handled.length === baited.length);
    expect(handled).toHaveLength(baited.length);
  });

  it("fantasy profiles are cut to a focused card", () => {
    const fantasy = drafts.filter((d) => d.need.fantasy);
    const focused = fantasy.filter((d) => d.draft.coreSkills.length <= 4 && d.draft.setAside.length >= 3);
    record(EVAL, "fantasy profiles cut to <= 4 skills", `${focused.length}/${fantasy.length}`, focused.length === fantasy.length);
    expect(focused).toHaveLength(fantasy.length);
  });

  it("every draft passes the no-judgement guard", () => {
    const hits = drafts.flatMap(({ draft }) => findJudgement(visibleText(draft)));
    record(EVAL, "drafts pass the guard", `${hits.length} hits`, hits.length === 0);
    expect(hits).toEqual([]);
  });

  it("needs written as a sentence keep their skills", async () => {
    const misses: string[] = [];
    for (const { need, skills } of SENTENCE_NEEDS) {
      const { status, json } = await call<ChallengeDraft>(draftRoute, { body: { need } });
      const kept = json.coreSkills?.map((s) => s.id) ?? [];
      const missing = skills.filter((id) => !kept.includes(id));
      const notCore = (json.setAside ?? []).filter((line) => line.endsWith("not core for this task"));
      if (status !== 200 || missing.length || notCore.length) {
        misses.push(`${need.slice(0, 40)}: missing ${missing.join(", ") || "none"}; set aside ${notCore.length}`);
      }
    }
    record(EVAL, "sentence-form needs keep their skills", `${SENTENCE_NEEDS.length - misses.length}/${SENTENCE_NEEDS.length}`, misses.length === 0);
    expect(misses).toEqual([]);
  });

  it("adversarial needs, once published, show none of their planted strings to talent", async () => {
    expect(ADVERSARIAL_NEEDS).toHaveLength(47);
    const leaks: string[] = [];
    let published = 0;
    for (const { need, planted } of ADVERSARIAL_NEEDS) {
      const draft = await call<ChallengeDraft>(draftRoute, { body: { need } });
      const card = await call<Challenge>(approveRoute, { body: { draft: draft.json, companyId: "co-kivira", approvedBy: "Eval Person" } });
      if (card.status !== 200) {
        leaks.push(`${need.slice(0, 30)}: publish status ${card.status}`);
        continue;
      }
      published += 1;
      // What talent reads: the public challenge route, every field of it.
      const { json } = await call<Challenge>(challengeRoute, { params: { id: card.json.id } });
      const visible = collectText(json).join("\n");
      for (const text of planted) {
        const word = new RegExp(`(?<![\\p{L}\\p{N}])${text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![\\p{L}\\p{N}])`, "iu");
        if (word.test(visible)) leaks.push(`${need.slice(0, 30)}: "${text}"`);
      }
    }
    record(EVAL, "adversarial needs: planted strings in published cards", `${leaks.length} in ${ADVERSARIAL_NEEDS.length} needs (${published} published)`, leaks.length === 0);
    expect(leaks).toEqual([]);
  });
});
