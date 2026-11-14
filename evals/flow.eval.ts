import { describe, expect, it } from "vitest";
import { GET as challengeRoute } from "@/app/api/challenges/[id]/route";
import { POST as draftRoute } from "@/app/api/challenges/draft/route";
import { GET as listChallengesRoute, POST as approveRoute } from "@/app/api/challenges/route";
import { GET as cityRoute } from "@/app/api/city/route";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { GET as companiesRoute } from "@/app/api/companies/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as decideHoldRoute } from "@/app/api/decisions/[id]/decide/route";
import { POST as acceptRoute } from "@/app/api/meetings/[id]/accept/route";
import { POST as confirmRoute } from "@/app/api/meetings/[id]/confirm/route";
import { POST as followUpRoute } from "@/app/api/meetings/[id]/follow-up/route";
import { POST as hiredRoute } from "@/app/api/meetings/[id]/hired/route";
import { GET as cityTaskRoute } from "@/app/api/city/tasks/[id]/route";
import { GET as topRoute } from "@/app/api/companies/[id]/tasks/[taskId]/top/route";
import { GET as passportRoute } from "@/app/api/passport/me/route";
import { POST as sharingRoute } from "@/app/api/proofs/[proofId]/sharing/route";
import { POST as tasterRoute } from "@/app/api/taster/route";
import type {
  BlindProof,
  Challenge,
  ChallengeDraft,
  CityOverview,
  Company,
  Decision,
  Meeting,
  PassportEntry,
  CityTaskView,
  ReviewQueue,
  TopProofs,
} from "@/lib/domain/types";
import { call, decide, ownKey, record, submit } from "./helpers";

const EVAL = "5 Flow (API)";
const A = "co-tuulos";
const B = "co-saarnivo";
const C = "co-kivira";
const TALENT = { id: "flow-talent", name: "Noor Saleh", contact: "noor.saleh@example.org" };

describe("Flow: from need to a confirmed Second look meeting", () => {
  it("runs the whole story through the route handlers", async () => {
    const steps: string[] = [];
    const step = (name: string, ok: boolean) => {
      steps.push(name);
      record(EVAL, name, ok ? "ok" : "failed", ok);
      expect(ok, name).toBe(true);
    };

    await call(resetRoute, { method: "POST" });
    const cityBefore = (await call<CityOverview>(cityRoute)).json;
    const companies = (await call<Company[]>(companiesRoute)).json;
    step("seed has 28 companies", companies.length === 28);

    const taster = await call<Challenge>(tasterRoute, { body: { dreamJob: "data analyst" } });
    step("taster is a 2-minute task", taster.status === 200 && taster.json.minutes === 2 && taster.json.kind === "taster");

    const draft = await call<ChallengeDraft>(draftRoute, {
      body: { need: "ML engineer for grasp detection: model evaluation, data quality, code review, young native speaker" },
    });
    step("AI drafts a Problem Card", draft.status === 200 && draft.json.setAside.some((s) => s.startsWith("Not used")) && draft.json.draftedBy !== undefined);

    const approved = await call<Challenge>(approveRoute, { body: { draft: draft.json, companyId: A, approvedBy: "Anna Koivisto" } });
    const listed = (await call<Challenge[]>(listChallengesRoute)).json;
    const fetched = await call<Challenge>(challengeRoute, { params: { id: approved.json.id } });
    step(
      "a human approves and it is published",
      approved.status === 200 && listed.some((c) => c.id === approved.json.id) && fetched.status === 200 && !("draftedBy" in fetched.json),
    );

    const answer =
      "The split leaks frames of the same grasp into test, so group by attempt id. The threshold is tuned on the test set; pick it on validation. Accuracy hides the 4% drops, so report recall on dropped grasps.";
    const followUps = await call<{ questions: string[] }>(followUpsRoute, { body: { challengeId: approved.json.id, answer } });
    step("two follow-ups about the answer", followUps.json.questions.length === 2);

    const submitted = await submit<{ proof: BlindProof }>({
      body: {
        challengeId: approved.json.id,
        talent: TALENT,
        answer,
        explain: followUps.json.questions.map((question) => ({ question, answer: "The leak first, because it changes every other number." })),
      },
    });
    const proof = submitted.json.proof;
    step("submission returns a blind proof", submitted.status === 200 && !JSON.stringify(proof).includes("Noor"));

    const before = (await call<PassportEntry[]>(passportRoute, ownKey(TALENT.id))).json.find((e) => e.proof.proofId === proof.proofId);
    const shared = await call<{ sharing: boolean }>(sharingRoute, { body: { talentId: TALENT.id, share: true }, params: { proofId: proof.proofId } });
    step("Second look is off until the person turns it on", before?.sharing === false && shared.json.sharing === true);

    const queueA = (await call<ReviewQueue>(queueRoute, { params: { id: A } })).json;
    step("company A sees it in its own queue", queueA.proofs.some((p) => p.proofId === proof.proofId));

    const passA = await decide<{ decision: Decision }>({
      body: { proofId: proof.proofId, companyId: A, reviewer: "Elias Virta", decision: "pass", feedback: "Clear and correct. We need someone on site this month, so we pass for now." },
    });
    const again = await decide({
      body: { proofId: proof.proofId, companyId: A, reviewer: "Elias Virta", decision: "meet", feedback: "Changed my mind about this one, sorry." },
    });
    step("company A passes with feedback, once", passA.status === 200 && again.status === 409);

    const queueB = (await call<ReviewQueue>(queueRoute, { params: { id: B } })).json;
    const look = queueB.secondLook.find((p) => p.proofId === proof.proofId);
    step("company B sees it through Second look", Boolean(look && look.sharedSkills.length >= 2));

    const queueC = (await call<ReviewQueue>(queueRoute, { params: { id: C } })).json;
    const blocked = await decide({
      body: { proofId: proof.proofId, companyId: C, reviewer: "Tomas Berg", decision: "meet", feedback: "We would like to meet about this work." },
    });
    step("company C without shared skills cannot see or decide", !queueC.secondLook.some((p) => p.proofId === proof.proofId) && blocked.status === 403);

    const meet = await decide<{ decision: Decision; meeting: Meeting }>({
      body: { proofId: proof.proofId, companyId: B, reviewer: "Mira Salo", decision: "meet", feedback: "Your point on the split matches what we see in forecasting. Let us talk." },
    });
    step("company B picks Meet and a slot is set", meet.status === 200 && meet.json.meeting.status === "invited" && /^Sat \d{1,2}:\d{2}, Table \d+$/.test(meet.json.meeting.slot));

    const hidden = (await call<ReviewQueue>(queueRoute, { params: { id: B } })).json.decided.find((d) => d.proof.proofId === proof.proofId);
    step("identity hidden while invited", hidden?.identity === undefined);

    const passport = (await call<PassportEntry[]>(passportRoute, ownKey(TALENT.id))).json;
    const entry = passport.find((e) => e.proof.proofId === proof.proofId);
    step(
      "passport shows both responses",
      entry?.responses.length === 2 && entry.seenByHumans === 2 && entry.responses.some((r) => r.viaSecondLook && r.meeting?.status === "invited"),
    );

    await call(acceptRoute, { body: { talentId: TALENT.id }, params: { id: meet.json.meeting.id } });
    const shown = (await call<ReviewQueue>(queueRoute, { params: { id: B } })).json.decided.find((d) => d.proof.proofId === proof.proofId);
    step("talent accepts and identity appears", shown?.identity?.name === TALENT.name);

    await call(confirmRoute, { body: { side: "talent", talentId: TALENT.id }, params: { id: meet.json.meeting.id } });
    const met = await call<Meeting>(confirmRoute, { body: { side: "company", companyId: B }, params: { id: meet.json.meeting.id } });
    step("both sides confirm the meeting", met.json.status === "met");

    const city = (await call<CityOverview>(cityRoute)).json;
    const t = city.totals;
    const b = cityBefore.totals;
    step(
      "city totals change and show 0 automated decisions",
      t.proofs === b.proofs + 1 &&
        t.humanDecisions === b.humanDecisions + 2 &&
        t.meetingsConfirmedByBoth === b.meetingsConfirmedByBoth + 1 &&
        t.secondLookMeetings === b.secondLookMeetings + 1 &&
        t.automatedDecisions === 0,
    );
    expect(steps.length).toBe(17);
  });
});

describe("Flow: a task takes a fixed number of answers", () => {
  it("accepts work until the places are taken, then refuses honestly", async () => {
    const check = (name: string, ok: boolean) => {
      record(EVAL, name, ok ? "ok" : "failed", ok);
      expect(ok, name).toBe(true);
    };
    await call(resetRoute, { method: "POST" });
    const draft = await call<ChallengeDraft>(draftRoute, { body: { need: "Data analyst for our energy forecasts: SQL, data quality, clear charts" } });
    const tooMany = await call(approveRoute, { body: { draft: { ...draft.json, places: 40 }, companyId: B, approvedBy: "Aino Virtanen" } });
    check("places outside 5 to 30 are refused", tooMany.status === 400);

    const approved = await call<Challenge>(approveRoute, { body: { draft: { ...draft.json, places: 5 }, companyId: B, approvedBy: "Aino Virtanen" } });
    const fetched = await call<Challenge>(challengeRoute, { params: { id: approved.json.id } });
    check("the employer's number of places is published with the task", fetched.json.places === 5);

    const send = (i: number) =>
      submit<{ proof: BlindProof; error?: string }>({
        body: {
          challengeId: approved.json.id,
          talent: { id: `places-talent-${i}`, name: `Person ${i} Example`, contact: `person${i}@example.org` },
          answer: "Check the late meter readings first, then chart the forecast error per week.",
          explain: [
            { question: "Why the late readings first?", answer: "They move every weekly total." },
            { question: "What would you chart?", answer: "The error per week, so a drift shows." },
          ],
        },
      });
    const accepted = [];
    for (let i = 0; i < 5; i++) accepted.push((await send(i)).status);
    check("all five places take work", accepted.every((status) => status === 200));
    const sixth = await send(5);
    check("the sixth answer is refused with 409 and no waiting list", sixth.status === 409 && sixth.json.error === "This task has all its 5 answers. Choose another task.");
  });
});

describe("Flow v3: from a human score to a hire", () => {
  it("scores, holds, invites, meets, agrees a follow-up and records a hire, through the route handlers", async () => {
    const step = (name: string, ok: boolean) => {
      record(EVAL, name, ok ? "ok" : "failed", ok);
      expect(ok, name).toBe(true);
    };
    await call(resetRoute, { method: "POST" });
    const person = { id: "flow-v3-talent", name: "Iida Example", contact: "iida.example@example.org" };
    const task = "ch-tuulos-ml";
    const sent = await submit<{ proof: BlindProof }>({
      body: { challengeId: task, talent: person, answer: "Split by grasp attempt, then choose the threshold on validation data.", explain: [{ answer: "Frames of one attempt look alike." }, { answer: "The threshold source first." }], shareWithSimilar: true },
    });
    const proofId = sent.json.proof.proofId;

    const held = await decide<{ decision: Decision; meeting?: Meeting }>({
      body: { proofId, companyId: A, reviewer: "Elias Virta", decision: "hold", feedback: "Clear split by attempt and you said why. We want to hear about the threshold." },
    });
    step("v3: a named reviewer scores the work and holds it, no meeting yet", held.status === 200 && held.json.decision.total === 6 && !held.json.meeting);

    const top = (await call<TopProofs>(topRoute, { params: { id: A, taskId: task } })).json;
    step("v3: the scored proof is on the task's top list, blind", top.scored.some((t) => t.proof.proofId === proofId && !t.identity) && !JSON.stringify(top).includes(person.name));

    const invited = await call<{ meeting?: Meeting }>(decideHoldRoute, { body: { decision: "meet", reviewer: "Elias Virta" }, params: { id: held.json.decision.id } });
    const meetingId = invited.json.meeting?.id ?? "";
    step("v3: the hold becomes an invitation", invited.status === 200 && invited.json.meeting?.status === "invited");

    const accepted = await call<Meeting>(acceptRoute, { body: { talentId: person.id }, params: { id: meetingId } });
    const named = (await call<TopProofs>(topRoute, { params: { id: A, taskId: task } })).json.scored.find((t) => t.proof.proofId === proofId);
    step("v3: the person accepts, and only then the company sees the name", accepted.json.status === "accepted" && named?.identity?.name === person.name);

    const early = await call(followUpRoute, { body: { companyId: A, agreed: true }, params: { id: meetingId } });
    await call(confirmRoute, { body: { side: "talent", talentId: person.id }, params: { id: meetingId } });
    const met = await call<Meeting>(confirmRoute, { body: { side: "company", companyId: A }, params: { id: meetingId } });
    step("v3: both sides confirm the talk", early.status === 409 && met.json.status === "met");

    const followUp = await call<Meeting>(followUpRoute, { body: { companyId: A, agreed: true }, params: { id: meetingId } });
    const hired = await call<Meeting>(hiredRoute, { body: { companyId: A }, params: { id: meetingId } });
    step("v3: a follow-up is agreed and a hire recorded by the company", followUp.json.followUpAgreed === true && hired.json.hired === true);

    const city = (await call<CityTaskView>(cityTaskRoute, { params: { id: task } })).json;
    const cityText = JSON.stringify(city);
    step(
      "v3: the city counts every step for the task, with no name",
      city.scored >= 1 && city.followUps >= 1 && city.hires >= 1 && city.top.some((t) => t.proofId === proofId) && !cityText.includes(person.name) && !cityText.includes(person.id),
    );
  });
});
