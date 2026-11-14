import { beforeAll, describe, expect, it } from "vitest";
import { GET as cityRoute } from "@/app/api/city/route";
import { POST as draftRoute } from "@/app/api/challenges/draft/route";
import { GET as queueRoute } from "@/app/api/companies/[id]/queue/route";
import { POST as decisionsRoute } from "@/app/api/decisions/route";
import { POST as resetRoute } from "@/app/api/demo/reset/route";
import { POST as followUpsRoute } from "@/app/api/followups/route";
import { POST as submissionsRoute } from "@/app/api/submissions/route";
import type { BlindProof, ChallengeDraft, CityOverview, ReviewQueue } from "@/lib/domain/types";
import { collectText, findJudgement } from "@/lib/guard/no-judgement";
import { getStore } from "@/lib/store";
import { omit } from "@/lib/util/object";
import { NEEDS } from "./fixtures/needs";
import { SUBMISSIONS } from "./fixtures/submissions";
import { call, record } from "./helpers";

const EVAL = "3 No automated decisions";

const JUDGING = [
  "This candidate scores 8/10 on the task.",
  "I would rate this work 4 out of 5.",
  "A 4 stars submission.",
  "Score: 72",
  "She is an 85% match for the role.",
  "Fit: 90%",
  "This is the top candidate in the queue.",
  "The best submission we received.",
  "Ranked first among all proofs.",
  "He is the #1 pick.",
  "Clearly stronger than the other applicants.",
  "Better than most people who tried this.",
  "We recommend moving forward with this person.",
  "You should hire this person.",
  "A good fit for the team.",
  "Strong candidate for the role.",
  "The reasoning is weak in places.",
  "An impressive piece of work.",
  "Excellent analysis of the problem.",
  "Poor attention to detail.",
  "This person stands out from the rest.",
  "Highly qualified for the position.",
  "Lacks the experience we need.",
  "Their work is above average.",
  "This one is shortlisted.",
];

const NEUTRAL = [
  "The query returns 10 rows.",
  "Retry 3 times with backoff.",
  "Names two issues in the change: the missing timeout and the unbounded retry.",
  "Proposes a fix for the first issue. Does not mention tests.",
  "The answer is 140 words long.",
  "Uses a best-effort queue for notifications.",
  "Follows best practice for secrets.",
  "Test coverage on this module is 70%.",
  "The model reports 97% accuracy on the test set.",
  "The job runs every 5 minutes.",
  "Adds a timeout of 5 seconds to the fetch call.",
  "Points to line 12 where the threshold is chosen.",
  "Suggests a weak password check be replaced with a policy.",
  "Describes a rollout to one robot first.",
  "Mentions the 4% of grasps that fail.",
  "Example: 1/2 + 1/3 = 2/5 is a common mistake.",
  "Splits the data by grasp attempt instead of by frame.",
  "Asks who owns the vendor contract.",
  "The lesson plan has 45 minutes of activities.",
  "Compares MAE with MAPE for hours near zero load.",
  "Writes a reply that does not promise a fix date.",
  "Lists three risks with an owner for each.",
  "Moves the threshold choice to a validation split.",
  "Notes that the dashboard uses a truncated axis.",
  "Keeps the change behind a feature flag.",
];

describe("Eval 3: no automated decisions", () => {
  const aiTexts: string[] = [];

  beforeAll(async () => {
    await call(resetRoute, { method: "POST" });
    for (const need of NEEDS) {
      const { json } = await call<ChallengeDraft>(draftRoute, { body: { need: need.need } });
      aiTexts.push(...collectText(omit(json, ["setAside", "need"])));
    }
    for (const [i, fixture] of SUBMISSIONS.entries()) {
      const { json: f } = await call<{ questions: string[] }>(followUpsRoute, { body: { challengeId: "ch-tuulos-ml", answer: fixture.answer } });
      aiTexts.push(...f.questions);
      const { json } = await call<{ proof: BlindProof }>(submissionsRoute, {
        body: {
          challengeId: "ch-tuulos-ml",
          talent: { id: `eval3-${i}`, name: fixture.name, contact: fixture.contact },
          answer: fixture.answer,
          explain: f.questions.map((question) => ({ question, answer: fixture.explain })),
          shareWithSimilar: i % 2 === 0,
        },
      });
      aiTexts.push(json.proof.aiSummary);
    }
  });

  it("(a) the guard rejects 25 judging phrases and passes 25 neutral ones", () => {
    const missed = JUDGING.filter((p) => findJudgement(p).length === 0);
    const flagged = NEUTRAL.filter((p) => findJudgement(p).length > 0);
    record(EVAL, "(a) guard: judging rejected", `${JUDGING.length - missed.length}/${JUDGING.length}`, missed.length === 0);
    record(EVAL, "(a) guard: neutral passed", `${NEUTRAL.length - flagged.length}/${NEUTRAL.length}`, flagged.length === 0);
    expect(JUDGING).toHaveLength(25);
    expect(NEUTRAL).toHaveLength(25);
    expect(missed).toEqual([]);
    expect(flagged).toEqual([]);
  });

  it("(b) every AI output from evals 1 and 2 passes the guard", () => {
    const hits = aiTexts.flatMap(findJudgement);
    record(EVAL, "(b) AI outputs pass the guard", `${aiTexts.length - hits.length}/${aiTexts.length}`, hits.length === 0);
    expect(hits).toEqual([]);
  });

  it("(c) every queue is in arrival order", async () => {
    const companies = (await getStore().read()).companies;
    let ordered = true;
    for (const company of companies) {
      const { json } = await call<ReviewQueue>(queueRoute, { params: { id: company.id } });
      for (const list of [json.proofs, json.secondLook]) {
        const times = list.map((p) => p.submittedAt);
        if (times.join() !== [...times].sort().join()) ordered = false;
      }
    }
    record(EVAL, "(c) queues in arrival order", ordered ? "yes" : "no", ordered);
    expect(ordered).toBe(true);
  });

  it("(d) no decision without a named human and feedback", async () => {
    const proofId = (await call<ReviewQueue>(queueRoute, { params: { id: "co-tuulos" } })).json.proofs[0].proofId;
    const base = { proofId, companyId: "co-tuulos", decision: "pass" };
    const noName = await call(decisionsRoute, { body: { ...base, reviewer: " ", feedback: "Thank you, this was a clear answer to read." } });
    const noFeedback = await call(decisionsRoute, { body: { ...base, reviewer: "Anna Koivisto", feedback: "No." } });
    const decisions = (await getStore().read()).decisions;
    const allNamed = decisions.every((d) => d.reviewer.trim() && d.feedback.trim().length >= 20);
    const ok = noName.status === 400 && noFeedback.status === 400 && allNamed;
    record(EVAL, "(d) decisions need reviewer and feedback", `${noName.status}/${noFeedback.status}, ${decisions.length} stored all named`, ok);
    expect(ok).toBe(true);
  });

  it("(e) the city reports 0 automated decisions and the audit log agrees", async () => {
    const { json } = await call<CityOverview>(cityRoute);
    const decisionActions = new Set(["Chose to meet", "Passed with feedback"]);
    const aiDecisions = json.audit.filter((e) => decisionActions.has(e.action) && e.actor !== "human");
    const ok = json.totals.automatedDecisions === 0 && aiDecisions.length === 0 && json.totals.humanDecisions > 0;
    record(EVAL, "(e) automated decisions", `${json.totals.automatedDecisions} (audit: ${aiDecisions.length} non-human)`, ok);
    expect(ok).toBe(true);
  });
});
