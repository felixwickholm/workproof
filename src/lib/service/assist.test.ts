import { beforeEach, describe, expect, it, vi } from "vitest";
import { approveRequest } from "@/lib/http/schemas";
import { buildSeed } from "@/lib/seed";
import { getStore } from "@/lib/store";
import { assist, EVENT_SIZE, nextAsk, SHORT_SIZE, type AssistMessage } from "./assist";

/** Outside a request scope, as in the other service tests: the shared store is writable. */
vi.mock("next/headers", () => {
  const outside = async () => {
    throw new Error("`cookies` was called outside a request scope.");
  };
  return { cookies: outside, headers: outside };
});

const said = (text: string): AssistMessage => ({ from: "company", text });

const JOB_AD = `Backend developer, Keilaniemi. We build payment software for logistics companies. You would design APIs,
handle failed card payments and retries, write tests, review code with the team and look after our Postgres database.
We use TypeScript and Node. You work with product and support. Finnish is not needed. We offer a hybrid model and a
warm team of 40. Apply by sending your CV and a cover letter. Contact our recruiter for more.`;

beforeEach(async () => {
  await getStore().replace(buildSeed(new Date("2026-11-14T12:00:00Z")));
});

describe("nextAsk", () => {
  it("asks what the work is when the company wrote only a role", () => {
    expect(nextAsk([said("Data analyst")])).toBe("work");
  });

  it("then asks the size, and never a third question", () => {
    const chat: AssistMessage[] = [said("Data analyst"), { from: "assistant", text: "?", ask: "work" }, said("Our weekly sales report takes a day by hand and nobody trusts it")];
    expect(nextAsk(chat)).toBe("size");
    expect(nextAsk([...chat, { from: "assistant", text: "?", ask: "size" }, said("whatever")])).toBeNull();
  });

  it("drafts at once from a pasted job ad", () => {
    expect(nextAsk([said(JOB_AD)])).toBeNull();
  });

  it("skips the size question when the words already say it", () => {
    expect(nextAsk([said("A backend developer for our payments API, a 20 minute task about retries")])).toBeNull();
  });
});

describe("exampleJobAd", () => {
  it("uses the company's words about the work, never a wish about the person", async () => {
    const reply = await assist([said("Warehouse worker to pack orders, young and a native Finnish speaker"), { from: "assistant", text: "?", ask: "size" }, said(SHORT_SIZE)]);
    const ad = reply.kind === "draft" ? (reply.draft.jobAd ?? "") : "";
    expect(ad).toMatch(/Espoo/);
    expect(ad).not.toMatch(/young|native/i);
  });
});

describe("assist", () => {
  it.each([
    ["a role and two answers", [said("Data analyst"), { from: "assistant", text: "?", ask: "work" } as AssistMessage, said("Clean up our weekly sales report"), { from: "assistant", text: "?", ask: "size" } as AssistMessage, said(SHORT_SIZE)]],
    ["a pasted job ad", [said(JOB_AD)]],
    ["an unknown kind of work", [said("Someone who runs our sauna boat rentals in summer"), { from: "assistant", text: "?", ask: "size" } as AssistMessage, said(SHORT_SIZE)]],
    ["nonsense", [said("asdf qwer zxcv"), { from: "assistant", text: "?", ask: "work" } as AssistMessage, said("??? !!!"), { from: "assistant", text: "?", ask: "size" } as AssistMessage, said("dunno")]],
  ])("drafts a challenge and a job description from %s that the company can publish", async (_, chat) => {
    const reply = await assist(chat);
    expect(reply.kind).toBe("draft");
    if (reply.kind !== "draft") return;
    const { draft } = reply;
    expect(draft.coreSkills.length).toBeGreaterThanOrEqual(3);
    expect(draft.coreSkills.length).toBeLessThanOrEqual(5);
    expect(draft.minutes).toBeGreaterThanOrEqual(10);
    expect(draft.minutes).toBeLessThanOrEqual(30);
    expect(draft.jobAd?.length).toBeGreaterThan(80);
    expect(approveRequest.safeParse({ draft, companyId: "co-halla", approvedBy: "Laura Niemi" }).success).toBe(true);
  });

  it("makes a bigger event challenge of about 2 hours when asked", async () => {
    const reply = await assist([said("Backend developer for our payments API and its retries"), { from: "assistant", text: "?", ask: "size" }, said(EVENT_SIZE)]);
    expect(reply.kind === "draft" && reply.draft.minutes).toBe(120);
    // The size answer is about the challenge, never a wish about the job.
    expect(reply.kind === "draft" && reply.draft.setAside.join(" ")).not.toMatch(/event challenge|2 hours/i);
    expect(reply.kind === "draft" && reply.draft.jobAd).not.toMatch(/event challenge/i);
  });
});
