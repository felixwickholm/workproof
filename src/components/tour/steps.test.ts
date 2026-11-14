import { describe, expect, it } from "vitest";
import { fillRoute, resolveRoute } from "./resolve-route";
import { citySteps, employerSteps, minuteSteps, modeChip, seekerSteps, STORY_PROOF, TOUR_KINDS, tourKindOf, tours } from "./steps";
import { STORY_CHALLENGE, STORY_COMPANY, STORY_PROOF_SEED, storyBossFirstName, storyCompanyName } from "./story-ids";
import { usesTalentKey, warmCalls } from "./warm";
import { COMPANIES } from "@/lib/seed/companies";
import { SEED_CHALLENGES } from "@/lib/seed/challenges";

const STAGES = ["before", "sent", "invited", "met"];

describe("the four tours", () => {
  it.each(TOUR_KINDS)("%s has 5 to 7 cards with unique ids and ends on the try-it card", (kind) => {
    const { steps, end } = tours[kind];
    expect(steps.length).toBeGreaterThanOrEqual(5);
    expect(steps.length).toBeLessThanOrEqual(7);
    expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
    const last = steps[steps.length - 1];
    expect(last.title).toBe("Now try it yourself.");
    expect(last.target).toBeUndefined();
    expect(last.route).toBeUndefined();
    expect(end.length).toBeGreaterThanOrEqual(1);
    expect(end.length).toBeLessThanOrEqual(kind === "minute" ? 3 : 2);
  });

  it.each(TOUR_KINDS)("%s lights a real element on a real page in every step before the end", (kind) => {
    const steps = tours[kind].steps;
    for (const step of steps.slice(0, -1)) {
      expect(step.route, step.id).toMatch(/^\//);
      expect(step.target, step.id).toMatch(/^[a-z-]+$/);
      expect(step.stage, step.id).toBeDefined();
    }
  });

  it("walks the overview from the company to the city in the order the brief tells it", () => {
    expect(minuteSteps.map((s) => s.target ?? null)).toEqual(["job-ad", "do-challenge", "blind-work", "score", "invitation", "city-funnel", null]);
    expect(minuteSteps.map((s) => s.mode)).toEqual(["employer", "seeker", "seeker", "employer", "seeker", "city", "start"]);
  });

  it("gives each view its own flow", () => {
    expect(seekerSteps.map((s) => s.target ?? null)).toEqual(["challenge-list", "do-challenge", "own-work", "my-score", "invitation", "invitation", null]);
    expect(employerSteps.map((s) => s.target ?? null)).toEqual(["job-ad", "draft", "queue", "score", "top-work", "invite", null]);
    expect(citySteps.map((s) => s.target ?? null)).toEqual(["city-map", "city-funnel", "city-demand", "city-talks", "city-safeguards", null]);
  });

  it("keeps each view's demo on that view's own screens", () => {
    expect(seekerSteps.slice(0, -1).every((s) => s.mode === "seeker")).toBe(true);
    expect(employerSteps.slice(0, -1).every((s) => s.mode === "employer")).toBe(true);
    expect(citySteps.slice(0, -1).every((s) => s.mode === "city" && s.route === "/city")).toBe(true);
  });

  it("moves Olena's story forward in the tours that follow her", () => {
    for (const steps of [minuteSteps, seekerSteps]) {
      const stages = steps.flatMap((s) => (s.stage ? [STAGES.indexOf(s.stage)] : []));
      expect(stages).toEqual([...stages].sort((a, b) => a - b));
    }
  });

  it("shows the overview's first card at once, setting the story stage behind it", () => {
    expect(minuteSteps[0]).toMatchObject({ stageInBackground: true });
    expect(TOUR_KINDS.flatMap((kind) => tours[kind].steps).filter((s) => s.stageInBackground)).toHaveLength(1);
  });

  it("waits only briefly for the targets of screens still being built", () => {
    const soon = TOUR_KINDS.flatMap((kind) => tours[kind].steps).filter((s) => s.soon);
    expect(soon.map((s) => s.target)).toEqual(["draft", "invite"]);
    expect(soon.every((s) => !s.selector)).toBe(true);
  });

  it("does the story challenge and acts as the story company, both read from the seed", () => {
    expect(SEED_CHALLENGES.some((c) => `ch-${c.key}` === STORY_CHALLENGE)).toBe(true);
    expect(COMPANIES.some((c) => c.id === STORY_COMPANY)).toBe(true);
    expect(employerSteps.slice(0, -1).every((s) => s.company === STORY_COMPANY)).toBe(true);
  });

  it("lights the story company's invitation on the steps about its invite", () => {
    expect(storyCompanyName()).not.toBe("");
    for (const step of [...minuteSteps, ...seekerSteps].filter((s) => s.target === "invitation")) {
      expect(step.targetText?.()).toBe(storyCompanyName());
    }
  });

  it("sends each of the overview's three ways out to a view that offers its own demo", () => {
    expect(tours.minute.end.map((a) => [a.label, a.href, a.offer])).toEqual([
      ["I'm looking for work", "/seeker", "seeker"],
      ["I'm hiring", "/employer", "employer"],
      ["I'm the City of Espoo", "/city", "city"],
    ]);
  });
});

describe("tourKindOf", () => {
  it("names the four tours and starts the overview for anything else", () => {
    for (const kind of TOUR_KINDS) expect(tourKindOf(kind)).toBe(kind);
    expect(tourKindOf("story")).toBe("minute");
    expect(tourKindOf(undefined)).toBe("minute");
    expect(tourKindOf({})).toBe("minute");
  });
});

describe("whose screen", () => {
  it("names the person and their side in plain words, with no colour of its own", () => {
    expect(modeChip("seeker")).toBe("Olena, looking for work");
    expect(modeChip("employer")).toBe(`${storyBossFirstName()}, the boss`);
    expect(storyBossFirstName()).toMatch(/^[A-Z][a-z]+$/);
    expect(modeChip("city")).toBe("The City of Espoo");
    expect(modeChip("start")).toBeNull();
  });
});

describe("routes", () => {
  it("fills the seed's story proof into a route", () => {
    expect(resolveRoute(`/my-work/${STORY_PROOF}`)).toBe(`/my-work/${STORY_PROOF_SEED}`);
    expect(resolveRoute("/seeker")).toBe("/seeker");
  });

  it("has no route when a proof is needed and there is none", () => {
    expect(fillRoute(`/company/review/${STORY_PROOF}`, null)).toBeNull();
  });
});

describe("warmCalls", () => {
  it("asks for what each page reads on arrival", () => {
    expect(warmCalls("/seeker")).toEqual([{ call: "seekerHome" }, { call: "companies" }]);
    expect(warmCalls(`/my-work/${STORY_PROOF}`)).toEqual([{ call: "seekerHome" }, { call: "companies" }]);
    expect(warmCalls("/employer")).toEqual([{ call: "companyHome" }, { call: "companies" }]);
    expect(warmCalls(`/company/review/${STORY_PROOF}`)).toEqual([{ call: "queue" }, { call: "companies" }]);
    expect(warmCalls("/company")).toEqual([{ call: "companies" }]);
    expect(warmCalls("/city")).toEqual([{ call: "city" }]);
    expect(warmCalls(`/challenges/${STORY_CHALLENGE}/work`)).toEqual([{ call: "challenge", id: STORY_CHALLENGE }]);
  });

  it("asks for nothing on the landing page or the end card", () => {
    expect(warmCalls("/")).toEqual([]);
    expect(warmCalls(undefined)).toEqual([]);
  });

  it("marks only the person's own home as keyed", () => {
    expect(warmCalls("/seeker").filter(usesTalentKey)).toEqual([{ call: "seekerHome" }]);
    expect(warmCalls("/city").filter(usesTalentKey)).toEqual([]);
  });
});
