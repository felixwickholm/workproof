import { SKILLS, SKILL_IDS, type SkillId } from "@/lib/skills/vocabulary";
import { containsTerm, normalise } from "./match-role";

/**
 * Wishes that describe a person instead of the work. They never become skills
 * and never reach the brief. Each maps to a neutral name for the set-aside note.
 */
/** Builds a case-insensitive pattern with Unicode word edges, so Finnish words match whole. */
function words(source: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, "iu");
}

const PROTECTED: { name: string; pattern: RegExp }[] = [
  { name: "age", pattern: words("young|younger|youthful|aged?|under \\d{2}|over \\d{2}|\\d{2}\\s*-\\s*\\d{2}\\s*(?:years|yrs|vuotias)|years old|digital natives?|recent grad\\p{L}*|fresh grad\\p{L}*|energetic|nuori|nuoria|nuorekas|ikä\\p{L}*|alle \\d{2}") },
  { name: "native language", pattern: words("(?<!cloud[- ]|react )natives?(?![- ](?:app|apps|mobile|ios|android|code|modules?|integrations?))|äidinkiel\\p{L}*|syntyperäi\\p{L}*") },
  { name: "nationality", pattern: words("nationality|citizens?|citizenship|finnish[- ]born|born in|local only|kansalai\\p{L}*|suomalainen|kantasuomalai\\p{L}*") },
  { name: "gender", pattern: words("male|female|man|woman|men|women|guy|guys|girl|girls|lady|ladies|gentleman|mies|miehiä|nainen|naisia") },
  { name: "school", pattern: words("(?:top|elite|prestigious|leading|ivy|best|good)[- ](?:league[- ])?(?:university|universities|school|schools|college|colleges)|aalto|mit|stanford|oxford|cambridge|harvard|kth|eth|huippuyliopisto\\p{L}*") },
  { name: "photo", pattern: words("(?:photo|photos|picture|valokuva\\p{L}*) (?:with|of|on|in|for) (?:the |your |an? )?(?:application|applicant|cv|yourself|candidate|hakemu\\p{L}*)|headshot|good[- ]looking|attractive|presentable|appearance") },
  { name: "culture fit", pattern: words("culture fit|cultural fit|fits? (?:our|the|in with the) (?:culture|team|vibe)|like[- ]minded|one of us") },
  { name: "family status", pattern: words("no kids|no children|childless|single(?![- ](?:sign|page|source|point|tenant))|married|family status|family plans|pregnan\\p{L}*|parental leave|perheetön") },
  { name: "religion or health", pattern: words("religio\\p{L}*|christian|muslim|healthy|disabilit\\p{L}*|uskonto") },
];

const TOOL_WORDS = [
  "python", "java", "javascript", "typescript", "golang", "rust", "c#", "kotlin", "swift", "excel",
  "docker", "kubernetes", "terraform", "aws", "azure", "gcp", "react", "jira", "figma", "sap", "matlab",
];

export interface ParsedNeed {
  /** Every wish the company listed, in order. */
  wishes: string[];
  /** Skill ids named by the wishes, in order of first mention. */
  wishedSkills: SkillId[];
  /** Neutral names of protected attributes the need asked for. */
  notUsed: string[];
  /** Wishes that did not map to a skill, each with a short reason. */
  otherWishes: string[];
  /** The need with protected wishes replaced, safe to show to talent. */
  cleanedNeed: string;
}

export function splitWishes(need: string): string[] {
  return need
    .split(/[,;\n•]|:\s|\.\s|\s+and\s+|\s+ja\s+|\s+\+\s+|\s+plus\s+|\s+who\s+|\s+joka\s+/i)
    .map((part) => part.replace(/^[\s\-*\d.)]+/, "").replace(/[\s.]+$/, "").trim())
    .filter((part) => part.length >= 2);
}

export function protectedNames(text: string): string[] {
  const lower = normalise(text);
  return PROTECTED.filter(({ pattern }) => pattern.test(lower)).map(({ name }) => name);
}

export function skillsIn(text: string): SkillId[] {
  const lower = normalise(text);
  return SKILL_IDS.filter((id) =>
    [SKILLS[id].label.toLowerCase(), ...SKILLS[id].synonyms].some((term) => containsTerm(lower, term)),
  );
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function reasonFor(wish: string): string {
  const lower = normalise(wish);
  if (/\b(?:years?|yrs|vuotta|vuoden)\b/.test(lower)) return `${capitalise(wish)}: the work shows ability directly`;
  if (/\b(?:degree|master'?s|bachelor'?s|msc|bsc|phd|tutkinto)\b/.test(lower)) return `${capitalise(wish)}: the work shows ability directly`;
  if (/\b(?:fluent|language|kielitaito|speaks?)\b/.test(lower) || /\b(?:finnish|english|swedish|suomi|ruotsi|englanti)\b/.test(lower)) {
    return `${capitalise(wish)}: talk about it in the meeting`;
  }
  if (TOOL_WORDS.some((tool) => containsTerm(lower, tool))) return `${capitalise(wish)}: a tool, the task allows any tool`;
  return `${capitalise(wish)}: not core for this task`;
}

/** Words that only introduce the role ("we need", "looking for") and carry no wish. */
const INTRO = /^(?:we|i|our team|the team)?\s*(?:need|needs|are looking for|am looking for|looking for|want|tarvitsemme|etsimme|haemme)\b/i;

/** Closes the gaps left where a wish was removed from the sentence. */
function tidy(text: string): string {
  return text
    .replace(/\s+,/g, ",")
    .replace(/(?:,\s*)+,/g, ",")
    .replace(/[,;\s]+(?:and|or)?\s*$/i, "")
    .replace(/:\s*,\s*/g, ": ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,;\s]*(?:(?:and|with)\s+)?/i, "")
    .replace(/^./, (first) => first.toUpperCase())
    .trim();
}

export function parseNeed(need: string, roleKeywords: string[]): ParsedNeed {
  const wishes: string[] = [];
  const wishedSkills: SkillId[] = [];
  const notUsed = new Set<string>();
  const otherWishes: string[] = [];
  let cleanedNeed = need;

  for (const raw of splitWishes(need)) {
    const wish = raw.replace(INTRO, "").replace(/^(?:an?|someone|somebody)\s+/i, "").trim();
    if (wish.length < 2) continue;
    wishes.push(wish);

    const blocked = protectedNames(wish);
    const skills = skillsIn(wish);
    for (const id of skills) if (!wishedSkills.includes(id)) wishedSkills.push(id);

    if (blocked.length > 0) {
      blocked.forEach((name) => notUsed.add(name));
      cleanedNeed = cleanedNeed.replace(raw, "");
      continue;
    }
    if (skills.length > 0) continue;
    const describesRole = roleKeywords.some((keyword) => containsTerm(normalise(wish), keyword));
    if (!describesRole) otherWishes.push(reasonFor(wish));
  }

  return { wishes, wishedSkills, notUsed: [...notUsed], otherWishes, cleanedNeed: tidy(cleanedNeed) };
}
