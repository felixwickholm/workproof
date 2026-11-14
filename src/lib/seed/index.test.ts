import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { roleFor } from "@/lib/ai/scripted/compose";
import { toBlindProof } from "@/lib/blind/project";
import { decisionInputProblem } from "@/lib/domain/decision-rules";
import type { ProofKind, StoryStage } from "@/lib/domain/types";
import { collectText, findJudgement } from "@/lib/guard/no-judgement";
import { protectedNames } from "@/lib/guard/protected";
import { secondLookMatches } from "@/lib/matching/second-look";
import { median } from "@/lib/service/reply-totals";
import { buildSeed } from ".";
import { REVIEWERS } from "./companies";
import { PEOPLE } from "./people";
import { OLENA_EARLIER_PLAN_ID, OLENA_STORY, STORY_PROOF_ID, STORY_STAGES } from "./story";

const NOW = new Date("2026-11-14T12:00:00.000Z");
const HOUR = 3_600_000;
const KINDS: ProofKind[] = ["writing", "plan", "photo", "video", "voice", "design", "code"];
const hoursBefore = (iso: string) => (NOW.getTime() - new Date(iso).getTime()) / HOUR;
const build = (stage: StoryStage) => buildSeed(NOW, stage);

describe("seed world", () => {
  const data = build("invited");
  const ownerOf = (proofId: string) => {
    const submission = data.submissions.find((s) => s.id === proofId);
    return data.challenges.find((c) => c.id === submission?.challengeId)?.companyIds ?? [];
  };

  it("has the employers, tasks, people and decisions the contract describes", () => {
    expect(data.companies).toHaveLength(10);
    expect(data.challenges).toHaveLength(14);
    expect(data.challenges.filter((c) => c.companyIds.length === 2)).toHaveLength(2);
    expect(data.proofs.length).toBeGreaterThanOrEqual(42);
    expect(data.proofs.length).toBeLessThanOrEqual(50);
    expect(data.talents.length).toBeGreaterThanOrEqual(26);
    expect(data.talents.length).toBeLessThanOrEqual(30);
    const answered = new Set(data.decisions.map((d) => d.proofId));
    expect(answered.size).toBeGreaterThanOrEqual(28);
    expect(answered.size).toBeLessThanOrEqual(34);
    const meets = data.decisions.filter((d) => d.decision === "meet").length;
    expect(meets).toBeGreaterThanOrEqual(9);
    expect(meets).toBeLessThanOrEqual(13);
    expect(data.meetings.length).toBeGreaterThanOrEqual(8);
    expect(data.meetings.length).toBeLessThanOrEqual(11);
    expect(new Set(data.meetings.map((m) => m.status))).toEqual(new Set(["invited", "accepted", "declined", "met"]));
    expect(data.decisions.filter((d) => !ownerOf(d.proofId).includes(d.companyId))).toHaveLength(3);
  });

  it("covers every proof kind in tasks and in proofs", () => {
    expect(new Set(data.challenges.map((c) => c.proofKind))).toEqual(new Set(KINDS));
    expect(new Set(data.proofs.map((p) => p.proofKind))).toEqual(new Set(KINDS));
    expect(data.submissions.some((s) => s.spoken)).toBe(true);
    expect(data.submissions.some((s) => s.explain.some((e) => e.spoken))).toBe(true);
  });

  it("publishes tasks 1 to 9 days before the event, with the bias bait set aside", () => {
    for (const c of data.challenges) {
      expect(hoursBefore(c.createdAt) / 24).toBeGreaterThanOrEqual(1);
      expect(hoursBefore(c.createdAt) / 24).toBeLessThanOrEqual(9);
    }
    expect(data.challenges.some((c) => c.setAside.some((line) => line.startsWith("Not used:")))).toBe(true);
  });

  it("leads the newest tasks with five different kinds of work, none of them code, and the story task", () => {
    const newest = [...data.challenges].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    const kinds = newest.map((c) => c.proofKind);
    expect(new Set(kinds).size).toBe(5);
    expect(kinds).not.toContain("code");
    expect(newest.map((c) => c.id)).toContain(`ch-${OLENA_STORY.challenge}`);
  });

  it("receives every proof after its task was published", () => {
    for (const stage of STORY_STAGES) {
      const stageData = build(stage);
      for (const s of stageData.submissions) {
        const challenge = stageData.challenges.find((c) => c.id === s.challengeId);
        expect(new Date(s.submittedAt).getTime()).toBeGreaterThan(new Date(challenge?.createdAt ?? NOW).getTime());
      }
    }
  });

  it("gives every decision a named reviewer and kind, specific feedback that never scores or ranks", () => {
    for (const d of data.decisions) {
      expect(d.reviewer).toBe(REVIEWERS[d.companyId]);
      expect(decisionInputProblem(d.reviewer, d.feedback)).toBeUndefined();
      expect(findJudgement(d.feedback)).toEqual([]);
      expect(protectedNames(d.feedback)).toEqual([]);
    }
  });

  it("keeps every review guide free of scores and ranks", () => {
    for (const c of data.challenges) expect(findJudgement(collectText(c.reviewGuide).join("\n"))).toEqual([]);
  });

  it("spreads work over the week before the event, more in the last two days", () => {
    const days = data.submissions.map((s) => Math.floor(hoursBefore(s.submittedAt) / 24));
    for (let day = 0; day < 7; day++) expect(days).toContain(day);
    expect(days.every((d) => d < 7)).toBe(true);
    const lastTwo = days.filter((d) => d < 2).length;
    expect(lastTwo / days.length).toBeGreaterThan(2 / 7);
    for (const s of data.submissions) {
      const challenge = data.challenges.find((c) => c.id === s.challengeId);
      expect(s.submittedAt > (challenge?.createdAt ?? "")).toBe(true);
    }
  });

  it("answers in hours, not weeks, and leaves one quiet employer with feedback owed", () => {
    const replies = data.decisions.map((d) => {
      const s = data.submissions.find((x) => x.id === d.proofId);
      return (new Date(d.decidedAt).getTime() - new Date(s?.submittedAt ?? 0).getTime()) / HOUR;
    });
    expect(replies.every((h) => h > 0)).toBe(true);
    expect(data.decisions.every((d) => d.decidedAt <= NOW.toISOString())).toBe(true);
    expect(median(replies)).toBeGreaterThanOrEqual(2);
    expect(median(replies)).toBeLessThanOrEqual(4);
    const owed = data.submissions.filter(
      (s) => hoursBefore(s.submittedAt) > 48 && !data.decisions.some((d) => d.proofId === s.id),
    );
    expect(owed.length).toBeGreaterThanOrEqual(3);
    expect(owed.length).toBeLessThanOrEqual(5);
  });

  it("shows pictures of the work from small files in public/demo", () => {
    const attached = data.submissions.filter((s) => s.attachment);
    expect(attached.length).toBeGreaterThanOrEqual(8);
    for (const s of attached) {
      const challenge = data.challenges.find((c) => c.id === s.challengeId);
      expect(s.attachment?.kind).toBe(challenge?.proofKind);
      for (const src of [s.attachment?.src, s.attachment?.poster].filter((x): x is string => Boolean(x))) {
        const file = join(process.cwd(), "public", src);
        expect(existsSync(file)).toBe(true);
        expect(statSync(file).size).toBeLessThan(250_000);
      }
    }
  });

  it("every employer task in the demo event uses a degree-level role", () => {
    for (const c of data.challenges) {
      const role = roleFor(c);
      expect(role.id, c.id).not.toBe("generic");
      expect(role.level, `${c.id}: ${role.id}`).toBe("degree");
    }
  });

  it("no demo media file is unreferenced", () => {
    const referenced = new Set(
      buildSeed(NOW, "met").submissions.flatMap((s) => [s.attachment?.src, s.attachment?.poster].filter((x): x is string => Boolean(x))),
    );
    const files = readdirSync(join(process.cwd(), "public", "demo")).map((name) => `/demo/${name}`);
    expect(files.filter((file) => !referenced.has(file))).toEqual([]);
  });

  it("uses only reserved contacts", () => {
    for (const { contact } of Object.values(PEOPLE)) expect(contact).toMatch(/@example\.org$|^\+358 \d\d 000 \d{4}$/);
  });
});

describe("meeting slots in the seed", () => {
  it("never puts two meetings at the same time and table, or one person or company in two places at once", () => {
    for (const stage of STORY_STAGES) {
      const data = build(stage);
      const talentOf = new Map(data.submissions.map((s) => [s.id, s.talentId]));
      const held = data.meetings.filter((m) => m.status !== "declined");
      const time = (slot: string) => slot.split(",")[0];
      const unique = (keys: string[]) => expect(new Set(keys).size, `${stage}: ${keys.join(" | ")}`).toBe(keys.length);
      unique(held.map((m) => m.slot));
      unique(held.map((m) => `${time(m.slot)} ${talentOf.get(m.proofId)}`));
      unique(held.map((m) => `${time(m.slot)} ${m.companyId}`));
    }
  });

  it("shows one invitation the person declined", () => {
    expect(build("invited").meetings.filter((m) => m.status === "declined")).toHaveLength(1);
  });
});

describe("Second look in the seed", () => {
  it("makes every decision by an employer that does not own the task one the rules allow when it is made", () => {
    for (const stage of STORY_STAGES) {
      const data = build(stage);
      const others = data.decisions.filter((d) => {
        const submission = data.submissions.find((s) => s.id === d.proofId);
        const challenge = data.challenges.find((c) => c.id === submission?.challengeId);
        return !challenge?.companyIds.includes(d.companyId);
      });
      expect(others.length).toBeGreaterThan(0);
      for (const look of others) {
        const submission = data.submissions.find((s) => s.id === look.proofId);
        const challenge = data.challenges.find((c) => c.id === submission?.challengeId);
        if (!submission || !challenge) throw new Error(look.proofId);
        const matches = secondLookMatches({
          submission,
          challenge,
          decisions: data.decisions.filter((d) => d.proofId === look.proofId && d.decidedAt < look.decidedAt),
          challenges: data.challenges,
          responseWindowHours: data.event.responseWindowHours,
          now: new Date(look.decidedAt),
        });
        expect(matches.map((m) => m.companyId), `${stage}: ${look.companyId} on ${look.proofId}`).toContain(look.companyId);
      }
    }
  });
});

describe("Olena's story", () => {
  it("labels the story proof K7 at every stage, as the guided tour calls it", () => {
    for (const stage of ["sent", "invited", "met"] as const) {
      const proof = buildSeed(new Date(), stage).proofs.find((p) => p.proofId === STORY_PROOF_ID);
      expect(proof?.label).toBe("Proof K7");
    }
  });

  const stages = STORY_STAGES.map((stage) => ({ stage, data: build(stage) }));

  it("builds every stage and fills the demo info", () => {
    for (const { stage, data } of stages) {
      expect(data.demo.stage).toBe(stage);
      expect(data.demo.personaName).toBe("Olena Kovalenko");
      expect(data.talents.find((t) => t.id === data.demo.personaTalentId)?.name).toBe("Olena Kovalenko");
    }
  });

  it("makes each stage the previous one plus changes", () => {
    for (let i = 1; i < stages.length; i++) {
      const before = stages[i - 1].data;
      const after = stages[i].data;
      const ids = (items: { id: string }[]) => items.map((x) => x.id);
      for (const key of ["submissions", "decisions", "meetings"] as const) {
        expect(ids(after[key])).toEqual(expect.arrayContaining(ids(before[key])));
      }
      expect(after.proofs.map((p) => p.label)).toEqual(expect.arrayContaining(before.proofs.map((p) => p.label)));
    }
    const [before, sent, invited, met] = stages.map((s) => s.data);
    expect(before.submissions.some((s) => s.id === STORY_PROOF_ID)).toBe(false);
    expect(sent.submissions.length - before.submissions.length).toBe(1);
    expect(invited.decisions.length - sent.decisions.length).toBe(1);
    expect(met.decisions.length - invited.decisions.length).toBe(1);
    expect(invited.meetings.find((m) => m.proofId === STORY_PROOF_ID)?.status).toBe("invited");
    expect(met.meetings.find((m) => m.proofId === STORY_PROOF_ID && m.companyId === "co-kaari")?.status).toBe("accepted");
    expect(met.meetings.find((m) => m.proofId === STORY_PROOF_ID && m.companyId === "co-otso")).toBeUndefined();
    expect(met.meetings.find((m) => m.proofId === OLENA_EARLIER_PLAN_ID && m.companyId === "co-otso")?.status).toBe("invited");
  });

  it("gives Olena two earlier proofs at every stage: one answered, one waiting", () => {
    const { data } = stages[0];
    const hers = data.submissions.filter((s) => s.talentId === data.demo.personaTalentId);
    expect(hers).toHaveLength(2);
    expect(hers.filter((s) => data.decisions.some((d) => d.proofId === s.id))).toHaveLength(1);
  });

  it("puts her plan first in Kaari's queue at stage sent", () => {
    const { data } = stages[1];
    const kaariChallenges = data.challenges.filter((c) => c.companyIds.includes("co-kaari")).map((c) => c.id);
    const waiting = data.proofs
      .filter((p) => kaariChallenges.includes(p.challengeId) && !data.decisions.some((d) => d.proofId === p.proofId && d.companyId === "co-kaari"))
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    expect(waiting[0].proofId).toBe(STORY_PROOF_ID);
    expect(waiting).toHaveLength(4);
    expect(hoursBefore(waiting[0].submittedAt)).toBeLessThan(1);
  });

  it("hides exactly the seven planted details and none of her identity reaches the reviewer", () => {
    const { data } = stages[1];
    const proof = data.proofs.find((p) => p.proofId === STORY_PROOF_ID);
    if (!proof) throw new Error("story proof missing");
    const blind = toBlindProof(proof);
    expect(proof.hiddenCount).toBe(7);
    expect(blind).not.toHaveProperty("hiddenCount");
    const shown = collectText(blind).join("\n");
    for (const planted of ["Olena", "Kovalenko", "Kyiv", "Medical Institute", "Yöpuhdas", "Espoo", "Finland", "Ukrainian", "olena.kovalenko"]) {
      expect(shown).not.toContain(planted);
    }
    expect(shown).toContain("blood thinner");
    expect(blind.explain[0].spoken).toBe(true);
  });
});
