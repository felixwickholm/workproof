import type { ProofKind, TaskFormat } from "@/lib/domain/types";
import type { SkillId } from "@/lib/skills/vocabulary";

/** A flaw planted in the material. Cues let a follow-up question quote the part of an answer about it. */
interface PlantedFlaw {
  /** Short noun phrase for the flaw, for example "the missing timeout". Not shown to reviewers. */
  label: string;
  /** Lowercase words or phrases that show an answer talks about this flaw. */
  cues: string[];
}

export interface TaskTemplate {
  title: string;
  format: TaskFormat;
  /** What the person hands in. Photo, video, design and voice tasks always accept words instead. */
  proofKind: ProofKind;
  /** The situation, written like a message from the team. Under 120 words. */
  brief: string;
  material: { kind: "code" | "text"; title: string; body: string };
  deliverable: string;
  flaws: PlantedFlaw[];
}

/**
 * "degree": the work normally needs a university or university of applied sciences degree. Espoo's talent
 * events are for these professions, so the demo event uses only them. "practice": a 2-minute practice task
 * for anyone who types this job as a dream job.
 */
export type RoleLevel = "degree" | "practice";

export interface RoleTemplate {
  id: string;
  title: string;
  level: RoleLevel;
  /** Lowercase match terms, English and Finnish. Short terms (up to 3 letters) match whole words only. */
  keywords: string[];
  /** Default core skills, most important first. 4 or 5 ids. */
  skills: SkillId[];
  /** Everyday words this role's companies use for a skill, added to the vocabulary cues ("fast on the line" for a cook). */
  cues?: Partial<Record<SkillId, string[]>>;
  /** Role-specific reasons, replacing the vocabulary default. */
  why?: Partial<Record<SkillId, string>>;
  /** Role-specific reviewer notes, replacing the vocabulary default. */
  lookFor?: Partial<Record<SkillId, string>>;
  /** Constraints used in follow-up questions: "If <constraint>, what would you change?" */
  constraints: string[];
  /** 20-minute event challenge. Material: 12 to 25 lines with 2 or 3 planted flaws. */
  challenge: TaskTemplate;
  /** 2-minute taster. Material: at most 10 short lines, one sharp question as the deliverable. */
  taster: TaskTemplate;
}
