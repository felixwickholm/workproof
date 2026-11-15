import type { DemoSessionReply, StoryStage } from "@/lib/domain/types";
import { buildSeed } from "@/lib/seed";
import { currentSandbox, getStore, ownsEvent } from "@/lib/store";
import type { StoreData } from "@/lib/store/types";
import { clock } from "./support";

/**
 * The caller's demo: the share code of their sandbox and the persona they explore as.
 * The persona's talent id is the demo person's private key for this sandbox only; this is
 * the one response that carries it, and only to the visitor who owns the sandbox. A request
 * without one reads the shared default event and gets no persona.
 */
export async function getSession(): Promise<DemoSessionReply> {
  const [sandbox, data, owner] = await Promise.all([currentSandbox(), getStore().read(), ownsEvent()]);
  return {
    code: sandbox?.code ?? null,
    persona: owner ? { talentId: data.demo.personaTalentId, name: data.demo.personaName } : null,
    stage: data.demo.stage,
  };
}

/**
 * Rebuilds the caller's event at a story stage, with times relative to now. Inside a request this is
 * the caller's own sandbox; without one (tests, evals) it is the default store. Nobody else's demo changes.
 */
export async function setStoryStage(stage: StoryStage): Promise<DemoSessionReply> {
  const before = await getStore().read();
  await getStore().replace(withVisitorWork(buildSeed(clock.now(), stage), before));
  return getSession();
}

/**
 * Carries the visitor's own work into a rebuilt event, so the walkthrough or a reset never deletes it:
 * challenges they published, and work they sent under their own key, with the decisions and meetings on it.
 * Work sent as the demo person belongs to the story and is rebuilt with it.
 */
export function withVisitorWork(fresh: StoreData, before: StoreData): StoreData {
  const seededChallenges = new Set(fresh.challenges.map((c) => c.id));
  const seededProofs = new Set(fresh.submissions.map((s) => s.id));
  const submissions = before.submissions.filter((s) => !seededProofs.has(s.id) && s.talentId !== before.demo.personaTalentId);
  const proofIds = new Set(submissions.map((s) => s.id));
  const talentIds = new Set(submissions.map((s) => s.talentId));
  const challenges = before.challenges.filter((c) => !seededChallenges.has(c.id));
  // Work on a challenge the rebuilt event no longer has would point nowhere.
  const known = new Set([...seededChallenges, ...challenges.map((c) => c.id)]);
  const kept = submissions.filter((s) => known.has(s.challengeId));
  const keptIds = new Set(kept.map((s) => s.id));
  return {
    ...fresh,
    challenges: [...fresh.challenges, ...challenges],
    talents: [...fresh.talents, ...before.talents.filter((t) => talentIds.has(t.id))],
    submissions: [...fresh.submissions, ...kept],
    proofs: [...fresh.proofs, ...before.proofs.filter((p) => keptIds.has(p.proofId) && proofIds.has(p.proofId))],
    decisions: [...fresh.decisions, ...before.decisions.filter((d) => keptIds.has(d.proofId))],
    meetings: [...fresh.meetings, ...before.meetings.filter((m) => keptIds.has(m.proofId))],
    portfolios: [...(fresh.portfolios ?? []), ...(before.portfolios ?? []).filter((p) => talentIds.has(p.talentId))],
  };
}

/** Restores the synthetic Espoo Talent Day at the default stage for free exploring. A reset clears the visitor's own work too. */
export async function resetDemo(): Promise<DemoSessionReply> {
  await getStore().replace(buildSeed(clock.now(), "invited"));
  return getSession();
}
