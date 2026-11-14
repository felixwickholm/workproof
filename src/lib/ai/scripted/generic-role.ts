import type { RoleTemplate } from "./role-template";

/** Shown on a company draft built from this template, so a person rewrites the brief before publishing. */
export const GENERIC_NOTE = "No close match in the task library. Edit the brief before you publish.";

/** Shown when the company's sentence named no skill at all, so the draft falls back on skills almost every job needs. */
export const NO_SKILLS_NOTE =
  "No close match in the task library, and your sentence named no skills, so this draft tests skills almost every job needs. Say what the work is, or edit the brief before you publish.";

/**
 * Carried by a taster for a dream job the library has no task for. The try page reads it as the sign to say so
 * in its own words, so the brief itself never repeats it.
 */
export const NO_EXACT_TASK_NOTE = "There is no task for this exact job yet. This one practises planning, which almost every job needs.";

/** Shown when the draft borrows the nearest library role by skills, so a person adapts the brief. */
export const nearestNote = (roleTitle: string) =>
  `No close match in the task library. This draft uses the nearest role, ${roleTitle.toLowerCase()}, from the skills you named. Edit the brief before you publish.`;

/**
 * A template for roles outside the library. The task asks for judgment on an AI-drafted plan.
 * It uses no words from the company's need or the person's dream job, so nothing typed about
 * a person can reach the brief or the material, and an unusual job name never reads oddly in it.
 */
export function genericRole(): RoleTemplate {
  return {
    id: "generic",
    title: "A role",
    // An unknown job could be any level, so the demo event never uses this template.
    level: "practice",
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
      proofKind: "plan",
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
          cues: ["process", "week 3", "too early", "too soon", "whole department", "ask the people", "talk to", "pilot"],
        },
        {
          label: "goals with no way to tell whether they were met",
          cues: ["goal", "measure", "measurable", "how do we know", "vague", "metric", "baseline", "success"],
        },
        {
          label: "urgent problems that are never named or checked with anyone",
          cues: ["urgent", "which problems", "three problems", "who decides", "named", "week 2", "agree"],
        },
      ],
    },
    taster: {
      title: "Spot the problem in a plan",
      format: "review",
      proofKind: "plan",
      brief: "A colleague asked an AI assistant for next week's plan and wants to send it to the team as it is. Read it first.",
      material: {
        kind: "text",
        title: "Plan for next week (AI draft)",
        body: [
          "Monday: order the new equipment.",
          "Tuesday: set it up and show the team how it works.",
          "Wednesday: use it for every customer from the morning on.",
          "Friday: ask customers what they think.",
        ].join("\n"),
      },
      deliverable: "What would you change before this plan goes out, and why?",
      flaws: [
        {
          label: "every customer moves to the new setup before anyone has tried it",
          cues: ["every customer", "wednesday", "try", "pilot", "test", "too fast", "too soon", "rush", "first", "small", "deliver", "arrive"],
        },
      ],
    },
  };
}
