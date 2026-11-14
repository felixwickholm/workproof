import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { roleFor } from "@/lib/ai/scripted/compose";
import { ROLES } from "@/lib/ai/scripted/roles";
import { toBlindProof } from "@/lib/blind/project";
import { decisionInputProblem } from "@/lib/domain/decision-rules";
import { totalOf } from "@/lib/domain/scoring";
import type { Attachment, StoryStage } from "@/lib/domain/types";
import { draftProblems } from "@/lib/guard/check-draft";
import { collectText, findJudgement } from "@/lib/guard/no-judgement";
import { protectedNames } from "@/lib/guard/protected";
import { median } from "@/lib/service/reply-totals";
import { shareMatches } from "@/lib/service/views/city-task";
import { buildSeed } from ".";
import { SAMPLE_AD_PATHS } from "./ads";
import { COMPANIES } from "./companies";
import { PEOPLE } from "./people";
import { MIKKO_EARLIER_ID, STORY_CHALLENGE_ID, STORY_COMPANY_ID, STORY_PROOF_ID, STORY_REVIEWER, STORY_STAGES } from "./story";

const NOW = new Date("2026-11-14T12:00:00.000Z");
const HOUR = 3_600_000;
const hoursBefore = (iso: string) => (NOW.getTime() - new Date(iso).getTime()) / HOUR;
const words = (text: string) => text.trim().split(/\s+/).length;
const build = (stage: StoryStage) => buildSeed(NOW, stage);

describe("seed world", () => {
  const data = build("invited");
  const challengeOf = (proofId: string) => data.challenges.find((c) => c.id === data.submissions.find((s) => s.id === proofId)?.challengeId);
  const onBehalf = data.challenges.filter((c) => c.onBehalf);

  it("has the employers, tasks, people and work the contract describes", () => {
    expect(data.companies).toHaveLength(18);
    expect(data.challenges).toHaveLength(30);
    expect(data.challenges.filter((c) => c.companyIds.length === 2)).toHaveLength(2);
    expect(new Set(data.challenges.flatMap((c) => c.companyIds)).size).toBe(18);
    expect(data.proofs.length).toBeGreaterThanOrEqual(70);
    expect(data.proofs.length).toBeLessThanOrEqual(80);
    expect(data.talents.length).toBeGreaterThanOrEqual(42);
    expect(data.talents.length).toBeLessThanOrEqual(48);
  });

  it("uses a degree-level library role for every task, in every format, with at most two code tasks", () => {
    for (const c of data.challenges) {
      const role = roleFor(c);
      expect(role.id, c.id).not.toBe("generic");
      expect(role.level, `${c.id}: ${role.id}`).toBe("degree");
    }
    const count = (format: string) => data.challenges.filter((c) => c.format === format).length;
    expect(count("choose")).toBeGreaterThanOrEqual(2);
    expect(count("fix")).toBeGreaterThanOrEqual(3);
    expect(count("read")).toBeGreaterThanOrEqual(3);
    expect(count("make")).toBeGreaterThanOrEqual(4);
    expect(data.challenges.filter((c) => c.proofKind === "code").length).toBeLessThanOrEqual(2);
  });

  it("states every task plainly: a short title, a brief with at most one question, one sentence to hand in, 5 to 15 minutes", () => {
    for (const c of data.challenges) {
      expect(words(c.title), c.id).toBeLessThanOrEqual(9);
      expect(words(c.brief), c.id).toBeLessThan(120);
      expect(c.brief.split("?").length - 1, c.id).toBeLessThanOrEqual(1);
      expect(c.deliverable.replace(/\.$/, ""), c.id).not.toMatch(/[.?!]\s/);
      expect(c.minutes, c.id).toBeGreaterThanOrEqual(5);
      expect(c.minutes, c.id).toBeLessThanOrEqual(15);
      expect(draftProblems(c), c.id).toEqual([]);
      if (c.format === "choose") expect(c.options?.map((o) => o.id), c.id).toEqual(["a", "b"]);
    }
  });

  it("publishes tasks 1 to 9 days before the event, with the bias bait set aside", () => {
    for (const c of data.challenges) {
      expect(hoursBefore(c.createdAt) / 24).toBeGreaterThanOrEqual(1);
      expect(hoursBefore(c.createdAt) / 24).toBeLessThanOrEqual(9);
    }
    expect(data.challenges.some((c) => c.setAside.some((line) => line.startsWith("Not used:")))).toBe(true);
  });

  it("leads the newest tasks with no code task and with the story task", () => {
    const newest = [...data.challenges].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
    expect(newest.map((c) => c.proofKind)).not.toContain("code");
    expect(newest.map((c) => c.id)).toContain(STORY_CHALLENGE_ID);
  });

  it("gives every proof a spoken think-aloud, plain answers of a fair length, and a choice for every choose task", () => {
    for (const s of data.submissions) {
      expect(words(s.answer), s.id).toBeGreaterThanOrEqual(40);
      expect(words(s.answer), s.id).toBeLessThanOrEqual(140);
      expect(words(s.thinkAloud?.transcript ?? ""), s.id).toBeGreaterThanOrEqual(50);
      expect(words(s.thinkAloud?.transcript ?? ""), s.id).toBeLessThanOrEqual(140);
      expect(s.thinkAloud?.seconds, s.id).toBeGreaterThan(0);
      expect(s.choice !== undefined, s.id).toBe(challengeOf(s.id)?.format === "choose");
    }
    const blindTranscripts = data.proofs.map((p) => p.thinkAloud?.transcript ?? "");
    expect(blindTranscripts.filter((t) => t.includes("[hidden]")).length).toBeGreaterThanOrEqual(6);
    expect(new Set(data.submissions.map((s) => s.thinkAloud?.transcript)).size).toBe(data.submissions.length);
  });

  it("never brings up where a person comes from, in work, speech or reasons", () => {
    const text = [
      ...data.submissions.flatMap((s) => [s.answer, s.thinkAloud?.transcript ?? "", ...s.explain.map((e) => e.answer)]),
      ...data.decisions.map((d) => d.feedback),
    ].join("\n");
    expect(protectedNames(text).filter((name) => name === "nationality or origin")).toEqual([]);
  });

  it("scores every decided proof by the company's named reviewer, one point per core skill, with a reason", () => {
    expect(data.decisions.filter((d) => d.decision === "meet")).toHaveLength(17);
    expect(data.decisions.filter((d) => d.decision === "pass")).toHaveLength(18);
    expect(data.decisions.filter((d) => d.decision === "hold")).toHaveLength(11);
    for (const d of data.decisions) {
      const challenge = challengeOf(d.proofId);
      expect(challenge?.companyIds, d.id).toContain(d.companyId);
      expect(COMPANIES.find((c) => c.id === d.companyId)?.reviewers, d.id).toContain(d.reviewer);
      expect(d.scores?.map((s) => s.skillId), d.id).toEqual(challenge?.coreSkills.map((s) => s.id));
      expect(d.total, d.id).toBe(totalOf(d.scores ?? []));
      expect(decisionInputProblem(d.reviewer, d.feedback), d.id).toBeUndefined();
      expect(words(d.feedback), d.id).toBeLessThanOrEqual(70);
    }
  });

  it("spreads the totals the way people score real work: a wide range, and no flat top", () => {
    const totals = data.decisions.map((d) => d.total ?? 0);
    expect(Math.min(...totals)).toBeLessThanOrEqual(5);
    expect(Math.max(...totals)).toBeGreaterThanOrEqual(9);
    const tops = data.challenges.map((c) => Math.max(0, ...data.decisions.filter((d) => challengeOf(d.proofId)?.id === c.id).map((d) => d.total ?? 0)));
    expect(new Set(tops.filter((t) => t > 0)).size).toBeGreaterThan(2);
  });

  it("keeps software judgement out of every text the designer wrote", () => {
    for (const c of data.challenges) {
      expect(findJudgement(collectText([c.title, c.brief, c.deliverable, c.reviewGuide, c.options ?? []]).join("\n")), c.id).toEqual([]);
    }
  });

  it("holds meetings in every state, with follow-ups and three hires recorded after the talk", () => {
    const status = (s: string) => data.meetings.filter((m) => m.status === s).length;
    expect(data.meetings).toHaveLength(17);
    expect([status("invited"), status("declined"), status("accepted"), status("met")]).toEqual([6, 1, 4, 6]);
    expect(data.meetings.filter((m) => m.followUpAgreed)).toHaveLength(5);
    expect(data.meetings.filter((m) => m.hired)).toHaveLength(3);
    for (const m of data.meetings.filter((x) => x.followUpAgreed !== undefined || x.hired)) expect(m.status, m.id).toBe("met");
  });

  it("has one challenge the city made from a job ad: not opened yet, with about twenty pieces of work waiting", () => {
    expect(onBehalf).toHaveLength(1);
    const [task] = onBehalf;
    expect(task.claimedAt).toBeUndefined();
    expect(SAMPLE_AD_PATHS).toContain(task.onBehalf?.adUrl);
    const proofs = data.submissions.filter((s) => s.challengeId === task.id);
    expect(proofs.length).toBeGreaterThanOrEqual(18);
    expect(data.decisions.filter((d) => challengeOf(d.proofId)?.id === task.id)).toEqual([]);
  });

  it("shares work between companies only when the person allowed it, the sender scored it and the skills match", () => {
    const shares = data.recommendations ?? [];
    expect(shares).toHaveLength(3);
    for (const r of shares) {
      const submission = data.submissions.find((s) => s.id === r.proofId);
      expect(submission?.shareWithSimilar, r.id).toBe(true);
      const scored = data.decisions.find((d) => d.proofId === r.proofId && d.companyId === r.fromCompanyId);
      expect(scored?.scores?.length, r.id).toBeGreaterThan(0);
      expect(scored && scored.decidedAt < r.at, r.id).toBe(true);
      expect(shareMatches(data, submission?.challengeId ?? "").map((m) => m.companyId), r.id).toContain(r.toCompanyId);
      expect(data.decisions.some((d) => d.proofId === r.proofId && d.companyId === r.toCompanyId), r.id).toBe(false);
    }
  });

  it("receives every proof after its task was published, over the week before the event, more in the last two days", () => {
    for (const s of data.submissions) expect(s.submittedAt > (challengeOf(s.id)?.createdAt ?? ""), s.id).toBe(true);
    const days = data.submissions.map((s) => Math.floor(hoursBefore(s.submittedAt) / 24));
    for (let day = 0; day < 7; day++) expect(days).toContain(day);
    expect(days.every((d) => d < 7)).toBe(true);
    expect(days.filter((d) => d < 2).length / days.length).toBeGreaterThan(2 / 7);
  });

  it("answers in hours, not weeks, and leaves one quiet employer with work unanswered", () => {
    const replies = data.decisions.map((d) => {
      const s = data.submissions.find((x) => x.id === d.proofId);
      return (new Date(d.decidedAt).getTime() - new Date(s?.submittedAt ?? 0).getTime()) / HOUR;
    });
    expect(replies.every((h) => h > 0)).toBe(true);
    expect(data.decisions.every((d) => d.decidedAt <= NOW.toISOString())).toBe(true);
    expect(median(replies)).toBeGreaterThanOrEqual(2);
    expect(median(replies)).toBeLessThanOrEqual(4);
    const owed = data.submissions.filter(
      (s) => !challengeOf(s.id)?.onBehalf && hoursBefore(s.submittedAt) > 48 && !data.decisions.some((d) => d.proofId === s.id),
    );
    expect(owed.length).toBeGreaterThanOrEqual(3);
    expect(owed.length).toBeLessThanOrEqual(5);
    expect(new Set(owed.map((s) => challengeOf(s.id)?.companyIds[0])).size).toBe(1);
  });

  it("shows pictures and screen clips of the work from small files in public/demo", () => {
    const media: Attachment[] = data.submissions.flatMap((s) => [s.attachment, s.thinkAloud?.screen].filter((x): x is Attachment => Boolean(x)));
    expect(data.submissions.filter((s) => s.thinkAloud?.screen)).toHaveLength(3);
    for (const item of media) {
      for (const src of [item.src, item.poster].filter((x): x is string => Boolean(x))) {
        const file = join(process.cwd(), "public", src);
        expect(existsSync(file), src).toBe(true);
        expect(statSync(file).size, src).toBeLessThan(250_000);
      }
    }
  });

  it("no demo media file is unreferenced", () => {
    const seed = buildSeed(NOW, "met");
    const fromWork = seed.submissions.flatMap((s) => [s.attachment, s.thinkAloud?.screen].flatMap((a) => [a?.src, a?.poster]));
    const fromTasks = ROLES.flatMap((r) => [r.challenge, r.taster].flatMap((t) => [t.material.image, ...(t.options ?? []).map((o) => o.image)]));
    const referenced = new Set([...fromWork, ...fromTasks].filter((x): x is string => Boolean(x)));
    const files = readdirSync(join(process.cwd(), "public", "demo")).map((name) => `/demo/${name}`);
    expect(files.filter((file) => !referenced.has(file))).toEqual([]);
  });

  it("gives every company a logo, every person a picture, and every challenge a photo path and a publish date", () => {
    const exists = (src: string | undefined) => Boolean(src) && existsSync(join(process.cwd(), "public", src ?? ""));
    for (const c of data.companies) {
      expect(c.logo, c.id).toBe(`/companies/${c.id}.svg`);
      expect(exists(c.logo), c.id).toBe(true);
      expect(c.about && c.industry, c.id).toBeTruthy();
      for (const name of c.reviewers ?? []) expect(exists(c.reviewerAvatars?.[name]), name).toBe(true);
    }
    for (const t of data.talents) {
      expect(exists(t.avatar), t.name).toBe(true);
      // The file name is opaque: a picture path must never give the person's name away.
      for (const part of t.name.toLowerCase().split(/\s+/)) expect(t.avatar?.toLowerCase(), t.name).not.toContain(part);
    }
    expect(new Set(data.talents.map((t) => t.avatar)).size).toBe(data.talents.length);
    const scenes = JSON.parse(readFileSync(join(process.cwd(), "scripts", "challenge-scenes.json"), "utf8")) as Record<string, string>;
    for (const c of data.challenges) {
      expect(scenes[c.id], c.id).toBeTruthy();
      expect(c.image, c.id).toBe(`/challenges/${c.id}.webp`);
      expect(c.publishedAt, c.id).toBe(c.createdAt);
    }
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
});

describe("Mikko's story", () => {
  const stages = STORY_STAGES.map((stage) => ({ stage, data: build(stage) }));

  it("labels the story proof K7 at every stage, and no other proof", () => {
    for (const stage of ["sent", "invited", "met"] as const) {
      const proofs = buildSeed(new Date(), stage).proofs;
      expect(proofs.find((p) => p.proofId === STORY_PROOF_ID)?.label).toBe("Proof K7");
      expect(proofs.filter((p) => p.label === "Proof K7")).toHaveLength(1);
    }
  });

  it("builds every stage and fills the demo info", () => {
    for (const { stage, data } of stages) {
      expect(data.demo.stage).toBe(stage);
      expect(data.demo.personaName).toBe("Mikko Lahtinen");
      expect(data.talents.find((t) => t.id === data.demo.personaTalentId)?.name).toBe("Mikko Lahtinen");
      expect(data.challenges.find((c) => c.id === STORY_CHALLENGE_ID)?.companyIds).toEqual([STORY_COMPANY_ID]);
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
    const storyMeeting = (data: typeof met) => data.meetings.find((m) => m.proofId === STORY_PROOF_ID);
    expect(before.submissions.some((s) => s.id === STORY_PROOF_ID)).toBe(false);
    expect(sent.submissions.length - before.submissions.length).toBe(1);
    expect(invited.decisions.length - sent.decisions.length).toBe(1);
    expect(storyMeeting(invited)?.status).toBe("invited");
    expect(storyMeeting(met)).toMatchObject({ status: "met", followUpAgreed: true, companyId: STORY_COMPANY_ID });
  });

  it("scores his answer 9 of 10, by the customer service lead, with the reason the tour quotes", () => {
    const decision = stages[2].data.decisions.find((d) => d.proofId === STORY_PROOF_ID);
    expect(decision).toMatchObject({ reviewer: STORY_REVIEWER, decision: "meet", total: 9 });
    expect(decision?.feedback).toBe("You found the three places where installers give up, and your form is shorter, not busier. Search by pump model and a clear order number are changes we could build this month.");
  });

  it("gives Mikko two earlier proofs at every stage: one answered not now with points, one waiting", () => {
    const { data } = stages[0];
    const hers = data.submissions.filter((s) => s.talentId === data.demo.personaTalentId);
    expect(hers).toHaveLength(2);
    const answered = data.decisions.filter((d) => hers.some((s) => s.id === d.proofId));
    expect(answered).toHaveLength(1);
    expect(answered[0]).toMatchObject({ proofId: MIKKO_EARLIER_ID, decision: "pass" });
    expect(answered[0].scores?.length).toBeGreaterThan(0);
  });

  it("puts her answer first in the story task's queue at stage sent", () => {
    const { data } = stages[1];
    const waiting = data.proofs
      .filter((p) => p.challengeId === STORY_CHALLENGE_ID && !data.decisions.some((d) => d.proofId === p.proofId))
      .sort((a, b) => a.submittedAt.localeCompare(b.submittedAt));
    expect(waiting[0].proofId).toBe(STORY_PROOF_ID);
    expect(waiting).toHaveLength(4);
    expect(hoursBefore(waiting[0].submittedAt)).toBeLessThan(1);
  });

  it("hides the four planted details and none of her identity reaches the reviewer", () => {
    const proof = stages[1].data.proofs.find((p) => p.proofId === STORY_PROOF_ID);
    if (!proof) throw new Error("story proof missing");
    const blind = toBlindProof(proof);
    expect(proof.hiddenCount).toBe(4);
    expect(blind).not.toHaveProperty("hiddenCount");
    const shown = collectText(blind).join("\n");
    for (const planted of ["Mikko", "Lahtinen", "Matinkylä", "Metropolia", "Kotiranta", "mikko.lahtinen"]) expect(shown).not.toContain(planted);
    expect(shown).toContain("pump model");
    expect(blind.thinkAloud?.transcript).toContain("forty calls");
    expect(blind.explain[0].spoken).toBe(true);
  });
});
