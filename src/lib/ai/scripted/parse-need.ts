import { isNeutral } from "@/lib/guard/check-draft";
import { jobFacts, withoutJobFacts } from "@/lib/guard/job-facts";
import { protectedNames } from "@/lib/guard/protected";
import { SKILL_CUES } from "@/lib/skills/cues";
import { isFinnishStem } from "@/lib/skills/finnish-stems";
import { SKILLS, SKILL_IDS, type SkillId } from "@/lib/skills/vocabulary";
import { containsTerm, normalise } from "./match-role";
import type { RoleTemplate } from "./role-template";
import { skillsInSentence } from "./sentence-skills";

const TOOL_WORDS = [
  "python", "java", "javascript", "typescript", "golang", "rust", "c#", "kotlin", "swift", "excel",
  "docker", "kubernetes", "terraform", "aws", "azure", "gcp", "react", "jira", "figma", "sap", "matlab",
];

/** The parts of a library role that steer how a wish is read: its words, its skills and its own cues. */
type CueRole = Pick<RoleTemplate, "keywords" | "skills" | "cues">;

/**
 * What a wish asks for: work (a skill), something about the person, years or degrees, a fact about the job
 * (a language or a licence the work needs), a language without a level, a tool, or other.
 */
export type WishKind = "skill" | "person" | "experience" | "fact" | "language" | "tool" | "other";

/** One wish the company listed, read on its own. Company-side only. */
export interface ParsedWish {
  /** The wish as typed, first letter capitalised. */
  text: string;
  kind: WishKind;
  /** Skills the wish describes, best first. Empty unless the kind is "skill". */
  skills: SkillId[];
  /** Neutral attribute names ("age", "school") for a wish about the person. */
  person: string[];
}

export interface ParsedNeed {
  /** Every wish the company listed, in order. */
  wishes: string[];
  /** The wishes that ask for something, each read on its own. Words that only name the role ("ML engineer for our robots") are left out. */
  items: ParsedWish[];
  /** Skill ids named by the wishes, in order of first mention. */
  wishedSkills: SkillId[];
  /** Neutral names of protected attributes the need asked for. */
  notUsed: string[];
  /** Wishes that did not map to a skill, each with a short reason. */
  otherWishes: string[];
  /** Facts about the job in fixed forms ("Work language: English", "Nurse licence needed"), without repeats. */
  facts: string[];
  /** The need with protected wishes replaced, safe to show to talent. */
  cleanedNeed: string;
}

/** A list marker before a wish: a dash, a star or "1." and "2)". A number that is part of the wish ("5 years") stays. */
const LIST_MARKER = /^(?:[\s\-*]|\d{1,2}[.)](?=\s))+/;

/** A line that starts with a list sign: the company listed it as one wish, so its commas and "and" stay inside it. */
const LISTED_LINE = /^\s*(?:[-*•]|\d{1,2}[.)])\s+/;

const WISH_BREAK = /[,;•]|:\s|\.\s|\s+and\s+|\s+ja\s+|\s+\+\s+|\s+plus\s+|\s+who\s+|\s+joka\s+/i;

function splitWishes(need: string): string[] {
  return need
    .split("\n")
    .flatMap((line) => (LISTED_LINE.test(line) ? [line] : line.split(WISH_BREAK)))
    .map((part) => part.replace(LIST_MARKER, "").replace(/[\s.]+$/, "").trim())
    .filter((part) => part.length >= 2);
}

/** A degree asks for a paper, not for work, even when it names a field: "A degree in electrical engineering". */
const CREDENTIAL = /\b(?:degree|master'?s|bachelor'?s|msc|bsc|phd|diploma|tutkinto|korkeakoulututkinto|examen)\b/i;

/**
 * Skills named outright by a label or synonym. A term found only inside a longer term of another skill
 * does not count, so "food safety" names Food safety and not also Safety thinking.
 */
function namedSkills(lower: string): SkillId[] {
  const found = SKILL_IDS.map((id) => ({
    id,
    terms: [SKILLS[id].label.toLowerCase(), ...SKILLS[id].synonyms].filter((term) => containsTerm(lower, term)),
  })).filter((hit) => hit.terms.length > 0);
  const insideLonger = (id: SkillId, term: string) =>
    found.some((other) => other.id !== id && other.terms.some((longer) => longer.length > term.length && containsTerm(longer, term)));
  return found.filter((hit) => hit.terms.some((term) => !insideLonger(hit.id, term))).map((hit) => hit.id);
}

/** Text reduced to lowercase words between single spaces, so a cue is found by a plain string search. */
function wordsOf(text: string): string {
  return ` ${text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;
}

/**
 * The same whole-word rule as `containsTerm`, with an English plural allowed and Finnish stems inside compounds,
 * but without a pattern per cue: there are hundreds of cues and every wish is checked against all of them.
 */
function hasCue(textWords: string, cue: string): boolean {
  const cueWords = wordsOf(cue).trim();
  if (cueWords.length > 3 && isFinnishStem(cue)) return textWords.includes(cueWords);
  return [" ", "s ", "es "].some((end) => textWords.includes(` ${cueWords}${end}`));
}

/**
 * The skill everyday words point to ("calm with families"). The role's own skills come first, then the
 * skill with the most cue words, then list order, so the result never depends on anything but the text.
 */
function cuedSkill(text: string, role: CueRole | undefined, roleOnly: boolean): SkillId | undefined {
  const textWords = wordsOf(text);
  const rank = (id: SkillId) => {
    const at = role?.skills.indexOf(id) ?? -1;
    return at >= 0 ? at : role ? role.skills.length + SKILL_IDS.indexOf(id) : SKILL_IDS.indexOf(id);
  };
  const hits = SKILL_IDS.map((id) => ({
    id,
    inRole: role?.skills.includes(id) ?? false,
    count: [...SKILL_CUES[id], ...(role?.cues?.[id] ?? [])].filter((cue) => hasCue(textWords, cue)).length,
  })).filter((hit) => hit.count > 0 && (!roleOnly || hit.inRole));
  hits.sort((a, b) => Number(b.inRole) - Number(a.inRole) || b.count - a.count || rank(a.id) - rank(b.id));
  return hits[0]?.id;
}

/**
 * Skills a wish names or describes. Labels and synonyms count first, then work described in a plain
 * sentence. Everyday cue words count only when nothing is named. With a library role, the role reads
 * its own wishes: when a wish hits one of the role's skills, a skill outside the role that it only names
 * by a loose word is dropped ("care for how a model is tested" is not Patient safety for an ML engineer),
 * and a wish that hits none of them becomes the role's own skill when its cue words point there
 * ("explains bills simply" is Plain language for customer service).
 */
export function skillsIn(text: string, role?: CueRole): SkillId[] {
  const lower = normalise(text);
  const named = namedSkills(lower);
  const described = skillsInSentence(lower).filter((id) => !named.includes(id));
  const found = [...named, ...described];
  if (found.length === 0) {
    const cued = cuedSkill(lower, role, false);
    return cued ? [cued] : [];
  }
  if (!role) return found;
  const inRole = (id: SkillId) => role.skills.includes(id);
  if (found.some(inRole)) return found.filter((id) => inRole(id) || described.includes(id));
  const cued = cuedSkill(lower, role, true);
  return cued ? [cued] : found;
}

function capitalise(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** The kind and the set-aside line for a wish that names no skill and no protected attribute. */
function readOther(wish: string): { kind: WishKind; line: string } {
  const lower = normalise(wish);
  const line = (reason: string) => `${capitalise(wish)}: ${reason}`;
  if (/\b(?:years?|yrs|vuotta|vuoden)\b/.test(lower)) return { kind: "experience", line: line("the work shows ability directly") };
  if (/\b(?:degree|master'?s|bachelor'?s|msc|bsc|phd|tutkinto)\b/.test(lower)) return { kind: "experience", line: line("the work shows ability directly") };
  if (/\b(?:fluent|language|kielitaito|speaks?)\b/.test(lower) || /\b(?:finnish|english|swedish|suomi|ruotsi|englanti)\b/.test(lower)) {
    return { kind: "language", line: line("talk about it in the meeting") };
  }
  if (TOOL_WORDS.some((tool) => containsTerm(lower, tool))) return { kind: "tool", line: line("a tool, the task allows any tool") };
  return { kind: "other", line: line("not core for this task") };
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

/**
 * The need without its first line when that line only names the role above a list, as a job ad's title
 * does: "Marketing and communications specialist" picks the role and is not a wish for communication.
 */
function withoutRoleLine(need: string, roleKeywords: readonly string[]): string {
  const [first, ...rest] = need.split("\n");
  const isRoleLine =
    rest.some((line) => LISTED_LINE.test(line)) && !LISTED_LINE.test(first) && roleKeywords.some((keyword) => containsTerm(normalise(first), keyword));
  return isRoleLine ? rest.join("\n") : need;
}

/**
 * Splits a need into wishes and reads each one. With a library role, the role's skills and cues
 * decide close calls, so a home-care wish about "the day when carers are off sick" is care planning.
 */
export function parseNeed(need: string, role?: CueRole): ParsedNeed {
  const roleKeywords = role?.keywords ?? [];
  const wishes: string[] = [];
  const items: ParsedWish[] = [];
  const wishedSkills: SkillId[] = [];
  const notUsed = new Set<string>();
  const otherWishes: string[] = [];
  const facts: string[] = [];
  let cleanedNeed = need;

  for (const raw of splitWishes(withoutRoleLine(need, roleKeywords))) {
    const wish = raw.replace(INTRO, "").replace(/^(?:an?|someone|somebody)\s+/i, "").replace(ABILITY, "").trim();
    if (wish.length < 2 || ONLY_A_PERSON.test(wish)) continue;
    wishes.push(wish);

    // A licence or language level is a fact about the job, even next to a wish about the person.
    const wishFacts = jobFacts(wish);
    for (const fact of wishFacts) if (!facts.includes(fact)) facts.push(fact);
    const blocked = protectedNames(wishFacts.length > 0 ? withoutJobFacts(wish) : wish);
    const skills = wishFacts.length > 0 || CREDENTIAL.test(wish) ? [] : skillsIn(wish, role);
    for (const id of skills) if (!wishedSkills.includes(id)) wishedSkills.push(id);

    // A degree is a wish of its own, even when its field names the role ("A degree in marketing").
    const describesRole = !CREDENTIAL.test(wish) && roleKeywords.some((keyword) => containsTerm(normalise(wish), keyword));
    // The opening names the role ("Data engineer for our meter data"): it is not a wish of its own.
    const opensWithRole = describesRole && wishes.length === 1;
    const isListed = blocked.length > 0 || (!opensWithRole && (skills.length > 0 || !describesRole));
    const item = (kind: WishKind, person: string[] = []) => {
      if (isListed || kind === "fact") items.push({ text: capitalise(wish), kind, skills: kind === "skill" ? skills : [], person });
    };

    if (blocked.length > 0) {
      blocked.forEach((name) => notUsed.add(name));
      cleanedNeed = cleanedNeed.replace(raw, "");
      item("person", blocked);
      continue;
    }
    if (wishFacts.length > 0) {
      item("fact");
      continue;
    }
    if (skills.length > 0) {
      item("skill");
      continue;
    }
    if (describesRole) continue;
    const other = readOther(wish);
    otherWishes.push(other.line);
    // A wish that judges a person is never echoed as a reason; it is counted as a wish about the person.
    if (isNeutral(other.line)) item(other.kind);
    else item("person", ["wishes about the person"]);
  }

  return { wishes, items, wishedSkills, notUsed: [...notUsed], otherWishes, facts, cleanedNeed: tidy(cleanedNeed) };
}
