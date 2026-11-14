import { getTaskDesigner } from "@/lib/ai";
import { isTemplateId, publishedNeed } from "@/lib/ai/scripted/compose";
import { wishOutcomes } from "@/lib/ai/scripted/wish-outcomes";
import { choosePlaces } from "@/lib/domain/places";
import type { Challenge, ChallengeDraft } from "@/lib/domain/types";
import { draftProblems } from "@/lib/guard/check-draft";
import { isJobFact } from "@/lib/guard/job-facts";
import { fetchAd, UNREADABLE_AD, type AdFetchDeps } from "@/lib/http/ad-fetch";
import { readAd, type JobAd } from "@/lib/http/ad-reader";
import { LIMITS } from "@/lib/http/limits";
import { assertWritable, getStore } from "@/lib/store";
import { newId } from "@/lib/util/hash";
import { omit } from "@/lib/util/object";
import { DRAFT_ACTION } from "./ai-work";
import { forTalent } from "./for-talent";
import { appendAudit, clock, findOrThrow, ServiceError } from "./support";
import { endSentence } from "@/lib/domain/sentence";

const TASK_DRAFTER = "Task drafter";

/** At most this many facts are published with one task. */
const MAX_REQUIREMENTS = 8;

/**
 * The draft's job facts as published requirements: fixed forms only, without repeats, so a request that
 * skips the UI cannot put free text on the card this way. Undefined when there are none.
 */
function publishedRequirements(facts: string[] | undefined): string[] | undefined {
  const kept = [...new Set((facts ?? []).filter(isJobFact))].slice(0, MAX_REQUIREMENTS);
  return kept.length > 0 ? kept : undefined;
}

/**
 * A draft for the company's own screen. `yourWords` echoes their sentence and `wishes` says what became of
 * each wish, whichever designer drafted it; neither is ever published.
 */
export async function draftChallenge(need: string): Promise<ChallengeDraft> {
  // A request the store would refuse never reaches a model. The route has already checked the rate and the input.
  await assertWritable();
  const draft = await getTaskDesigner().draftChallenge(need);
  await getStore().update((data) => {
    appendAudit(data, {
      actor: "ai",
      by: TASK_DRAFTER,
      action: DRAFT_ACTION,
      detail: `"${draft.title}": ${draft.coreSkills.length} core skills kept, ${draft.setAside.length} wishes set aside. Waiting for a human to approve.`,
    });
  });
  return { ...draft, yourWords: need.trim(), wishes: wishOutcomes(need, draft.coreSkills.map((s) => s.id)) };
}

/** An event task takes 5 to 30 minutes, or about 2 hours for a bigger event challenge done before the event. */
export const EVENT_MINUTES = { min: 5, max: 180 } as const;

export async function approveChallenge(input: { draft: ChallengeDraft; companyId: string; approvedBy: string }): Promise<Challenge> {
  return publish(input);
}

/**
 * Publishes a draft after checking it again. With `onBehalf`, the city publishes it for the company, which
 * opens it later with one click.
 */
async function publish(input: { draft: ChallengeDraft; companyId: string; approvedBy: string }, onBehalf?: Challenge["onBehalf"]): Promise<Challenge> {
  const approvedBy = input.approvedBy.trim();
  if (!approvedBy) throw new ServiceError(400, "A named person must approve the challenge");
  // A human may edit the draft, and a request may skip the UI, so the server checks it again.
  // The talent-visible need is rebuilt here; the request's own need, words, wish outcomes, note and designer are dropped.
  // A template id the designer never sets is dropped, so follow-ups fall back on the generic role.
  const templateId = input.draft.templateId && isTemplateId(input.draft.templateId) ? input.draft.templateId : undefined;
  const sent: ChallengeDraft = { ...omit(input.draft, ["templateId"]), ...(templateId ? { templateId } : {}) };
  const draft: ChallengeDraft = { ...omit(sent, ["yourWords", "note", "wishes", "draftedBy", "facts", "adUrl", "jobAd"]), need: publishedNeed(sent), kind: "event", aiAllowed: true };
  const problems = draftProblems(draft);
  if (draft.minutes < EVENT_MINUTES.min || draft.minutes > EVENT_MINUTES.max) problems.push(`An event task takes ${EVENT_MINUTES.min} to ${EVENT_MINUTES.max} minutes`);
  if (draft.format === "choose" && !draft.options) problems.push("A choose task needs its two options");
  if (problems.length > 0) throw new ServiceError(400, `This card cannot be published yet. ${problems[0]}.`);
  const requirements = publishedRequirements(input.draft.facts);

  return getStore().update((data) => {
    const company = findOrThrow(data.companies, (c) => c.id === input.companyId, "Company");
    const challenge: Challenge = {
      ...draft,
      kind: "event",
      places: choosePlaces(draft.places),
      ...(requirements ? { requirements } : {}),
      id: newId("ch"),
      companyIds: [company.id],
      approvedBy,
      createdAt: clock.now().toISOString(),
      ...(onBehalf ? { onBehalf } : {}),
    };
    data.challenges.push(challenge);
    appendAudit(data, {
      actor: "human",
      by: approvedBy,
      action: "Approved a Problem Card",
      detail: onBehalf ? `The city published "${challenge.title}" for ${company.name}.` : `${company.name} published "${challenge.title}".`,
    });
    return challenge;
  });
}

/**
 * A job ad as one need for the drafter: the role on the first line, then one listed line per ask, per piece
 * of work and per job fact. Asks come first, so the core skills come from them. A listed line stays one wish.
 * Headings, the offer and contact lines never reach it. Lines that do not fit the need limit are left out whole.
 */
export function adNeed(ad: JobAd): string {
  const lines = [ad.title];
  for (const item of [...ad.requirements, ...ad.duties, ...ad.facts]) {
    const line = `- ${item}`;
    if ([...lines, line].join("\n").length > LIMITS.need) break;
    lines.push(line);
  }
  return lines.join("\n").slice(0, LIMITS.need);
}

/**
 * Reads a job ad from a link and drafts a task from its words, the same way as from a sentence. The ad text
 * passes the blind layer before any model reads it, like every text. `ownOrigin` lets this site's sample ads through.
 */
export async function draftFromAd(url: string, ownOrigin: string | undefined, deps?: AdFetchDeps): Promise<ChallengeDraft> {
  await assertWritable();
  const need = adNeed(readAd(await fetchAd(url, ownOrigin, deps)));
  if (need.length < 10) throw new ServiceError(400, UNREADABLE_AD);
  return { ...(await draftChallenge(need)), adUrl: url.trim() };
}

/** The city's ready message to the company: what was made, how many people did it, and where to look. */
/** A new challenge has no work yet, so the message invites the company to look instead of counting nobody. */
export function readyMessage(title: string, proofs: number, link: string): string {
  if (proofs === 0) return `We made a challenge for you: ${endSentence(title)} It is live for job seekers now. See it here: ${link}`;
  return `We made a challenge for you: ${endSentence(title)} ${proofs} ${proofs === 1 ? "person" : "people"} already did it. See how they did: ${link}`;
}

/** The city publishes a challenge for a company, from its words or its job-ad link. The company claims it later. */
export async function publishOnBehalf(input: { companyId: string; draft: ChallengeDraft; by: string }, link: (challengeId: string) => string): Promise<{ challenge: Challenge; message: string }> {
  const by = input.by.trim();
  const challenge = await publish({ draft: input.draft, companyId: input.companyId, approvedBy: by }, { by, ...(input.draft.adUrl ? { adUrl: input.draft.adUrl } : {}) });
  return { challenge, message: readyMessage(challenge.title, 0, link(challenge.id)) };
}

/** The company opens a challenge the city made for it: one click, recorded once. */
export async function claimChallenge(challengeId: string, companyId: string): Promise<Challenge> {
  return getStore().update((data) => {
    const challenge = findOrThrow(data.challenges, (c) => c.id === challengeId, "Challenge");
    if (!challenge.onBehalf || !challenge.companyIds.includes(companyId)) throw new ServiceError(403, "Only the company the city made this challenge for can open it");
    if (!challenge.claimedAt) {
      challenge.claimedAt = clock.now().toISOString();
      const company = findOrThrow(data.companies, (c) => c.id === companyId, "Company");
      appendAudit(data, { actor: "human", by: company.name, action: "Opened a challenge made by the city", detail: `${company.name} opened "${challenge.title}".` });
    }
    return challenge;
  });
}

/** The ready message for a challenge the city made, with the proofs it has now. */
export async function readyMessageFor(challengeId: string, link: string): Promise<string> {
  const data = await getStore().read();
  const challenge = findOrThrow(data.challenges, (c) => c.id === challengeId && Boolean(c.onBehalf), "Challenge");
  return readyMessage(challenge.title, data.proofs.filter((p) => p.challengeId === challengeId).length, link);
}

/** Approved event challenges, oldest first, as talent sees them. */
export async function listChallenges(): Promise<Challenge[]> {
  const data = await getStore().read();
  return data.challenges
    .filter((c) => c.kind === "event" && c.approvedBy)
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map(forTalent);
}

async function findChallenge(id: string): Promise<Challenge> {
  const data = await getStore().read();
  return findOrThrow(data.challenges, (c) => c.id === id, "Challenge");
}

export async function getChallenge(id: string): Promise<Challenge> {
  return forTalent(await findChallenge(id));
}

export async function createTaster(dreamJob: string): Promise<Challenge> {
  // A request the store would refuse never reaches a model. The route has already checked the rate and the input.
  await assertWritable();
  const draft = await getTaskDesigner().taster(dreamJob);
  return getStore().update((data) => {
    const challenge: Challenge = {
      ...omit(draft, ["draftedBy"]),
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
