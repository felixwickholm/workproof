import { getTaskDesigner } from "@/lib/ai";
import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { FOLLOW_UP_ACTION } from "./ai-work";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";

export const TASK_DRAFTER = "Task drafter";

export async function draftChallenge(need: string): Promise<ChallengeDraft> {
  const draft = await getTaskDesigner().draftChallenge(need);
  await getStore().update((data) => {
    appendAudit(data, {
      actor: "ai",
      by: TASK_DRAFTER,
      action: "Drafted a Problem Card",
      detail: `"${draft.title}": ${draft.coreSkills.length} core skills kept, ${draft.setAside.length} wishes set aside. Waiting for a human to approve.`,
    });
  });
  return draft;
}

export async function approveChallenge(input: { draft: ChallengeDraft; companyId: string; approvedBy: string }): Promise<Challenge> {
  const approvedBy = input.approvedBy.trim();
  if (!approvedBy) throw new ServiceError(400, "A named person must approve the challenge");
  const skills = input.draft.coreSkills.length;
  if (skills < 3 || skills > 5) throw new ServiceError(400, "A challenge needs 3 to 5 core skills");

  return getStore().update((data) => {
    const company = findOrThrow(data.companies, (c) => c.id === input.companyId, "Company");
    const challenge: Challenge = {
      ...input.draft,
      kind: "event",
      id: newId("ch"),
      companyIds: [company.id],
      approvedBy,
      createdAt: clock.now().toISOString(),
    };
    data.challenges.push(challenge);
    appendAudit(data, {
      actor: "human",
      by: approvedBy,
      action: "Approved a Problem Card",
      detail: `${company.name} published "${challenge.title}".`,
    });
    return challenge;
  });
}

/** Approved event challenges, oldest first. */
export async function listChallenges(): Promise<Challenge[]> {
  const data = await getStore().read();
  return data.challenges
    .filter((c) => c.kind === "event" && c.approvedBy)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function getChallenge(id: string): Promise<Challenge> {
  const data = await getStore().read();
  return findOrThrow(data.challenges, (c) => c.id === id, "Challenge");
}

export async function createTaster(dreamJob: string): Promise<Challenge> {
  const draft = await getTaskDesigner().taster(dreamJob);
  return getStore().update((data) => {
    const challenge: Challenge = {
      ...draft,
      id: newId("taster"),
      companyIds: [],
      createdAt: clock.now().toISOString(),
    };
    data.challenges.push(challenge);
    appendAudit(data, {
      actor: "ai",
      by: TASK_DRAFTER,
      action: "Drafted a 2-minute taster",
      detail: `"${challenge.title}" for a practice run. No company sees it.`,
    });
    return challenge;
  });
}

export async function followUpsFor(challengeId: string, answer: string): Promise<string[]> {
  const challenge = await getChallenge(challengeId);
  const questions = await getTaskDesigner().followUps(challenge, answer);
  await getStore().update((data) => {
    appendAudit(data, {
      actor: "ai",
      by: "Follow-up writer",
      action: FOLLOW_UP_ACTION,
      detail: `${questions.length} question${questions.length === 1 ? "" : "s"} on "${challenge.title}".`,
    });
  });
  return questions;
}
