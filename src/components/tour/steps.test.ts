import { describe, expect, it } from "vitest";
import type { PassportEntry } from "@/lib/domain/types";
import { fillRoute, storyProofId } from "./resolve-route";
import { modeChip, STORY_PROOF, switchLine, tourSteps } from "./steps";
import { usesTalentKey, warmCalls, type WarmCall } from "./warm";

describe("tourSteps", () => {
  it("tells the story in nine steps with unique ids", () => {
    expect(tourSteps).toHaveLength(9);
    expect(new Set(tourSteps.map((s) => s.id)).size).toBe(9);
  });

  it("spotlights the targets the pages carry, in story order", () => {
    expect(tourSteps.map((s) => s.target ?? null)).toEqual([
      "olena-story",
      "task-feed",
      "own-work",
      "blind-proof",
      "queue",
      "decision",
      "invitation",
      "city-outcomes",
      null,
    ]);
  });

  it("only moves the story forward, so Next never undoes what the visitor just saw", () => {
    const order = ["before", "sent", "invited", "met"];
    const stages = tourSteps.flatMap((s) => (s.stage ? [order.indexOf(s.stage)] : []));
    expect(stages).toEqual([...stages].sort((a, b) => a - b));
    expect(tourSteps[0].stage).toBe("before");
  });

  it("ends on the close with no spotlight", () => {
    const close = tourSteps[tourSteps.length - 1];
    expect(close.title).toBe("Work first. Names last. People decide.");
    expect(close.body).toBe("That is Workprint. Explore it yourself, or do a task on your own phone.");
    expect(close.target).toBeUndefined();
  });

  it("tells Second look as the rule allows: Otso reads an earlier proof that its owner said not now to", () => {
    const yes = tourSteps.find((s) => s.id === "olena-says-yes");
    expect(yes?.body).toContain("Her earlier plan, which another employer could not use, reached Otso Health through Second look");
    expect(yes?.body).not.toContain("same proof");
  });

  it("lights Kaari's invitation on the step about saying yes to Kaari", () => {
    const yes = tourSteps.find((s) => s.id === "olena-says-yes");
    expect(yes).toMatchObject({ target: "invitation", targetText: "Kaari Home Care" });
  });

  it("never names fewer details than it counts", () => {
    const name = tourSteps.find((s) => s.id === "name-stays");
    expect(name?.body).toContain("7 details, like her name");
  });

  it("shows the first card at once, setting the story stage behind the landing page", () => {
    expect(tourSteps[0]).toMatchObject({ route: "/", stageInBackground: true });
    expect(tourSteps.slice(1).some((s) => s.stageInBackground)).toBe(false);
  });

  it("opens Kaari's screens on the employer steps, whatever company the visitor chose before", () => {
    const employer = tourSteps.filter((s) => s.mode === "employer");
    expect(employer.map((s) => s.id)).toEqual(["anna-queue", "person-decides"]);
    expect(employer.every((s) => s.company === "co-kaari")).toBe(true);
  });
});

describe("routes", () => {
  const entry = (proofId: string) => ({ proof: { proofId } }) as PassportEntry;

  it("takes the newest passport entry as the story proof", () => {
    expect(storyProofId([entry("proof_story_kaari_8"), entry("older")])).toBe("proof_story_kaari_8");
    expect(storyProofId([])).toBeNull();
  });

  it("fills the story proof into a route", () => {
    expect(fillRoute(`/passport/${STORY_PROOF}`, "proof_story_kaari_8")).toBe("/passport/proof_story_kaari_8");
    expect(fillRoute("/seeker", null)).toBe("/seeker");
  });

  it("has no route when a proof is needed and there is none", () => {
    expect(fillRoute(`/company/review/${STORY_PROOF}`, null)).toBeNull();
  });
});

describe("whose screen", () => {
  it("names the person and their side, with one hue each", () => {
    expect(modeChip.seeker?.label).toBe("Olena, looking for work");
    expect(modeChip.employer?.label).toBe("Anna, Kaari Home Care");
    expect(new Set([modeChip.seeker?.hue, modeChip.employer?.hue, modeChip.city?.hue]).size).toBe(3);
    expect(modeChip.start).toBeNull();
  });

  it("says so when the screen changes hands, and only then", () => {
    expect(switchLine("start", "seeker")).toBe("Now Olena's screen.");
    expect(switchLine("seeker", "employer")).toBe("Now the employer's side.");
    expect(switchLine("employer", "seeker")).toBe("Back to Olena.");
    expect(switchLine("seeker", "city")).toBe("Now the city's side.");
    expect(switchLine("seeker", "seeker")).toBeNull();
    expect(switchLine("city", "start")).toBeNull();
  });

  it("hands over at every change of person in the story", () => {
    const changes = tourSteps.slice(1).filter((s, i) => switchLine(tourSteps[i].mode, s.mode) !== null);
    expect(changes.map((s) => s.id)).toEqual(["skips-the-cv", "anna-queue", "olena-says-yes", "espoo-sees"]);
  });
});

describe("warmCalls", () => {
  it("asks for what each page reads on arrival", () => {
    expect(warmCalls("/seeker")).toEqual(["seekerHome", "companies"]);
    expect(warmCalls(`/passport/${STORY_PROOF}`)).toEqual(["seekerHome", "companies"]);
    expect(warmCalls("/employer")).toEqual(["companyHome", "companies"]);
    expect(warmCalls(`/company/review/${STORY_PROOF}`)).toEqual(["queue", "companies"]);
    expect(warmCalls("/city")).toEqual(["city"]);
  });

  it("asks for nothing on the landing page", () => {
    expect(warmCalls("/")).toEqual([]);
  });

  it("marks only the person's own home as keyed", () => {
    const all: WarmCall[] = ["seekerHome", "companies", "companyHome", "queue", "city"];
    expect(all.filter(usesTalentKey)).toEqual(["seekerHome"]);
  });
});
