import { findJudgement } from "@/lib/guard/no-judgement";
import { protectedNames } from "@/lib/guard/protected";
import type { RoleTemplate } from "./role-template";

/**
 * Turns a person's dream job, such as "I want to be a beekeeper", into a short role name for a taster.
 * Never used on a company's need: an event challenge is built only from neutral templates.
 */
export function roleNameFrom(text: string): string {
  const name = text
    .split(/[,.;:\n]/)[0]
    .replace(/^\s*(?:we|i)?\s*(?:need|are looking for|am looking for|looking for|want to be|want|would like to be|dream job is|my dream job is|tarvitsemme|etsimme)\s+/i, "")
    .replace(/^(?:an?|someone|somebody|to be an?|to be)\s+/i, "")
    .split(/\s+(?:who|that|with|for|to|joka)\s+/i)[0]
    .trim()
    .split(/\s+/)
    .slice(0, 5)
    .join(" ")
    .toLowerCase();
  const safe =
    name.length >= 2 &&
    name.length <= 48 &&
    findJudgement(name).length === 0 &&
    protectedNames(name).length === 0 &&
    !/[<>{}[\]]/.test(name);
  return safe ? name : "this role";
}

/**
 * A template for roles outside the library. The task asks for judgment on an AI-drafted plan.
 * The event challenge uses no words from the company's need, so nothing the company wrote about
 * a person can reach the brief or the material. Only the taster names the role, from the person's own dream job.
 */
export function genericRole(dreamJob = ""): RoleTemplate {
  const role = roleNameFrom(dreamJob);
  return {
    id: "generic",
    title: "A role",
    keywords: [],
    skills: ["prioritisation", "planning", "stakeholder-communication", "ai-assisted-work"],
    constraints: [
      "you had half the time",
      "the person who asked for this left the team",
      "the budget were cut by a third",
      "the first week went to an urgent problem",
    ],
    challenge: {
      title: "Review an AI-drafted first-month plan",
      format: "review",
      brief: `A new colleague starts with us next month. Their manager asked an AI assistant for a first-month plan and wants to hand it over as it is. We would like someone who knows the work to read it first. Tell us what you would change so the plan is realistic and useful.`,
      material: {
        kind: "text",
        title: "First month plan (AI draft)",
        body: [
          "Role: new team member",
          "",
          "Week 1",
          "- Meet the team and read all existing documents.",
          "- Set up tools and accounts.",
          "",
          "Week 2",
          "- Fix the three most urgent problems in the current way of working.",
          "",
          "Week 3",
          "- Launch a new process for the whole department.",
          "- Train everyone on the new process in one session.",
          "",
          "Week 4",
          "- Present results to leadership.",
          "",
          "Goals for the month: improve quality, save time, make customers happier.",
          "Budget needed: none.",
        ].join("\n"),
      },
      deliverable: "What would you change before this plan is handed over, and why? List the changes in order of importance.",
      flaws: [
        {
          label: "the new process launched before talking to the people who use it",
          topic: "the new process",
          cues: ["process", "week 3", "too early", "too soon", "whole department", "ask the people", "talk to", "pilot"],
        },
        {
          label: "goals with no way to tell whether they were met",
          topic: "the goals",
          cues: ["goal", "measure", "measurable", "how do we know", "vague", "metric", "baseline", "success"],
        },
        {
          label: "urgent problems that are never named or checked with anyone",
          topic: "the urgent problems",
          cues: ["urgent", "which problems", "three problems", "who decides", "named", "week 2", "agree"],
        },
      ],
    },
    taster: {
      title: "Fix an AI-drafted reply",
      format: "review",
      brief: `You work as ${role === "this role" ? "a member of the team" : `a ${role}`}. An AI assistant drafted this reply to someone who reported a delay.`,
      material: {
        kind: "text",
        title: "Draft reply",
        body: [
          "Thanks for flagging the delay.",
          "We have fixed the cause and it will not happen again.",
          "Let me know if anything else comes up.",
        ].join("\n"),
      },
      deliverable: "What would you change before sending it, and why?",
      flaws: [
        {
          label: "a promise made before the cause is known",
          topic: "the promise in the reply",
          cues: ["promise", "not happen again", "cause", "do we know", "check", "overpromis", "guarantee"],
        },
      ],
    },
  };
}
