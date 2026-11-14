import { describe, expect, it } from "vitest";
import { GET as cityRoute } from "@/app/api/city/route";
import { GET as employerHomeRoute } from "@/app/api/companies/[id]/home/route";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { GET as sessionRoute } from "@/app/api/demo/session/route";
import { POST as storyRoute } from "@/app/api/demo/story/route";
import { GET as seekerHomeRoute } from "@/app/api/seeker/[talentId]/home/route";
import type { CityOverview, DemoSession, EmployerHome, ReviewQueue, SeekerHome, StoryStage } from "@/lib/domain/types";
import { call, record } from "./helpers";

const EVAL = "6 Demo story (API)";
const KAARI = "co-kaari";

async function atStage(stage: StoryStage) {
  const session = (await call<DemoSession>(storyRoute, { body: { stage } })).json;
  const home = (await call<SeekerHome>(seekerHomeRoute, { params: { talentId: session.persona.talentId } })).json;
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
    record(EVAL, "unknown stage refused", String(status), status === 400);
    expect(status).toBe(400);
  });

  it("before: two proofs, no invitation; sent: the Kaari proof waits in Kaari's queue", async () => {
    const before = await atStage("before");
    const sent = await atStage("sent");
    const queue = (await call<ReviewQueue>(queueRoute, { params: { id: KAARI } })).json;
    const story = [...proofIds(sent.home)].filter((id) => !proofIds(before.home).has(id));
    const ok =
      before.home.passport.length === 2 && before.home.invitations.length === 0 &&
      sent.home.passport.length === 3 && story.length === 1 && queue.proofs.some((p) => p.proofId === story[0]);
    record(EVAL, "before and sent", `${before.home.passport.length} then ${sent.home.passport.length} proofs, story proof queued ${ok}`, ok);
    expect(ok).toBe(true);
  });

  it("invited: Kaari wants to meet her; the greeting says so", async () => {
    const { home } = await atStage("invited");
    const open = home.invitations.find((i) => i.status === "invited" && !i.viaSecondLook);
    const ok = open?.companyName === "Kaari Home Care" && home.greeting.fact === "Kaari Home Care wants to meet you." && home.greeting.firstName === "Olena";
    record(EVAL, "invited: open invitation from Kaari", home.greeting.fact, ok);
    expect(ok).toBe(true);
  });

  it("met: she accepted, Kaari sees her name, Otso invited her through Second look, and the city counts it", async () => {
    const before = (await call<CityOverview>(cityRoute)).json.insights.funnel;
    const { home } = await atStage("met");
    const after = (await call<CityOverview>(cityRoute)).json.insights.funnel;
    const named = (await call<ReviewQueue>(queueRoute, { params: { id: KAARI } })).json.decided.some((d) => d.identity?.name === "Olena Kovalenko");
    const kaari = home.invitations.find((i) => i.companyName === "Kaari Home Care");
    const secondLook = home.invitations.find((i) => i.viaSecondLook);
    const ok = kaari?.status !== "invited" && named && secondLook?.companyName === "Otso Health" && after.accepted > before.accepted;
    record(EVAL, "met: accepted, name shown, Second look invite", `accepted ${before.accepted} -> ${after.accepted}`, ok);
    expect(ok).toBe(true);
  });

  it("employer and city views never carry the persona's key or name before she accepts", async () => {
    const { session } = await atStage("invited");
    const employer = (await call<EmployerHome>(employerHomeRoute, { params: { id: KAARI } })).json;
    const city = (await call<CityOverview>(cityRoute)).json;
    const text = JSON.stringify([employer, city]);
    const ok = !text.includes(session.persona.talentId) && !text.includes("Kovalenko") && employer.company.id === KAARI;
    record(EVAL, "persona hidden from employer and city", ok ? "hidden" : "leaked", ok);
    expect(ok).toBe(true);
  });
});
