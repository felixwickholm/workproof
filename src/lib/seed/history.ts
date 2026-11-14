import type { PastWork, SkillScore } from "@/lib/domain/types";
import { SKILLS, type SkillId } from "@/lib/skills/vocabulary";
import { companyName } from "./companies";

const DAY = 86_400_000;

const skills = (...ids: SkillId[]) =>
  ids.map((id) => ({ id, label: SKILLS[id].label }));

/** Two earlier Espoo events Olena went to, days before the current one. */
const EARLIER_EVENTS = [
  { name: "Espoo Spring Talent Day", daysAgo: 196 },
  { name: "Espoo Tech Talent Evening", daysAgo: 77 },
] as const;

type SeedPast = Omit<
  PastWork,
  "id" | "talentId" | "event" | "submittedAt" | "companyName" | "scores"
> & { event: 0 | 1; companyId: string; points: SkillScore["points"][] };

/**
 * Olena's finished tasks from the two earlier events: two "Meet", two "Not now", each with the named reviewer's
 * points per skill (in the order of `skills`) and written answer. Synthetic, and already blind: no name, place or school in the words.
 */
const OLENA_PAST: SeedPast[] = [
  {
    event: 0,
    companyId: "co-saarnivo",
    taskTitle: "Find what is wrong in a week of meter readings",
    format: "fix",
    skills: skills("data-quality", "data-visualisation", "writing-clarity"),
    answer: [
      "Three problems. Meter 14 sends every reading twice on Tuesday, so the day looks 30% higher than it was.",
      "Sunday has no reading between 02:00 and 03:00, which is the clock change, not a broken meter.",
      "I would drop the duplicates, mark the missing hour, and redraw the chart with both fixes before anyone reads it.",
    ].join("\n"),
    points: [3, 3, 4],
    reviewer: "Mira Salo",
    decision: "pass",
    feedback:
      "You found the duplicate readings and explained the missing hour well. You did not check the units: two meters report in kWh, not MWh. That check is most of this role, so it is not now.",
  },
  {
    event: 0,
    companyId: "co-vesto",
    taskTitle: "Choose which customer request to build first",
    format: "choose",
    skills: skills(
      "prioritisation",
      "customer-discovery",
      "stakeholder-communication",
    ),
    answer: [
      "Build the shared login first.",
      "Four of six customers asked for it, and two said they would stop renewing without it.",
      "The custom report is one customer, and I would first ask what they do with it today. It may be a spreadsheet we can export.",
    ].join("\n"),
    points: [5, 5, 4],
    reviewer: "Riikka Aalto",
    decision: "meet",
    feedback:
      "You asked what the customer does with the report today before building anything. That question is the job, and you put it in two lines.",
  },
  {
    event: 1,
    companyId: "co-tuulos",
    taskTitle: "Review a prompt that sorts warehouse tickets",
    format: "fix",
    skills: skills("prompt-design", "llm-evaluation", "ai-assisted-work"),
    answer: [
      "The prompt has no example of a ticket that fits two groups, so it guesses. Half of the wrong ones in the log are like that.",
      "Add three mixed examples and a rule: when two groups fit, pick the one that stops a robot.",
      "Then test on the 40 tickets from last week and list the ones a person still had to move.",
    ].join("\n"),
    points: [4, 5, 4],
    reviewer: "Elias Virta",
    decision: "meet",
    feedback:
      "You went to the log before changing the prompt, and your test uses last week's real tickets. We would like to talk about the sorting work.",
  },
  {
    event: 1,
    companyId: "co-kivira",
    taskTitle: "Plan a two-week trial of a contract search tool",
    format: "make",
    skills: skills("planning", "risk-management", "writing-clarity"),
    answer: [
      "Week 1: load 50 signed contracts and ask the ten questions the legal team asks most.",
      "Week 2: two lawyers use it for real questions and mark every answer right or wrong.",
      "Stop the trial if it misses a deadline clause even once.",
    ].join("\n"),
    points: [4, 2, 4],
    reviewer: "Tomas Berg",
    decision: "pass",
    feedback:
      "The plan is short and the stop rule is clear. You did not say who reads the contracts before they go into the tool, and some hold personal data. For this role that comes first.",
  },
];

/** Olena's earlier work, dated relative to `now` so the portfolio always looks lived-in. */
export function olenaHistory(now: Date, talentId: string): PastWork[] {
  return OLENA_PAST.map(({ event, companyId, points, ...work }, i) => {
    const { name, daysAgo } = EARLIER_EVENTS[event];
    const day = new Date(now.getTime() - daysAgo * DAY);
    return {
      ...work,
      id: `past_olena_${i + 1}`,
      talentId,
      event: { name, date: day.toISOString().slice(0, 10) },
      companyName: companyName(companyId),
      scores: work.skills.map(({ id }, n) => ({ skillId: id, points: points[n] })),
      submittedAt: new Date(day.getTime() - (i % 2) * 3_600_000).toISOString(),
    };
  });
}
