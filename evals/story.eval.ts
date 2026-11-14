import { describe, expect, it } from "vitest";
import { GET as cityRoute } from "@/app/api/city/route";
import { GET as employerHomeRoute } from "@/app/api/companies/[id]/home/route";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { GET as sessionRoute } from "@/app/api/demo/session/route";
import { POST as storyRoute } from "@/app/api/demo/story/route";
import { GET as seekerHomeRoute } from "@/app/api/seeker/me/home/route";
import type { CityOverview, DemoSession, EmployerHome, ReviewQueue, SeekerHome, StoryStage } from "@/lib/domain/types";
import { companyName } from "@/lib/seed/companies";
import { PEOPLE, PERSONA } from "@/lib/seed/people";
import { STORY_COMPANY_ID } from "@/lib/seed/story";
import { call, ownKey, record } from "./helpers";

const EVAL = "6 Demo story (API)";
const COMPANY = STORY_COMPANY_ID;
const COMPANY_NAME = companyName(STORY_COMPANY_ID);
const PERSONA_NAME = PEOPLE[PERSONA].name;
const FIRST_NAME = PERSONA_NAME.split(" ")[0];

async function atStage(stage: StoryStage) {
  const session = (await call<DemoSession>(storyRoute, { body: { stage } })).json;
  const home = (await call<SeekerHome>(seekerHomeRoute, ownKey(session.persona.talentId))).json;
  return { session, home };
}

const proofIds = (home: SeekerHome) => new Set(home.passport.map((e) => e.proof.proofId));

describe("Demo story: the server rebuilds each stage", () => {
  it("returns the persona and stage, with no share code outside a sandbox", async () => {
    const story = (await call<DemoSession>(storyRoute, { body: { stage: "invited" } })).json;
    const session = (await call<DemoSession>(sessionRoute)).json;
    const ok = session.code === null && session.stage === "invited" && session.persona.talentId === story.persona.talentId && session.persona.name.length > 0;
    record(EVAL, "session: persona and stage", `${session.persona.name}, ${session.stage}`, ok);
    expect(ok).toBe(true);
  });

  it("refuses an unknown stage", async () => {
    const { status } = await call(storyRoute, { body: { stage: "hired" } });
    record(EVAL, "unknown stage refused", `HTTP ${status} for an unknown stage`, status === 400);
    expect(status).toBe(400);
  });

  it("before: two proofs, no invitation; sent: the story proof waits in the story company's queue", async () => {
    const before = await atStage("before");
    const sent = await atStage("sent");
    const queue = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
    const story = [...proofIds(sent.home)].filter((id) => !proofIds(before.home).has(id));
    const ok =
      before.home.passport.length === 2 && before.home.invitations.length === 0 &&
      sent.home.passport.length === 3 && story.length === 1 && queue.proofs.some((p) => p.proofId === story[0]);
    record(EVAL, "before and sent", `${before.home.passport.length} proofs before, ${sent.home.passport.length} after sending; story proof queued: ${ok}`, ok);
    expect(ok).toBe(true);
  });

  it("invited: the story company wants to meet her; the greeting says so", async () => {
    const { home } = await atStage("invited");
    const open = home.invitations.find((i) => i.status === "invited" && !i.viaSecondLook);
    const ok = open?.companyName === COMPANY_NAME && home.greeting.fact === `${COMPANY_NAME} wants to meet you.` && home.greeting.firstName === FIRST_NAME;
    record(EVAL, "invited: open invitation from the story company", home.greeting.fact, ok);
    expect(ok).toBe(true);
  });

  it("met: she accepted, the company sees her name, both confirmed the talk, and the city counts it", async () => {
    await atStage("invited");
    const before = (await call<CityOverview>(cityRoute)).json.insights;
    const { home } = await atStage("met");
    const after = (await call<CityOverview>(cityRoute)).json.insights;
    const named = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.some((d) => d.identity?.name === PERSONA_NAME);
    const invite = home.invitations.find((i) => i.companyName === COMPANY_NAME);
    const ok =
      invite?.status === "met" && named &&
      after.funnel.accepted > before.funnel.accepted && after.funnel.met > before.funnel.met && after.impact.event.followUps > before.impact.event.followUps;
    record(EVAL, "met: accepted, name shown, talk and follow-up counted", `proofs met: ${before.funnel.met} before, ${after.funnel.met} after; follow-ups: ${before.impact.event.followUps} before, ${after.impact.event.followUps} after`, ok);
    expect(ok).toBe(true);
  });

  it("employer and city views never carry the persona's key or name before she accepts", async () => {
    const { session } = await atStage("invited");
    const employer = (await call<EmployerHome>(employerHomeRoute, { params: { id: COMPANY } })).json;
    const city = (await call<CityOverview>(cityRoute)).json;
    const text = JSON.stringify([employer, city]);
    const ok = !text.includes(session.persona.talentId) && !text.includes(PERSONA_NAME.split(" ").at(-1) ?? PERSONA_NAME) && employer.company.id === COMPANY;
    record(EVAL, "persona hidden from employer and city", ok ? "hidden" : "leaked", ok);
    expect(ok).toBe(true);
  });
});
