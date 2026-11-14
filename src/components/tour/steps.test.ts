import { describe, expect, it } from "vitest";
import { fillRoute, resolveRoute } from "./resolve-route";
import { chapterLabel, chapterStart, CHAPTERS, END_ACTIONS, minuteSteps, STORY_PROOF, startIndexOf, storySteps } from "./steps";
import { STORY_CHALLENGE, STORY_COMPANY, STORY_PROOF_SEED } from "./story-ids";
import { usesTalentKey, warmCalls } from "./warm";
import { companyName, COMPANIES } from "@/lib/seed/companies";
import { SEED_CHALLENGES } from "@/lib/seed/challenges";
import { PEOPLE } from "@/lib/seed/people";
import { STORY_DECISION, STORY_REVIEWER } from "@/lib/seed/story";

const STAGES = ["before", "sent", "invited", "met"];

/** The `data-tour` ids the v4 brief's target contract lets the tour use. */
const CONTRACT = [
  "seeker-roles",
  "challenge-filters",
  "challenge-table",
  "challenge-row",
  "do-challenge",
  "think-aloud",
  "my-score",
  "company-looking-for",
  "job-ad",
  "draft",
  "score",
  "top-work",
  "invite",
  "city-hiring-now",
  "city-make-challenge",
  "city-charts",
  "city-funnel",
  "city-map",
];

const last = storySteps[storySteps.length - 1];
const before = storySteps.slice(0, -1);

describe("the story", () => {
  it("tells Job seeker, Company, City of Espoo, then the end goal, in that order", () => {
    const chapters = storySteps.map((s) => s.mode).filter((mode, i, all) => mode !== all[i - 1]);
    expect(chapters).toEqual(["seeker", "employer", "city", "goal"]);
    expect(CHAPTERS.map((c) => c.label)).toEqual(["Job seeker", "Company", "City of Espoo", "The goal"]);
  });

  it("has unique ids and 12 to 17 cards", () => {
    expect(new Set(storySteps.map((s) => s.id)).size).toBe(storySteps.length);
    expect(storySteps.length).toBeGreaterThanOrEqual(12);
    expect(storySteps.length).toBeLessThanOrEqual(17);
  });

  it("lights only ids from the brief's target contract, on a real page, at a set stage", () => {
    for (const step of before) {
      expect(CONTRACT, step.id).toContain(step.target);
      expect(step.route, step.id).toMatch(/^\//);
      expect(STAGES, step.id).toContain(step.stage);
    }
  });

  it("ends on a card in the middle with the ways on", () => {
    expect(last.target).toBeUndefined();
    expect(last.route).toBeUndefined();
    expect(END_ACTIONS.map((a) => a.href)).toEqual(["/", "/company", "/city"]);
  });

  it("only moves the story stage forward, so the sandbox is rebuilt as few times as possible", () => {
    const stages = storySteps.flatMap((s) => (s.stage ? [STAGES.indexOf(s.stage)] : []));
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
  });

  it("opens on Mikko's home at its new address and stays there when the app opened on /seeker", () => {
    expect(storySteps[0]).toMatchObject({ route: "/", alsoOn: ["/seeker"], target: "seeker-roles" });
  });

  it("sets a stage in the background only where the page reads no story data", () => {
    expect(storySteps.filter((s) => s.stageInBackground).map((s) => s.route)).toEqual(["/company", "/company"]);
  });

  it("drafts a challenge as Laura would before it lights the draft", () => {
    expect(storySteps.filter((s) => s.act).map((s) => [s.act, s.target])).toEqual([["draftForRole", "draft"]]);
  });

  it("shows the work being done in the work screen's sample session", () => {
    expect(storySteps.filter((s) => s.target === "do-challenge" || s.target === "think-aloud").map((s) => s.route)).toEqual([
      `/challenges/${STORY_CHALLENGE}/work?demo=1`,
      `/challenges/${STORY_CHALLENGE}/work?demo=1`,
    ]);
  });

  it("does the story challenge and acts as the story company, both read from the seed", () => {
    expect(SEED_CHALLENGES.some((c) => `ch-${c.key}` === STORY_CHALLENGE)).toBe(true);
    expect(COMPANIES.some((c) => c.id === STORY_COMPANY)).toBe(true);
    expect(storySteps.filter((s) => s.mode === "employer").every((s) => s.company === STORY_COMPANY)).toBe(true);
  });

  it("names the people and the company the seed has, and Mikko's real score", () => {
    const text = storySteps.map((s) => `${s.title} ${s.body ?? ""}`).join(" ");
    expect(PEOPLE.mikko.name.split(" ")[0]).toBe("Mikko");
    expect(STORY_REVIEWER.split(" ")[0]).toBe("Laura");
    expect(companyName(STORY_COMPANY)).toBe("Halla Supply");
    expect(text).toContain("Halla Supply");
    const total = (STORY_DECISION.points.reduce((a, b) => a + b, 0) / STORY_DECISION.points.length) * 2;
    expect(text).toContain(`${total} of 10`);
    expect(text).not.toMatch(/\b(Fix|Make|Read|Choose)\b.*format/);
  });

  it("says how the product meets the EU AI Act and GDPR just before the end goal, on the human score", () => {
    const rules = storySteps[storySteps.length - 3];
    expect(rules).toMatchObject({ id: "g-rules", target: "score" });
    expect(rules.title).toMatch(/^Built to meet the EU AI Act and GDPR/);
    expect(rules.body).toMatch(/named person gives every score/);
    expect(rules.body).toMatch(/never scores, ranks or decides/);
  });

  it("tells the city's part in the order of the script: hiring now, a challenge, what came of it, the map", () => {
    expect(storySteps.filter((s) => s.mode === "city").map((s) => s.target)).toEqual(["city-hiring-now", "city-make-challenge", "city-funnel", "city-map"]);
    expect(storySteps.filter((s) => s.mode === "employer").map((s) => s.target)).toEqual(["company-looking-for", "draft", "score", "invite", "top-work"]);
  });

  it("keeps the earlier name for the page that counts the cards", () => {
    expect(minuteSteps).toBe(storySteps);
  });
});

describe("where the story starts", () => {
  it("starts each view's Show me at its own chapter", () => {
    expect(storySteps[startIndexOf("seeker")].mode).toBe("seeker");
    expect(storySteps[startIndexOf("employer")]).toMatchObject({ mode: "employer", id: "c-laura" });
    expect(storySteps[startIndexOf("city")]).toMatchObject({ mode: "city", id: "y-hiring" });
    expect(chapterStart("seeker")).toBe(0);
  });

  it("starts at the beginning for anything else, so old links and buttons still work", () => {
    for (const value of ["1", "minute", "story", undefined, {}, ""]) expect(startIndexOf(value)).toBe(0);
  });

  it("labels each chapter", () => {
    expect(chapterLabel("employer")).toBe("Company");
    expect(chapterLabel("goal")).toBe("The goal");
  });
});

describe("routes", () => {
  it("fills the seed's story work into a route", () => {
    expect(resolveRoute(`/my-work/${STORY_PROOF}`)).toBe(`/my-work/${STORY_PROOF_SEED}`);
    expect(resolveRoute("/")).toBe("/");
  });

  it("has no route when a work id is needed and there is none", () => {
    expect(fillRoute(`/company/review/${STORY_PROOF}`, null)).toBeNull();
  });
});

describe("warmCalls", () => {
  it("asks for what each page reads on arrival", () => {
    expect(warmCalls("/")).toEqual([{ call: "seekerHome" }, { call: "companies" }]);
    expect(warmCalls("/seeker")).toEqual([{ call: "seekerHome" }, { call: "companies" }]);
    expect(warmCalls(`/my-work/${STORY_PROOF}`)).toEqual([{ call: "seekerHome" }, { call: "companies" }]);
    expect(warmCalls("/employer")).toEqual([{ call: "companyHome" }, { call: "companies" }]);
    expect(warmCalls(`/company/review/${STORY_PROOF}`)).toEqual([{ call: "queue" }, { call: "companies" }]);
    expect(warmCalls("/company")).toEqual([{ call: "companies" }]);
    expect(warmCalls("/city")).toEqual([{ call: "city" }]);
    expect(warmCalls(`/challenges/${STORY_CHALLENGE}/work`)).toEqual([{ call: "challenge", id: STORY_CHALLENGE }]);
  });

  it("asks for nothing on the end card or an unknown page", () => {
    expect(warmCalls(undefined)).toEqual([]);
    expect(warmCalls("/for-judges")).toEqual([]);
  });

  it("marks only the person's own home as keyed", () => {
    expect(warmCalls("/").filter(usesTalentKey)).toEqual([{ call: "seekerHome" }]);
    expect(warmCalls("/city").filter(usesTalentKey)).toEqual([]);
  });
});
