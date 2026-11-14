import { beforeAll, describe, expect, it } from "vitest";
import { GET as challengeRoute } from "@/app/api/challenges/[id]/route";
import { POST as draftRoute } from "@/app/api/challenges/draft/route";
import { GET as listChallengesRoute, POST as approveRoute } from "@/app/api/challenges/route";
import { GET as cityRoute } from "@/app/api/city/route";
import { GET as employerHomeRoute } from "@/app/api/companies/[id]/home/route";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { GET as companiesRoute } from "@/app/api/companies/route";
import { POST as decisionsRoute } from "@/app/api/decisions/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as storyRoute } from "@/app/api/demo/story/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as acceptRoute } from "@/app/api/meetings/[id]/accept/route";
import { POST as confirmRoute } from "@/app/api/meetings/[id]/confirm/route";
import { GET as passportRoute } from "@/app/api/passport/[talentId]/route";
import { POST as sharingRoute } from "@/app/api/proofs/[proofId]/sharing/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import type { BlindProof, Challenge, ChallengeDraft, Company, Decision, Meeting, PassportEntry, ReviewQueue } from "@/lib/domain/types";
import { MAX_BODY_BYTES, MAX_PICTURE_BYTES, MAX_SUBMISSION_BODY_BYTES, POSTS_PER_MINUTE } from "@/lib/http/limits";
import { getStore } from "@/lib/store";
import { CLEAN_JPEG, EXIF_JPEG, jpegOfSize } from "./fixtures/pictures";
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
  for (const c of companies) parts.push((await call(employerHomeRoute, { params: { id: c.id } })).json);
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

  it("Second look is off until the person turns it on, and turning it off takes the proof out again", async () => {
    const person = { id: "t_eval_sharing_1d2e", name: "Ilona Koski", contact: "ilona@example.org" };
    const submitted = await call<{ proof: BlindProof }>(submissionsRoute, {
      body: { challengeId: "ch-tuulos-ml", talent: person, answer: "Split by grasp attempt so frames of one attempt never reach test.", explain: [] },
    });
    const id = submitted.json.proof.proofId;
    const sharingOf = async () => (await call<PassportEntry[]>(passportRoute, { params: { talentId: person.id } })).json.find((e) => e.proof.proofId === id)?.sharing;
    const inSecondLook = async () => (await call<ReviewQueue>(queueRoute, { params: { id: "co-saarnivo" } })).json.secondLook.some((p) => p.proofId === id);

    const offByDefault = (await sharingOf()) === false;
    const stranger = await call(sharingRoute, { body: { talentId: "t_guess", share: true }, params: { proofId: id } });
    const on = await call(sharingRoute, { body: { talentId: person.id, share: true }, params: { proofId: id } });
    await call(decisionsRoute, {
      body: { proofId: id, companyId: COMPANY, reviewer: "Anna Koivisto", decision: "pass", feedback: "Thank you. This role starts with on-site robot testing this month." },
    });
    const shownAfterPass = await inSecondLook();
    const off = await call(sharingRoute, { body: { talentId: person.id, share: false }, params: { proofId: id } });
    const goneAfterWithdraw = !(await inSecondLook());
    const decideAfter = await call(decisionsRoute, {
      body: { proofId: id, companyId: "co-saarnivo", reviewer: "Mira Salo", decision: "meet", feedback: "We would like to talk about the split." },
    });
    const ok = offByDefault && stranger.status === 403 && on.status === 200 && shownAfterPass && off.status === 200 && goneAfterWithdraw && decideAfter.status === 403;
    record(EVAL, "Second look: opt-in, owner-only, withdrawable", `default off ${offByDefault}, stranger ${stranger.status}, after withdraw ${decideAfter.status}`, ok);
    expect(ok).toBe(true);
  });

  it("talent never sees the company's own words or set-aside wishes", async () => {
    const draft = (await call<ChallengeDraft>(draftRoute, { body: { need: "Data analyst with no career gaps, born and raised here, SQL and dashboards" } })).json;
    const card = await call<Challenge>(approveRoute, { body: { draft: { ...draft, need: "Born and raised here, no career gaps" }, companyId: OTHER, approvedBy: "Eve Example" } });
    const shown = JSON.stringify((await call<Challenge>(challengeRoute, { params: { id: card.json.id } })).json);
    const ok = card.status === 200 && draft.yourWords !== undefined && !/born and raised|career gaps/i.test(shown);
    record(EVAL, "company's own sentence kept from talent", ok ? "rebuilt need only" : "leaked", ok);
    expect(ok).toBe(true);
  });

  it("requests are bounded: body size and, for remote callers, rate", async () => {
    const junk = (bytes: number) =>
      new Request("http://localhost/api", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ junk: "x".repeat(bytes) }) });
    const bigText = await followUpsRoute(junk(MAX_BODY_BYTES));
    const bigSubmission = await submissionsRoute(junk(MAX_SUBMISSION_BODY_BYTES));
    const remote = () =>
      followUpsRoute(
        new Request("http://localhost/api", {
          method: "POST",
          headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
          body: JSON.stringify({ challengeId: "ch-tuulos-ml", answer: "Split by attempt." }),
        }),
      );
    let last = 200;
    for (let i = 0; i <= POSTS_PER_MINUTE; i++) last = (await remote()).status;
    // The walkthrough's story steps have their own count, so they still work for this caller.
    const story = await storyRoute(
      new Request("http://localhost/api", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "203.0.113.9" },
        body: JSON.stringify({ stage: "invited" }),
      }),
    );
    const ok = bigText.status === 413 && bigSubmission.status === 413 && last === 429 && story.status === 200;
    record(EVAL, "body cap and rate limit", `${bigText.status}/${bigSubmission.status} / ${last}, story ${story.status}`, ok);
    expect(ok).toBe(true);
  });

  it("a picture is accepted only as a clean JPEG made in the browser, and its description is blind", async () => {
    const challengeId = (await call<Challenge[]>(listChallengesRoute)).json[0].id;
    const person = { id: "t_eval_picture_5a1c", name: "Ilona Koski", contact: "ilona.koski@example.org" };
    const send = (attachment: unknown) =>
      call<{ proof: BlindProof }>(submissionsRoute, {
        body: { challengeId, talent: person, answer: "Plated on a separate board, sauce on the side.", explain: [], attachment },
      });
    const alt = "Ilona Koski's plate on the counter, photo by ilona.koski@example.org";
    const refused = [
      await send({ kind: "photo", src: EXIF_JPEG, alt: "A plate" }),
      await send({ kind: "photo", src: "/demo/sample-plate.jpg", alt: "A plate" }),
      await send({ kind: "photo", src: "data:image/png;base64,iVBORw0KGgo=", alt: "A plate" }),
      await send({ kind: "video", src: CLEAN_JPEG, alt: "A plate" }),
      await send({ kind: "photo", src: jpegOfSize(MAX_PICTURE_BYTES + 1), alt: "A plate" }),
    ].map((r) => r.status);
    const largest = await send({ kind: "photo", src: jpegOfSize(MAX_PICTURE_BYTES), alt: "A plate" });
    const clean = await send({ kind: "photo", src: CLEAN_JPEG, alt });
    const owner = (await call<Challenge>(challengeRoute, { params: { id: challengeId } })).json.companyIds[0];
    const queue = (await call<ReviewQueue>(queueRoute, { params: { id: owner } })).json;
    const shown = JSON.stringify(queue.proofs.find((p) => p.proofId === clean.json.proof.proofId) ?? null);
    const ok =
      refused.every((s) => s === 400) && largest.status === 200 && clean.status === 200 &&
      clean.json.proof.attachment?.src === CLEAN_JPEG && !/Ilona|Koski|example\.org/.test(shown) && shown.includes(CLEAN_JPEG);
    record(EVAL, "pictures: clean JPEG only, description blind", `refused ${refused.join("/")}, accepted ${largest.status}/${clean.status}`, ok);
    expect(ok).toBe(true);
  });
});
