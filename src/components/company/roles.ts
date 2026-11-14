import type { ChallengeDraft, JobRole } from "@/lib/domain/types";
import { JOB_ROLES, ROLE_LABEL } from "@/lib/domain/roles";
import { DEFAULT_PLACES } from "@/lib/domain/places";
import { SKILLS, toSkill, type SkillId } from "@/lib/skills/vocabulary";

/**
 * The kinds of job seeker a company can look for: the shared role list (`src/lib/domain/roles.ts`), the
 * same chips the job seeker picks from, so a challenge made for "Data analyst" reaches people who chose it.
 */
export interface CompanyRole {
  id: JobRole;
  /** The chip label, the same words the job seeker side shows. */
  label: string;
  /** The role as one sentence for the task designer: the role first, then the work it leans on. */
  need: string;
  /** Three skills from the shared list, for a challenge the company writes by hand. */
  skills: readonly [SkillId, SkillId, SkillId];
}

/** What the designer and a hand-written challenge start from, per role. A new role must add a line here. */
const ROLE_START: Record<JobRole, Pick<CompanyRole, "need" | "skills">> = {
  "ai-developer": {
    need: "AI developer: finds what to automate first, makes a practical plan and sees the risk",
    skills: ["automation-choice", "practical-plan", "risk-sense"],
  },
  "software-engineer": {
    need: "Software engineer: API design, error handling, testing and code review",
    skills: ["api-design", "error-handling", "testing"],
  },
  "data-analyst": {
    need: "Data analyst: SQL, data quality, dashboards and explaining numbers to managers",
    skills: ["sql", "data-quality", "technical-explanation"],
  },
  "financial-analyst": {
    need: "Financial analyst: budget analysis, bookkeeping accuracy and explaining numbers to managers",
    skills: ["budget-analysis", "bookkeeping-accuracy", "technical-explanation"],
  },
  marketing: {
    need: "Marketing: campaign analysis, audience insight and clear writing",
    skills: ["campaign-analysis", "audience-insight", "writing-clarity"],
  },
  sales: {
    need: "Sales: key account work, customer discovery and clear writing",
    skills: ["customer-discovery", "stakeholder-communication", "writing-clarity"],
  },
  "product-manager": {
    need: "Product manager: prioritisation, stakeholder communication and a clear plan",
    skills: ["prioritisation", "metrics-definition", "stakeholder-communication"],
  },
  designer: {
    need: "Product designer: user research, interaction design and accessibility",
    skills: ["user-research", "interaction-design", "accessibility"],
  },
  "hardware-engineer": {
    need: "Hardware engineer: electronics test bench, timing analysis and test strategy",
    skills: ["embedded-constraints", "timing-analysis", "test-strategy"],
  },
  "civil-engineer": {
    need: "Civil engineer: structural design, building safety and technical explanation",
    skills: ["structural-design", "safety-thinking", "technical-explanation"],
  },
  researcher: {
    need: "Research scientist: scientific reasoning, experiment design and statistics",
    skills: ["scientific-reasoning", "experiment-design", "statistical-reasoning"],
  },
  legal: {
    need: "Lawyer: contract review, compliance and clear writing",
    skills: ["contract-review", "compliance", "writing-clarity"],
  },
};

export const COMPANY_ROLES: readonly CompanyRole[] = JOB_ROLES.map((id) => ({ id, label: ROLE_LABEL[id], ...ROLE_START[id] }));

export function roleById(id: string | null): CompanyRole | undefined {
  return COMPANY_ROLES.find((r) => r.id === id);
}

/**
 * What the designer drafts from: the role's sentence, then the company's own words when it added any.
 * The role comes first, so the designer picks the role's library task.
 */
export function roleNeed(role: CompanyRole, words: string): string {
  const extra = words.trim().replace(/\s+/g, " ");
  return extra ? `${role.need}. ${extra}` : role.need;
}

/**
 * A blank challenge for a company that writes its own: the role's three skills from the shared list
 * with their default notes for the reviewer, and the text left for the company to write.
 */
export function handDraft(role: CompanyRole): ChallengeDraft {
  return {
    title: "",
    need: role.need,
    coreSkills: role.skills.map((id) => toSkill(id)),
    setAside: [],
    format: "make",
    proofKind: "writing",
    minutes: 10,
    brief: "",
    deliverable: "",
    reviewGuide: role.skills.map((id) => ({ skillId: id, lookFor: SKILLS[id].lookFor })),
    aiAllowed: true,
    kind: "event",
    places: DEFAULT_PLACES,
    roles: [role.id],
  };
}
