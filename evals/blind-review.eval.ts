import { beforeAll, describe, expect, it } from "vitest";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as acceptRoute } from "@/app/api/meetings/[id]/accept/route";
import { POST as tasterRoute } from "@/app/api/taster/route";
import type { BlindProof, Decision, Meeting, ReviewQueue } from "@/lib/domain/types";
import { REDACTION_CASES } from "./fixtures/redaction-cases";
import { REDACTION_CASES_2 } from "./fixtures/redaction-cases-2";
import { SUBMISSIONS } from "./fixtures/submissions";
import { TABLE_INPUTS, TABLE_KNOWN, TABLE_TECHNICAL } from "./fixtures/table-inputs";
import { getStore } from "@/lib/store";
import { call, decide, keysDeep, record, submit, twoFollowUps } from "./helpers";

const EVAL = "2 Blind review";
const CHALLENGE = "ch-tuulos-ml";
const COMPANY = "co-tuulos";
const FORBIDDEN_KEYS = ["name", "contact", "email", "photo", "avatar", "talentId", "phone", "redactions"];
const TYPED_TOKENS = /\[(?:name|contact|school|place|employer|personal detail)\]/;

describe("Eval 2: blind review", () => {
  const proofIds: string[] = [];
  let queue: ReviewQueue;
  /**
   * The redaction batches send hundreds of answers. An event task takes a limited number, so they go
   * to a practice task, which has no limit and runs the same blind layer.
   */
  let practiceTask = "";

  beforeAll(async () => {
    await call(resetRoute, { method: "POST" });
    practiceTask = (await call<{ id: string }>(tasterRoute, { body: { dreamJob: "ML engineer" } })).json.id;
    for (const [i, fixture] of SUBMISSIONS.entries()) {
      const { json: followUps } = await call<{ questions: string[] }>(followUpsRoute, {
        body: { challengeId: CHALLENGE, answer: fixture.answer },
      });
      const { status, json } = await submit<{ proof: BlindProof }>({
        body: {
          challengeId: CHALLENGE,
          talent: { id: `eval-talent-${i}`, name: fixture.name, contact: fixture.contact },
          answer: fixture.answer,
          explain: followUps.questions.map((question, q) => ({ question, answer: q === 0 ? fixture.explain : "Same reasoning." })),
          shareWithSimilar: true,
        },
      });
      expect(status).toBe(200);
      proofIds.push(json.proof.proofId);
    }
    queue = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
  });

  it("all 12 proofs are in the queue", () => {
    const ids = new Set(queue.proofs.map((p) => p.proofId));
    expect(proofIds.every((id) => ids.has(id))).toBe(true);
  });

  it("no planted identity string appears in the serialized queue", () => {
    const serialized = JSON.stringify(queue).toLowerCase();
    const leaks = SUBMISSIONS.flatMap((s) => s.planted.filter((p) => serialized.includes(p.toLowerCase())).map((p) => `${s.name}: ${p}`));
    const planted = SUBMISSIONS.reduce((n, s) => n + s.planted.length, 0);
    record(EVAL, "planted strings in reviewer payload", `${leaks.length} of ${planted} planted strings found`, leaks.length === 0);
    expect(leaks).toEqual([]);
  });

  it("proof payloads have no identity keys", () => {
    const keys = new Set(keysDeep([...queue.proofs, ...queue.secondLook]));
    const found = FORBIDDEN_KEYS.filter((k) => keys.has(k));
    record(EVAL, "identity keys in proof payloads", found.length ? `found: ${found.join(", ")}` : "no identity keys found", found.length === 0);
    expect(found).toEqual([]);
  });

  it("identity appears only after the person accepts the meeting", async () => {
    const proofId = proofIds[0];
    const { json } = await decide<{ decision: Decision; meeting: Meeting }>({
      body: { proofId, companyId: COMPANY, reviewer: "Elias Virta", decision: "meet", feedback: "Clear reasoning on the split. We would like to talk about it." },
    });
    const before = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
    const invited = before.decided.find((d) => d.proof.proofId === proofId);
    expect(invited?.identity).toBeUndefined();
    expect(JSON.stringify(before)).not.toContain("Haddad");

    await call(acceptRoute, { body: { talentId: "eval-talent-0" }, params: { id: json.meeting.id } });
    const after = (await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } })).json;
    const accepted = after.decided.find((d) => d.proof.proofId === proofId);
    const ok = accepted?.identity?.name === "Leila Haddad";
    record(EVAL, "identity hidden until accepted", ok ? "hidden, then shown" : "wrong", ok);
    expect(ok).toBe(true);
  });

  it("hides identity in the forms people really write it (54 review cases)", async () => {
    const leaked: string[] = [];
    for (const [i, c] of REDACTION_CASES.entries()) {
      const { json } = await submit<{ proof: BlindProof }>({
        body: {
          challengeId: practiceTask,
          talent: { id: `eval-case-${i}`, name: "Leila Haddad", contact: "leila@example.org" },
          answer: c.answer,
          explain: twoFollowUps(c.explain ? [{ question: "Why?", answer: c.explain }] : []),
          shareWithSimilar: false,
        },
      });
      const blob = `${json.proof.work} ${JSON.stringify(json.proof.explain)}`;
      const found = c.leaks.filter((needle) => blob.includes(needle));
      if (found.length > 0) leaked.push(`${c.title}: ${found.join(", ")}`);
    }
    const passed = REDACTION_CASES.length - leaked.length;
    record(EVAL, "review cases hidden", `${passed} of ${REDACTION_CASES.length} cases fully hidden`, leaked.length === 0);
    expect(REDACTION_CASES).toHaveLength(54);
    expect(leaked).toEqual([]);
  });

  it("hides identity in 72 more forms from a second review, except the limits the README names", async () => {
    const leaked: string[] = [];
    const limits: string[] = [];
    for (const [i, c] of REDACTION_CASES_2.entries()) {
      const { json } = await submit<{ proof: BlindProof }>({
        body: {
          challengeId: practiceTask,
          talent: { id: `eval-case2-${i}`, name: c.name ?? "Sanna Virtanen", contact: c.contact ?? "sanna.virtanen@example.org" },
          answer: c.answer,
          explain: twoFollowUps(c.explain),
          shareWithSimilar: false,
        },
      });
      const blob = `${json.proof.work}\n${json.proof.explain.map((e) => `${e.question} ${e.answer}`).join("\n")}`.toLowerCase();
      const found = c.leaks.filter((needle) => blob.includes(needle.toLowerCase()));
      if (found.length === 0) continue;
      (c.knownLimit ? limits : leaked).push(`${c.title}: ${found.join(", ")}`);
    }
    const hidden = REDACTION_CASES_2.length - leaked.length - limits.length;
    record(EVAL, "second review cases hidden", `${hidden} of ${REDACTION_CASES_2.length} cases fully hidden, ${limits.length} known limits`, leaked.length === 0);
    expect(REDACTION_CASES_2).toHaveLength(72);
    expect(leaked).toEqual([]);
  });

  it(`visitor inputs from the table: ${TABLE_INPUTS.length} forms all hidden, ${TABLE_TECHNICAL.length} technical texts intact`, async () => {
    const send = async (answer: string, i: number) =>
      (
        await submit<{ proof: BlindProof }>({
          body: { challengeId: practiceTask, talent: { id: `eval-table-${i}`, name: TABLE_KNOWN.name, contact: TABLE_KNOWN.contact }, answer, explain: twoFollowUps(), shareWithSimilar: false },
        })
      ).json.proof;
    const leaked: string[] = [];
    for (const [i, c] of TABLE_INPUTS.entries()) {
      const work = (await send(c.answer, i)).work.toLowerCase();
      const found = c.leaks.filter((needle) => work.includes(needle.toLowerCase()));
      if (found.length > 0) leaked.push(`${c.answer.slice(0, 40)}: ${found.join(", ")}`);
    }
    const changed: string[] = [];
    for (const [i, text] of TABLE_TECHNICAL.entries()) {
      const work = (await send(text, TABLE_INPUTS.length + i)).work;
      if (work !== text) changed.push(work);
    }
    record(
      EVAL,
      "visitor inputs from the table",
      `${TABLE_INPUTS.length - leaked.length} of ${TABLE_INPUTS.length} forms fully hidden; ${TABLE_TECHNICAL.length - changed.length} of ${TABLE_TECHNICAL.length} technical texts unchanged`,
      leaked.length === 0 && changed.length === 0,
    );
    expect(leaked).toEqual([]);
    expect(changed).toEqual([]);
  });

  it("keeps ordinary words and technical terms intact", async () => {
    const cases = [
      { name: "Will May", answer: "I will split by attempt. It may leak otherwise, and that will hurt." },
      { name: "An Le", answer: "This is an obvious leak. Use an attempt id." },
      { name: "Mark Price", answer: "The price is wrong. Will this hold? May be not." },
      { name: "Sanna Virtanen", answer: "```python\nuser = request.session.me\napp = flask.app\ncfg = settings.dev\n```\nSee https://scikit-learn.org/stable/ for GroupKFold." },
      {
        name: "Leila Haddad",
        answer: "I am Confident this is fine. This is GroupShuffleSplit at Scale. Ask for Approval. Run it at Night. Use Pandas for this. Look at Figure 2. I'm Running Python.",
      },
    ];
    const changed: string[] = [];
    for (const [i, c] of cases.entries()) {
      const { json } = await submit<{ proof: BlindProof }>({
        body: { challengeId: practiceTask, talent: { id: `eval-fp-${i}`, name: c.name, contact: "x@example.org" }, answer: c.answer, explain: twoFollowUps(), shareWithSimilar: false },
      });
      if (json.proof.work !== c.answer) changed.push(json.proof.work);
    }
    record(EVAL, "technical text left intact", `${cases.length - changed.length} of ${cases.length} answers unchanged`, changed.length === 0);
    expect(changed).toEqual([]);
  });

  it("the reviewer sees one neutral token, never a count of hidden details or their categories", async () => {
    const { json } = await call<ReviewQueue>(queueRoute, { params: { id: COMPANY } });
    const serialized = JSON.stringify(json);
    const ok = !TYPED_TOKENS.test(serialized) && !serialized.includes('"redactions"') && !serialized.includes('"hiddenCount"') && json.proofs.length > 0;
    record(EVAL, "reviewer payload: [hidden] only, no count", ok ? "one token, no count, no categories" : "a count, categories or typed tokens shown", ok);
    expect(ok).toBe(true);
  });

  it("every proof label is unique", async () => {
    const labels = (await getStore().read()).proofs.map((p) => p.label);
    const unique = new Set(labels).size === labels.length;
    record(EVAL, "unique proof labels", `${new Set(labels).size} distinct labels for ${labels.length} proofs`, unique);
    expect(unique).toBe(true);
  });
});
