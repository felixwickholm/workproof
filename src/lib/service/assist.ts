import { matchRole } from "@/lib/ai/scripted/match-role";
import { parseNeed } from "@/lib/ai/scripted/parse-need";
import { isNeutral } from "@/lib/guard/check-draft";
import { rolesOf } from "@/lib/domain/roles";
import type { ChallengeDraft } from "@/lib/domain/types";
import { draftChallenge } from "./challenges";

/**
 * The company's "new challenge" chat. The company writes anything: a role, a sentence, a messy job ad.
 * The assistant asks at most two short questions, only when the words leave the work or the size open,
 * then drafts a challenge and an example job description for a person to edit and approve.
 */

export type AssistMessage = { from: "company" | "assistant"; text: string; ask?: AskId };

/** The questions the assistant can ask, in the order it asks them. */
export type AskId = "work" | "size";

export const SHORT_SIZE = "10 to 30 minutes";
export const EVENT_SIZE = "A bigger event challenge, about 2 hours";

const ASKS: Record<AskId, { text: string; choices?: string[] }> = {
  work: { text: "What would this person work on in their first month? One sentence is enough." },
  size: { text: "How big should the challenge be?", choices: [SHORT_SIZE, EVENT_SIZE] },
};

export type AssistReply =
  | { kind: "question"; ask: AskId; text: string; choices?: string[] }
  | { kind: "draft"; draft: ChallengeDraft };

/** Minutes for a bigger event challenge, done before the event. */
const EVENT_MINUTES_BIG = 120;

function words(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

/** Words that already say how big the challenge is. */
const SIZE_WORDS = /\b(\d+\s*(min|mins|minutes|h|hours?)|minutes?|hours?|event challenge|bigger|short|quick|tunti|minuutti)/i;
const BIG_WORDS = /\b(bigger|event challenge|hours?|[2-9]\s*h\b|tunti)/i;

/** The question still open, or null when the assistant can draft. Never more than two questions. */
export function nextAsk(messages: readonly AssistMessage[]): AskId | null {
  const asked = new Set(messages.filter((m) => m.from === "assistant" && m.ask).map((m) => m.ask));
  if (asked.size >= 2) return null;
  const said = companyWords(messages);
  // A pasted job ad already says enough; drafting at once is what the company wants.
  if (words(said) >= 60) return null;
  if (!asked.has("work") && words(said) < 8) return "work";
  if (!asked.has("size") && !SIZE_WORDS.test(said)) return "size";
  return null;
}

/** What the company said about the work. An answer to the size question is about the challenge, not the job, so it is left out. */
function companyWords(messages: readonly AssistMessage[]): string {
  return messages
    .filter((m, i) => m.from === "company" && messages[i - 1]?.ask !== "size")
    .map((m) => m.text.trim())
    .filter(Boolean)
    .join("\n");
}

/** True when the company asked for a bigger event challenge. */
function wantsBig(messages: readonly AssistMessage[]): boolean {
  return BIG_WORDS.test(messages.filter((m) => m.from === "company").map((m) => m.text).join("\n"));
}

/** The company's first sentence about the work, when it says nothing about the person; else nothing. */
function workLine(said: string): string | undefined {
  const first = parseNeed(said).cleanedNeed.split(/(?<=[.!?])\s+|\n+/)[0]?.trim().replace(/[.!?:;,]+$/, "");
  if (!first || first.split(/\s+/).length < 3 || !isNeutral(first)) return undefined;
  return `${first[0].toUpperCase()}${first.slice(1)}.`;
}

/** An example job description from the draft and the company's own words, when the model wrote none. Work and skills only. */
function exampleJobAd(draft: ChallengeDraft, role: string | undefined, said = ""): string {
  const skills = draft.coreSkills.map((s) => s.label);
  const list = skills.length > 1 ? `${skills.slice(0, -1).join(", ")} and ${skills.at(-1)}` : (skills[0] ?? "");
  const work = workLine(said);
  return [
    `${role ?? "Join our team"}, Espoo`,
    `We are looking for ${role ? `${/^[aeiou]/i.test(role) ? "an" : "a"} ${role.toLowerCase()}` : "a new colleague"} to join our team.${work ? ` The work: ${work}` : ""}`,
    `In your first months you work on tasks like this one: "${draft.title.replace(/\.$/, "")}". The work needs these skills: ${list}.`,
    "Show us how you work: do our short challenge instead of sending a CV first. A person on our team reads every answer we take.",
  ].join("\n\n");
}

/** One turn of the chat: a short question, or the draft. */
export async function assist(messages: readonly AssistMessage[]): Promise<AssistReply> {
  const ask = nextAsk(messages);
  if (ask) return { kind: "question", ask, ...ASKS[ask] };
  const big = wantsBig(messages);
  const said = companyWords(messages);
  const draft = await draftChallenge(said);
  const role = matchRole(said)?.title;
  const roles = draft.roles?.length ? draft.roles : rolesOf({ title: draft.title, need: `${said} ${draft.need}` });
  const minutes = big ? EVENT_MINUTES_BIG : Math.min(30, Math.max(10, draft.minutes));
  // In the chat, every sentence is the company describing the work: the task is built from it, so none is "not core".
  const notCore = (text: string) => /not core for this task\.?$/i.test(text.trim());
  return {
    kind: "draft",
    draft: {
      ...draft,
      setAside: draft.setAside.filter((line) => !notCore(line)),
      ...(draft.wishes ? { wishes: draft.wishes.filter((w) => !(w.outcome === "set-aside" && notCore(w.reason ?? ""))) } : {}),
      yourWords: said,
      minutes,
      ...(roles.length ? { roles } : {}),
      jobAd: draft.jobAd ?? exampleJobAd(draft, role, said),
    },
  };
}
