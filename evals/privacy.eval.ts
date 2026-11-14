import { beforeAll, describe, expect, it } from "vitest";
import { GET as challengeRoute } from "@/app/api/challenges/[id]/route";
import { POST as draftRoute } from "@/app/api/challenges/draft/route";
import { GET as listChallengesRoute, POST as approveRoute } from "@/app/api/challenges/route";
import { GET as cityRoute } from "@/app/api/city/route";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { GET as companiesRoute } from "@/app/api/companies/route";
import { POST as decisionsRoute } from "@/app/api/decisions/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as acceptRoute } from "@/app/api/meetings/[id]/accept/route";
import { POST as confirmRoute } from "@/app/api/meetings/[id]/confirm/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import type { BlindProof, Challenge, ChallengeDraft, Company, Decision, Meeting, ReviewQueue } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { call, record } from "./helpers";

const EVAL = "4 Consent and privacy";
const COMPANY = "co-tuulos";
const OTHER = "co-kivira";
const TALENT = { id: "t_eval_private_key_7f3a9c", name: "Noor Saleh", contact: "noor.saleh@example.org" };

/** Every response a company or the city can read. */
async function publicResponses(): Promise<string> {
  const companies = (await call<Company[]>(companiesRoute)).json;
  const challenges = (await call<Challenge[]>(listChallengesRoute)).json;
  const parts: unknown[] = [companies, challenges, (await call(cityRoute)).json];
  for (const c of companies) parts.push((await call(queueRoute, { params: { id: c.id } })).json);
  for (const c of challenges) parts.push((await call(challengeRoute, { params: { id: c.id } })).json);
  return JSON.stringify(parts);
}

describe("Eval 4: consent and privacy", () => {
  let proofId = "";
  let meeting: Meeting;

  beforeAll(async () => {
    await call(resetRoute, { method: "POST" });
    const submitted = await call<{ proof: BlindProof }>(submissionsRoute, {
      body: { challengeId: "ch-tuulos-ml", talent: TALENT, answer: "Split by grasp attempt, not by frame. Pick the threshold on validation.", explain: [], shareWithSimilar: false },
    });
    proofId = submitted.json.proof.proofId;
    const decided = await call<{ decision: Decision; meeting: Meeting }>(decisionsRoute, {
      body: { proofId, companyId: COMPANY, reviewer: "Anna Koivisto", decision: "meet", feedback: "Clear reasoning on the split. We would like to talk about it." },
    });
    meeting = decided.json.meeting;
  });

  it("only the person can accept, and only the inviting company confirms its side", async () => {
    const noKey = await call(acceptRoute, { body: {}, params: { id: meeting.id } });
    const wrongKey = await call(acceptRoute, { body: { talentId: "t_guess" }, params: { id: meeting.id } });
    const companyAsTalent = await call(confirmRoute, { body: { side: "talent", talentId: "t_guess" }, params: { id: meeting.id } });
    const hidden = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.find((d) => d.proof.proofId === proofId);
    const accepted = await call<Meeting>(acceptRoute, { body: { talentId: TALENT.id }, params: { id: meeting.id } });
    const otherCompany = await call(confirmRoute, { body: { side: "company", companyId: OTHER }, params: { id: meeting.id } });
    const ok =
      noKey.status === 400 && wrongKey.status === 403 && companyAsTalent.status === 403 && !hidden?.identity &&
      accepted.status === 200 && otherCompany.status === 403;
    record(EVAL, "accept and confirm need the right party", `${noKey.status}/${wrongKey.status}/${companyAsTalent.status}/${otherCompany.status}`, ok);
    expect(ok).toBe(true);
  });

  it("no company or city response carries a talent id, even after a meeting is accepted", async () => {
    const data = await getStore().read();
    const body = await publicResponses();
    const found = data.talents.map((t) => t.id).filter((id) => body.includes(id));
    const shown = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.find((d) => d.proof.proofId === proofId);
    const ok = found.length === 0 && shown?.identity?.name === TALENT.name && data.talents.every((t) => !t.id.includes(t.name.split(" ")[0].toLowerCase()));
    record(EVAL, "talent ids in public responses", `${found.length} of ${data.talents.length}`, ok);
    expect(found).toEqual([]);
    expect(ok).toBe(true);
  });

  it("a later request cannot change who the company meets", async () => {
    await call(submissionsRoute, {
      body: { challengeId: "ch-tuulos-ml", talent: { ...TALENT, name: "Mallory Example", contact: "mallory@example.net" }, answer: "Validate the amount first.", explain: [], shareWithSimilar: false },
    });
    const shown = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.find((d) => d.proof.proofId === proofId);
    const ok = shown?.identity?.name === TALENT.name && shown.identity.contact === TALENT.contact;
    record(EVAL, "identity locked after first event proof", ok ? "kept" : "overwritten", ok);
    expect(ok).toBe(true);
  });

  it("a published card passes the same checks as an AI draft", async () => {
    const good = (await call<ChallengeDraft>(draftRoute, { body: { need: "Backend developer for our payments API: API design, error handling, testing" } })).json;
    const biased: ChallengeDraft = {
      ...good,
      title: "Young native Finnish speaker task",
      need: "young native Finnish man, culture fit",
      brief: "Only young native Finnish men. Top candidates get 10/10.",
    };
    const fakeSkill: ChallengeDraft = { ...good, coreSkills: [...good.coreSkills.slice(0, 2), { id: "culture-fit", label: "Culture fit", why: "must be one of us" }] };
    const judgingGuide: ChallengeDraft = { ...good, reviewGuide: good.reviewGuide.map((g) => ({ ...g, lookFor: "Rate 1-10 and recommend the best" })) };
    const statuses = [];
    for (const draft of [biased, fakeSkill, judgingGuide]) {
      statuses.push((await call(approveRoute, { body: { draft, companyId: OTHER, approvedBy: "Eve Example" } })).status);
    }
    const ok200 = (await call(approveRoute, { body: { draft: good, companyId: OTHER, approvedBy: "Eve Example" } })).status;
    const ok = statuses.every((s) => s === 400) && ok200 === 200;
    record(EVAL, "server rejects biased or judging cards", `${statuses.join("/")} then ${ok200}`, ok);
    expect(ok).toBe(true);
  });

  it("decisions need a real name and real feedback", async () => {
    const proof = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.proofs[0].proofId;
    const base = { proofId: proof, companyId: COMPANY, decision: "pass" };
    const dot = await call(decisionsRoute, { body: { ...base, reviewer: ".", feedback: "Thank you, the split point was clear to read." } });
    const dots = await call(decisionsRoute, { body: { ...base, reviewer: "Anna Koivisto", feedback: "....................." } });
    const ok = dot.status === 400 && dots.status === 400;
    record(EVAL, "reviewer '.' and dotted feedback rejected", `${dot.status}/${dots.status}`, ok);
    expect(ok).toBe(true);
  });

  it("the follow-up writer never reads identity", async () => {
    const answer = "My name is Sanna Virtanen, sanna@example.org. Split by grasp attempt so frames of one attempt do not leak into test.";
    const { json } = await call<{ questions: string[] }>(followUpsRoute, { body: { challengeId: "ch-tuulos-ml", answer } });
    const leaked = json.questions.some((q) => /Sanna|Virtanen|example\.org/.test(q));
    record(EVAL, "follow-ups read the redacted answer", leaked ? "identity in a question" : "no identity", !leaked);
    expect(leaked).toBe(false);
  });
});
