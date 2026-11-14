import { SKILLS, SKILL_IDS } from "@/lib/skills/vocabulary";

/** All prompts for the Claude designer live in this file. */

const SKILL_LIST = SKILL_IDS.map((id) => `${id}: ${SKILLS[id].label}`).join("\n");

export const SYSTEM = `You design short work tasks for Tryout, a hiring event where people show their work instead of a CV.
Rules:
- Never score, rank, rate, praise or recommend a person or their work. Describe, do not judge.
- Never use or mention age, gender, nationality, native language, schools, photos, family status or "culture fit".
- Plain, specific English. Short sentences. No exclamation marks, no emoji, no em dashes.
- Reply with one JSON object and nothing else.`;

const TASK_SHAPE = `JSON shape:
{"title": string, "format": "review", "brief": string (under 90 words, written like a message from the team),
 "material": {"kind": "code" | "text", "title": string, "body": string},
 "deliverable": string, "coreSkills": [{"id": skill id, "why": one line}],
 "reviewGuide": [{"skillId": skill id, "lookFor": what good work shows, never a scale}],
 "setAside": [string]}
Skill ids (use only these):
${SKILL_LIST}`;

export function draftPrompt(need: string): string {
  return `A company wrote this need:
"""${need}"""
Draft a 20-minute task. The person reviews real material with 2 or 3 planted flaws (for example an AI-written code change of 12 to 25 lines, a plan, a query or an email) and answers: what would you change before this ships, and why?
Keep 3 to 5 core skills. Put every other wish in setAside with a short reason. Wishes about the person rather than the work go in one setAside note "Not used: <names> (not skills)".
${TASK_SHAPE}`;
}

export function tasterPrompt(dreamJob: string): string {
  return `Someone says their dream job is:
"""${dreamJob}"""
Draft a 2-minute task for that job. Material is at most 10 short lines with one planted flaw. The deliverable is one sharp question. Use 3 core skills and an empty setAside.
${TASK_SHAPE}`;
}

export function followUpPrompt(brief: string, answer: string, count: number): string {
  return `Task brief: """${brief}"""
The person answered: """${answer}"""
Write ${count} follow-up question(s) about their own answer. The first quotes a short phrase from the answer and asks why. ${count > 1 ? "The second asks what they would change if one constraint changed." : ""} If the answer is very short, ask for the reasoning behind it.
JSON shape: {"questions": [string]}`;
}

export function summaryPrompt(brief: string, answer: string, explain: string): string {
  return `Task brief: """${brief}"""
Work: """${answer}"""
Follow-up answers: """${explain}"""
List what the work talks about, as neutral topics (short noun phrases such as "the data split").
Do not say whether a topic is handled well, do not count anything, and do not use "all", "most" or "only".
"changes": topics where the work proposes a change. "notMentioned": up to 2 topics a reader might expect, such as tests or rollout.
JSON shape: {"topics": [string], "changes": [string], "notMentioned": [string]}`;
}
