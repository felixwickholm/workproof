import { protectedNames, workingLanguage } from "@/lib/guard/protected";
import { SKILLS, SKILL_IDS, type SkillId } from "@/lib/skills/vocabulary";
import { containsTerm, normalise } from "./match-role";
import { skillsInSentence } from "./sentence-skills";

const TOOL_WORDS = [
  "python", "java", "javascript", "typescript", "golang", "rust", "c#", "kotlin", "swift", "excel",
  "docker", "kubernetes", "terraform", "aws", "azure", "gcp", "react", "jira", "figma", "sap", "matlab",
];

export interface ParsedNeed {
  /** Every wish the company listed, in order. */
  wishes: string[];
  /** The wishes that ask for something, without the ones that only name the role ("ML engineer for our robots"). */
  listed: string[];
  /** Skill ids named by the wishes, in order of first mention. */
  wishedSkills: SkillId[];
  /** Neutral names of protected attributes the need asked for. */
  notUsed: string[];
  /** Wishes that did not map to a skill, each with a short reason. */
  otherWishes: string[];
  /** Languages asked for as a working language, in neutral form: "Working language: Finnish". */
  workingLanguages: string[];
  /** The need with protected wishes replaced, safe to show to talent. */
  cleanedNeed: string;
}

function splitWishes(need: string): string[] {
  return need
    .split(/[,;\n•]|:\s|\.\s|\s+and\s+|\s+ja\s+|\s+\+\s+|\s+plus\s+|\s+who\s+|\s+joka\s+/i)
    .map((part) => part.replace(/^[\s\-*\d.)]+/, "").replace(/[\s.]+$/, "").trim())
    .filter((part) => part.length >= 2);
}

export function skillsIn(text: string): SkillId[] {
  const lower = normalise(text);
  const named = SKILL_IDS.filter((id) =>
    [SKILLS[id].label.toLowerCase(), ...SKILLS[id].synonyms].some((term) => containsTerm(lower, term)),
  );
  const described = skillsInSentence(lower).filter((id) => !named.includes(id));
  return [...named, ...described];
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

/** "who can", "able to" and similar openings left after splitting a sentence. */
const ABILITY = /^(?:who\s+)?(?:can|could|will|would|is able to|are able to|able to|knows how to|to)\s+/i;

/** A wish that only names a person ("someone", "a developer") and asks for nothing. */
const ONLY_A_PERSON = /^(?:an?\s+|the\s+)?(?:someone|somebody|person|people|one|developer|engineer|expert|specialist|colleague|teammate|hire)$/i;

/** Closes the gaps left where a wish was removed from the sentence. */
function tidy(text: string): string {
  return text
    .replace(/\s+(?:who|that|joka|som)(?=\s*(?:[,.;]|$|\band\b|\bja\b))/gi, "")
    .replace(/\s+(?:and|ja|och|with)\s+(?=[,.;]|$|(?:and|ja|och)\b)/gi, " ")
    .replace(/\s+,/g, ",")
    .replace(/(?:,\s*)+,/g, ",")
    .replace(/[,;:\s]+(?:and|or)?\s*$/i, "")
    .replace(/:\s*,\s*/g, ": ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[,;\s]*(?:(?:and|with)\s+)?/i, "")
    .replace(/^./, (first) => first.toUpperCase())
    .trim();
}

export function parseNeed(need: string, roleKeywords: string[]): ParsedNeed {
  const wishes: string[] = [];
  const listed: string[] = [];
  const wishedSkills: SkillId[] = [];
  const notUsed = new Set<string>();
  const otherWishes: string[] = [];
  const workingLanguages: string[] = [];
  let cleanedNeed = need;

  for (const raw of splitWishes(need)) {
    const wish = raw.replace(INTRO, "").replace(/^(?:an?|someone|somebody)\s+/i, "").replace(ABILITY, "").trim();
    if (wish.length < 2 || ONLY_A_PERSON.test(wish)) continue;
    wishes.push(wish);

    const blocked = protectedNames(wish);
    const skills = skillsIn(wish);
    for (const id of skills) if (!wishedSkills.includes(id)) wishedSkills.push(id);

    const describesRole = roleKeywords.some((keyword) => containsTerm(normalise(wish), keyword));
    // The opening names the role ("Data engineer for our meter data"): it is not a wish of its own.
    const opensWithRole = describesRole && wishes.length === 1;
    if (blocked.length > 0 || (!opensWithRole && (skills.length > 0 || !describesRole))) listed.push(wish);

    if (blocked.length > 0) {
      blocked.forEach((name) => notUsed.add(name));
      cleanedNeed = cleanedNeed.replace(raw, "");
      continue;
    }
    if (skills.length > 0) continue;
    const language = workingLanguage(wish);
    if (language) {
      if (!workingLanguages.includes(language)) workingLanguages.push(language);
      continue;
    }
    if (!describesRole) otherWishes.push(reasonFor(wish));
  }

  return { wishes, listed, wishedSkills, notUsed: [...notUsed], otherWishes, workingLanguages, cleanedNeed: tidy(cleanedNeed) };
}
