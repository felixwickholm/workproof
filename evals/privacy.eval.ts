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
import { POST as declineRoute } from "@/app/api/meetings/[id]/decline/route";
import { GET as passportRoute } from "@/app/api/passport/me/route";
import { POST as pictureReportRoute } from "@/app/api/proofs/[proofId]/picture/report/route";
import { POST as sharingRoute } from "@/app/api/proofs/[proofId]/sharing/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import { POST as tasterRoute } from "@/app/api/taster/route";
import type { BlindProof, Challenge, ChallengeDraft, CityOverview, Company, Decision, Meeting, OwnProof, PassportEntry, ReviewQueue } from "@/lib/domain/types";
import { MAX_BODY_BYTES, MAX_PICTURE_BYTES, MAX_SUBMISSION_BODY_BYTES, POSTS_PER_MINUTE } from "@/lib/http/limits";
import { getStore } from "@/lib/store";
import { CLEAN_JPEG, EXIF_JPEG, jpegOfSize } from "./fixtures/pictures";
import { call, FOLLOW_UPS, ownKey, record, twoFollowUps } from "./helpers";

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
      body: { challengeId: "ch-tuulos-ml", talent: TALENT, answer: "Split by grasp attempt, not by frame. Pick the threshold on validation.", explain: twoFollowUps(), shareWithSimilar: false },
    });
    proofId = submitted.json.proof.proofId;
    const decided = await call<{ decision: Decision; meeting: Meeting }>(decisionsRoute, {
      body: { proofId, companyId: COMPANY, reviewer: "Elias Virta", decision: "meet", feedback: "Clear reasoning on the split. We would like to talk about it." },
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
    record(EVAL, "accept and confirm need the right party", `refused: HTTP ${noKey.status} with no key, HTTP ${wrongKey.status} with a wrong key, HTTP ${companyAsTalent.status} for a guessed talent confirm, HTTP ${otherCompany.status} for another company's confirm`, ok);
    expect(ok).toBe(true);
  });

  it("no company or city response carries a talent id, even after a meeting is accepted", async () => {
    const data = await getStore().read();
    const body = await publicResponses();
    const found = data.talents.map((t) => t.id).filter((id) => body.includes(id));
    const shown = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.find((d) => d.proof.proofId === proofId);
    const ok = found.length === 0 && shown?.identity?.name === TALENT.name && data.talents.every((t) => !t.id.includes(t.name.split(" ")[0].toLowerCase()));
    record(EVAL, "talent ids in public responses", `${found.length} of ${data.talents.length} talent ids found in company and city responses`, ok);
    expect(found).toEqual([]);
    expect(ok).toBe(true);
  });

  it("the private key travels only in a header and never reaches the audit log", async () => {
    const withHeader = await call<PassportEntry[]>(passportRoute, ownKey(TALENT.id));
    const without = await call<{ error: string }>(passportRoute);
    const audit = JSON.stringify((await getStore().read()).audit);
    const ok = withHeader.status === 200 && withHeader.json.length > 0 && without.status === 401 && !audit.includes(TALENT.id) && !without.json.error.includes(TALENT.id);
    record(EVAL, "private key in a header only", ok ? "header read, path form gone, key absent from the audit log" : "key accepted elsewhere or logged", ok);
    expect(ok).toBe(true);
  });

  it("no reviewer-facing response carries a hidden-detail count or redaction categories", async () => {
    const companies = (await call<Company[]>(companiesRoute)).json;
    const found: string[] = [];
    for (const c of companies) {
      const queue = JSON.stringify((await call(queueRoute, { params: { id: c.id } })).json);
      const home = JSON.stringify((await call(employerHomeRoute, { params: { id: c.id } })).json);
      for (const key of ['"hiddenCount"', '"redactions"']) {
        if (queue.includes(key)) found.push(`${c.id} queue: ${key}`);
        if (home.includes(key)) found.push(`${c.id} home: ${key}`);
      }
    }
    const author = (await call<PassportEntry[]>(passportRoute, ownKey(TALENT.id))).json;
    const authorKeeps = author.length > 0 && author.every((entry) => typeof entry.proof.hiddenCount === "number");
    record(EVAL, "hidden count shown to the author only", `${found.length} reviewer responses with a count or categories; author sees the count: ${authorKeeps}`, found.length === 0 && authorKeeps);
    expect(found).toEqual([]);
    expect(authorKeeps).toBe(true);
  });

  it("a later request cannot change who the company meets", async () => {
    await call(submissionsRoute, {
      body: { challengeId: "ch-tuulos-ml", talent: { ...TALENT, name: "Mallory Example", contact: "mallory@example.net" }, answer: "Validate the amount first.", explain: twoFollowUps(), shareWithSimilar: false },
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
    record(EVAL, "server rejects biased or judging cards", `refused: HTTP ${statuses.join(", HTTP ")} for biased, fake-skill and judging cards; HTTP ${ok200} for the clean card`, ok);
    expect(ok).toBe(true);
  });

  it("decisions need a real name and real feedback", async () => {
    const proof = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.proofs[0].proofId;
    const base = { proofId: proof, companyId: COMPANY, decision: "pass" };
    const dot = await call(decisionsRoute, { body: { ...base, reviewer: ".", feedback: "Thank you, the split point was clear to read." } });
    const dots = await call(decisionsRoute, { body: { ...base, reviewer: "Elias Virta", feedback: "....................." } });
    const ok = dot.status === 400 && dots.status === 400;
    record(EVAL, "reviewer '.' and dotted feedback rejected", `refused: HTTP ${dot.status} for reviewer ".", HTTP ${dots.status} for dotted feedback`, ok);
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
      body: { challengeId: "ch-tuulos-ml", talent: person, answer: "Split by grasp attempt so frames of one attempt never reach test.", explain: twoFollowUps() },
    });
    const id = submitted.json.proof.proofId;
    const sharingOf = async () => (await call<PassportEntry[]>(passportRoute, ownKey(person.id))).json.find((e) => e.proof.proofId === id)?.sharing;
    const inSecondLook = async () => (await call<ReviewQueue>(queueRoute, { params: { id: "co-saarnivo" } })).json.secondLook.some((p) => p.proofId === id);

    const offByDefault = (await sharingOf()) === false;
    const stranger = await call(sharingRoute, { body: { talentId: "t_guess", share: true }, params: { proofId: id } });
    const on = await call(sharingRoute, { body: { talentId: person.id, share: true }, params: { proofId: id } });
    await call(decisionsRoute, {
      body: { proofId: id, companyId: COMPANY, reviewer: "Elias Virta", decision: "pass", feedback: "Thank you. This role starts with on-site robot testing this month." },
    });
    const shownAfterPass = await inSecondLook();
    const off = await call(sharingRoute, { body: { talentId: person.id, share: false }, params: { proofId: id } });
    const goneAfterWithdraw = !(await inSecondLook());
    const decideAfter = await call(decisionsRoute, {
      body: { proofId: id, companyId: "co-saarnivo", reviewer: "Mira Salo", decision: "meet", feedback: "We would like to talk about the split." },
    });
    const ok = offByDefault && stranger.status === 403 && on.status === 200 && shownAfterPass && off.status === 200 && goneAfterWithdraw && decideAfter.status === 403;
    record(EVAL, "Second look: opt-in, owner-only, withdrawable", `off by default: ${offByDefault}; HTTP ${stranger.status} for a stranger's switch; HTTP ${decideAfter.status} for a decision after withdrawal`, ok);
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
    record(EVAL, "body cap and rate limit", `HTTP ${bigText.status} for a text body over its cap, HTTP ${bigSubmission.status} for a submission over its cap; request ${POSTS_PER_MINUTE + 1} from one address: HTTP ${last}; story step after that: HTTP ${story.status}`, ok);
    expect(ok).toBe(true);
  });

  it("a picture is accepted only as a clean JPEG made in the browser, and its description is blind", async () => {
    const challengeId = (await call<Challenge[]>(listChallengesRoute)).json[0].id;
    const person = { id: "t_eval_picture_5a1c", name: "Ilona Koski", contact: "ilona.koski@example.org" };
    const send = (attachment: unknown) =>
      call<{ proof: BlindProof }>(submissionsRoute, {
        body: { challengeId, talent: person, answer: "Plated on a separate board, sauce on the side.", explain: twoFollowUps(), attachment },
      });
    const alt = "Ilona Koski's plate on the counter, photo by ilona.koski@example.org";
    const checked = { confirmed: true };
    const refused = [
      await send({ kind: "photo", src: EXIF_JPEG, alt: "A plate", ...checked }),
      await send({ kind: "photo", src: "/demo/sample-plate.jpg", alt: "A plate", ...checked }),
      await send({ kind: "photo", src: "data:image/png;base64,iVBORw0KGgo=", alt: "A plate", ...checked }),
      await send({ kind: "video", src: CLEAN_JPEG, alt: "A plate", ...checked }),
      await send({ kind: "photo", src: jpegOfSize(MAX_PICTURE_BYTES + 1), alt: "A plate", ...checked }),
    ].map((r) => r.status);
    const largest = await send({ kind: "photo", src: jpegOfSize(MAX_PICTURE_BYTES), alt: "A plate", ...checked });
    const clean = await send({ kind: "photo", src: CLEAN_JPEG, alt, ...checked });
    const owner = (await call<Challenge>(challengeRoute, { params: { id: challengeId } })).json.companyIds[0];
    const queue = (await call<ReviewQueue>(queueRoute, { params: { id: owner } })).json;
    const shown = JSON.stringify(queue.proofs.find((p) => p.proofId === clean.json.proof.proofId) ?? null);
    const ok =
      refused.every((s) => s === 400) && largest.status === 200 && clean.status === 200 &&
      clean.json.proof.attachment?.src === CLEAN_JPEG && !/Ilona|Koski|example\.org/.test(shown) && shown.includes(CLEAN_JPEG);
    record(EVAL, "pictures: clean JPEG only, description blind", `refused: HTTP ${refused.join(", HTTP ")} for EXIF, a /demo path, PNG, video, 1 byte over 300 kB; accepted: HTTP ${largest.status} at 300 kB, HTTP ${clean.status} clean`, ok);
    expect(ok).toBe(true);
  });

  it("a picture is refused unless the person confirmed it shows the work only", async () => {
    const person = { id: "t_eval_unchecked_3e9b", name: "Aino Mäkelä", contact: "aino.makela@example.org" };
    const send = (attachment: Record<string, unknown>) =>
      call(submissionsRoute, {
        body: { challengeId: "ch-tuulos-ml", talent: person, answer: "Frames sorted by attempt.", explain: twoFollowUps(), attachment: { kind: "photo", src: CLEAN_JPEG, alt: "Two piles of frames", ...attachment } },
      });
    const missing = await send({});
    const no = await send({ confirmed: false });
    const yes = await send({ confirmed: true });
    const ok = missing.status === 400 && no.status === 400 && yes.status === 200;
    record(EVAL, "pictures: the person's own check is required", `refused: HTTP ${missing.status} without the check, HTTP ${no.status} unchecked; accepted: HTTP ${yes.status} checked`, ok);
    expect(ok).toBe(true);
  });

  it("a reported picture is gone from every company and passport response; the written answer stays", async () => {
    const person = { id: "t_eval_reported_6d0a", name: "Aino Mäkelä", contact: "aino.makela@example.org" };
    // A picture of its own size, so no other proof in this run carries the same bytes.
    const src = jpegOfSize(5_000);
    const sent = await call<{ proof: BlindProof }>(submissionsRoute, {
      body: {
        challengeId: "ch-tuulos-ml",
        talent: person,
        answer: "Frames sorted by attempt, then split.",
        explain: twoFollowUps(),
        attachment: { kind: "photo", src, alt: "Two piles of frames", confirmed: true },
        shareWithSimilar: true,
      },
    });
    const proofId = sent.json.proof.proofId;
    const report = (companyId: string, reviewer: string) => call(pictureReportRoute, { body: { companyId, reviewer }, params: { proofId } });
    const stranger = await report("co-kaari", "Anna Koivisto");
    const unnamed = await report(COMPANY, " ");
    const shownBefore = (await publicResponses()).includes(src);
    const reported = await report(COMPANY, "Mira Salo");
    const passport = (await call<PassportEntry[]>(passportRoute, ownKey(person.id))).json.find((e) => e.proof.proofId === proofId);
    const everywhere = `${await publicResponses()} ${JSON.stringify(passport)}`;
    const audit = (await getStore().read()).audit.filter((e) => e.action === "Reported a picture" && e.actor === "human" && e.by === "Mira Salo");
    const ok =
      stranger.status === 403 && unnamed.status === 400 && shownBefore && reported.status === 200 && !everywhere.includes(src) &&
      passport?.pictureRemoved === true && passport.original.answer === "Frames sorted by attempt, then split." && audit.length === 1;
    record(
      EVAL,
      "pictures: a report removes the picture for everyone",
      `refused: HTTP ${stranger.status} for a company that cannot read it, HTTP ${unnamed.status} without a name; reported: HTTP ${reported.status}; picture in responses after: ${everywhere.includes(src)}`,
      ok,
    );
    expect(ok).toBe(true);
  });

  it("an event proof needs two follow-up answers, a practice proof one", async () => {
    const person = { id: "t_eval_followups_1b4c", name: "Aino Mäkelä", contact: "aino.makela@example.org" };
    const send = (challengeId: string, explain: unknown[]) =>
      call(submissionsRoute, { body: { challengeId, talent: person, answer: "Split by attempt.", explain } });
    const none = await send("ch-tuulos-ml", []);
    const one = await send("ch-tuulos-ml", [FOLLOW_UPS[0]]);
    const blank = await send("ch-tuulos-ml", [FOLLOW_UPS[0], { question: FOLLOW_UPS[1].question, answer: "   " }]);
    const two = await send("ch-tuulos-ml", FOLLOW_UPS);
    const taster = (await call<Challenge>(tasterRoute, { body: { dreamJob: "Data analyst" } })).json;
    const practiceNone = await send(taster.id, []);
    const practiceOne = await send(taster.id, [FOLLOW_UPS[0]]);
    const ok = [none, one, blank, practiceNone].every((r) => r.status === 400) && two.status === 200 && practiceOne.status === 200;
    record(
      EVAL,
      "follow-up answers are required",
      `event: HTTP ${none.status} with none, HTTP ${one.status} with one, HTTP ${blank.status} with a blank one, HTTP ${two.status} with two; practice: HTTP ${practiceNone.status} with none, HTTP ${practiceOne.status} with one`,
      ok,
    );
    expect(ok).toBe(true);
  });

  it("a practice proof keeps no name: no stored field contains it", async () => {
    const name = "Wilhelmiina Karppinen";
    const taster = (await call<Challenge>(tasterRoute, { body: { dreamJob: "Nurse" } })).json;
    const sent = await call<{ proof: OwnProof }>(submissionsRoute, {
      body: {
        challengeId: taster.id,
        talent: { id: "t_eval_practice_9a2f", name, contact: "" },
        answer: "I am Wilhelmiina. I would call the family first, then the doctor.",
        explain: [{ question: "Why the family first?", answer: "Wilhelmiina here: they know the medicines." }],
      },
    });
    const stored = JSON.stringify(await getStore().read());
    const ok = sent.status === 200 && sent.json.proof.hiddenCount > 0 && !/Wilhelmiina|Karppinen/.test(stored);
    record(EVAL, "practice proof keeps no name", `HTTP ${sent.status}; the given name in the store: ${/Wilhelmiina|Karppinen/.test(stored) ? "found" : "nowhere"}`, ok);
    expect(ok).toBe(true);
  });

  it("a person can decline an invitation and the name is never revealed", async () => {
    const person = { id: "t_eval_decline_5c8e", name: "Amira Haddad", contact: "amira.haddad@example.org" };
    const sent = await call<{ proof: BlindProof }>(submissionsRoute, {
      body: { challengeId: "ch-tuulos-ml", talent: person, answer: "Split by attempt; tune on validation.", explain: twoFollowUps() },
    });
    const decided = await call<{ meeting: Meeting }>(decisionsRoute, {
      body: { proofId: sent.json.proof.proofId, companyId: COMPANY, reviewer: "Elias Virta", decision: "meet", feedback: "Clear reasoning on the split. We would like to talk about it." },
    });
    const id = decided.json.meeting.id;
    const funnelBefore = (await call<CityOverview>(cityRoute)).json.insights.funnel;
    const stranger = await call(declineRoute, { body: { talentId: "t_guess" }, params: { id } });
    const declined = await call<Meeting>(declineRoute, { body: { talentId: person.id }, params: { id } });
    const acceptAfter = await call<Meeting>(acceptRoute, { body: { talentId: person.id }, params: { id } });
    const entry = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.find((d) => d.meeting?.id === id);
    const revealed = /Amira|Haddad/.test(await publicResponses());
    const funnelAfter = (await call<CityOverview>(cityRoute)).json.insights.funnel;
    const ok =
      stranger.status === 403 && declined.json.status === "declined" && acceptAfter.json.status === "declined" && entry?.meeting?.status === "declined" &&
      !entry.identity && !revealed && funnelAfter.accepted === funnelBefore.accepted && funnelAfter.invited === funnelBefore.invited;
    record(
      EVAL,
      "decline keeps the name hidden",
      `HTTP ${stranger.status} for a stranger; status after decline: ${declined.json.status}, after a later accept: ${acceptAfter.json.status}; name in responses: ${revealed}`,
      ok,
    );
    expect(ok).toBe(true);
  });

  it("after a Second look withdrawal, an employer that answered keeps its decision but no longer reads the work", async () => {
    const person = { id: "t_eval_withdraw_7e1d", name: "Ilona Koski", contact: "ilona@example.org" };
    const work = "Split frames by grasp attempt so one attempt never sits on both sides.";
    const sent = await call<{ proof: BlindProof }>(submissionsRoute, {
      body: { challengeId: "ch-tuulos-ml", talent: person, answer: work, explain: twoFollowUps(), shareWithSimilar: true },
    });
    const proofId = sent.json.proof.proofId;
    await call(decisionsRoute, {
      body: { proofId, companyId: COMPANY, reviewer: "Elias Virta", decision: "pass", feedback: "Thank you. This role starts with on-site robot testing this month." },
    });
    // Saarnivo shares core skills with the task, so it reads the proof through Second look once the owner said not now.
    const reader = "co-saarnivo";
    await call(decisionsRoute, {
      body: { proofId, companyId: reader, reviewer: "Mira Salo", decision: "pass", feedback: "Thank you. Clear split; we hire for this skill in spring." },
    });
    const before = (await call<ReviewQueue>(queueRoute, { params: { id: reader } })).json.decided.find((d) => d.proof.proofId === proofId);
    await call(sharingRoute, { body: { talentId: person.id, share: false }, params: { proofId } });
    const after = (await call<ReviewQueue>(queueRoute, { params: { id: reader } })).json.decided.find((d) => d.proof.proofId === proofId);
    const owner = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json.decided.find((d) => d.proof.proofId === proofId);
    const ok =
      before?.proof.work.includes("grasp attempt") === true && after?.withdrawn === true && after.proof.work === "The person withdrew this proof from Second look." &&
      !JSON.stringify(after).includes("grasp attempt") && after.decision.feedback.startsWith("Thank you. Clear split") && owner?.proof.work.includes("grasp attempt") === true;
    record(EVAL, "Second look withdrawal reaches decided proofs", `work shown to the Second look employer after withdrawal: ${JSON.stringify(after ?? {}).includes("grasp attempt")}; its decision kept: ${Boolean(after?.decision)}`, ok);
    expect(ok).toBe(true);
  });
});
