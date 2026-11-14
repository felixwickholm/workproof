import type { DemoSessionReply, StoryStage } from "@/lib/domain/types";
import { buildSeed } from "@/lib/seed";
import { currentSandbox, getStore, ownsEvent } from "@/lib/store";
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
  await getStore().replace(buildSeed(clock.now(), stage));
  return getSession();
}

/** Restores the synthetic Espoo Talent Day at the default stage for free exploring. */
export async function resetDemo(): Promise<DemoSessionReply> {
  return setStoryStage("invited");
}
