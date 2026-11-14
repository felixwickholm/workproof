import { COMMON_WORDS, NOT_NAMES } from "./lexicon";
import { accentFree, caseless, HIDDEN, L, R, type Redactor } from "./redactor";

/** Letters of scripts other than Latin: a name written in Chinese, Arabic or Cyrillic. */
const NON_LATIN = "[^\\p{Script=Latin}\\p{N}\\p{P}\\p{S}\\s]+";
const NON_LATIN_NAME = `${NON_LATIN}(?:[ \\t]+${NON_LATIN}){0,2}`;

/** "My name is", "call me" and the like. What follows is a name in any case. */
const SURE_INTROS = [
  "my name is", "my name's", "name's", "call me", "they call me", "i go by",
  "minun nimeni on", "nimeni on", "mun nimi on", "olen nimeltäni",
  "jag heter", "mitt namn är", "ich heiße", "ich heisse", "mein name ist", "me llamo", "mi nombre es",
  "je m'appelle", "je m’appelle", "mon nom est", "mi chiamo", "meu nome é",
].join("|").replace(/ /g, "\\s+");

/** "I am", "this is" and the like. A name only when it is capitalised and not an ordinary word. */
const MAYBE_INTROS = caseless("I am|I'm|I’m|this is|it's|it’s|here is|olen|tässä|jag är|det här är|ich bin|hier ist|soy|je suis|sono");

/** Intros in other scripts, followed by a name in the same script. */
const SCRIPT_INTROS = "我叫|我的名字是|我是|私は|わたしは|僕は|اسمي|أنا|انا|меня зовут|моё имя|мое имя|я\\s|제 이름은|저는";

/** Lines that credit an author, as in code headers: "# author: ...", "// written by ...", "Copyright (c) 2024 ...". */
const AUTHOR_LINE =
  /((?:\bauthors?|\bwritten by|\bcreated by|\bmaintained by|\bmaintainers?|\bcontributors?|\bsigned|\btekijä|\bkirjoittanut|\bförfattare|\bskriven av|\bcopyright(?:\s*(?:\(c\)|©))?(?:\s*\d{4}(?:\s*[-–]\s*\d{4})?)?|©(?:\s*\d{4})?)\s*[:,-]?\s*)([^\n]+)/giu;

const NOT_AN_AUTHOR = /^(?:an?|the|ai|chatgpt|claude|copilot|gpt|an ai|hand|me|us|someone|the team|our team|reserved|all rights)\b/i;

function isOrdinaryWord(word: string): boolean {
  const lower = word.toLowerCase();
  return COMMON_WORDS.has(lower) || NOT_NAMES.has(word) || /(?:ing|ed|ly|ive|ous|ful|able|ible)$/.test(lower);
}

/** A capitalised name, not an ordinary word, not technical ("GroupShuffleSplit", "Q3"). */
function looksLikeName(candidate: string): boolean {
  const first = candidate.trim().split(/\s+/)[0] ?? "";
  if (!first || isOrdinaryWord(first)) return false;
  if (/\p{Lu}.*\p{Lu}/u.test(first.slice(1)) || /\p{N}/u.test(first)) return false;
  return true;
}

/** The author's own name: in full, as a handle, with initials, and as capitalised parts. */
function redactKnownName(r: Redactor, name: string): void {
  const parts = name.trim().split(/[\s-]+/).filter((part) => part.length >= 2);
  if (parts.length === 0) return;
  const first = parts[0];
  const last = parts[parts.length - 1];

  if (parts.length > 1) {
    r.replace(new RegExp(`${L}${parts.map(accentFree).join("[\\s-]+")}${R}`, "giu"), "names");
    // Handles and joined forms: "leilahaddad", "leila_haddad", "lhaddad", "leilah".
    const join = "[._-]?";
    const forms = [`${accentFree(first)}${join}${accentFree(last)}`, `${accentFree(first[0])}${join}${accentFree(last)}`, `${accentFree(first)}${join}${accentFree(last[0])}`];
    r.replace(new RegExp(`${L}(?:${forms.join("|")})[\\p{N}_-]*${R}`, "giu"), "names");
    // Initials: "L. Haddad", "Leila H.", "LH".
    r.replace(new RegExp(`${L}${accentFree(first[0].toUpperCase())}\\.\\s*${accentFree(last)}${R}`, "gu"), "names");
    r.replace(new RegExp(`${L}${accentFree(first)}\\s+${accentFree(last[0].toUpperCase())}\\.?${R}`, "gu"), "names");
    const initials = parts.map((p) => p[0].toUpperCase()).join("");
    r.replace(new RegExp(`${L}${initials}${R}`, "gu"), "names");
  }

  for (const part of parts) {
    const capitalised = part[0].toUpperCase() + part.slice(1);
    const pattern = accentFree(capitalised);
    // A part that is also a common word ("Will", "May", "Mark") is hidden only mid-sentence,
    // where a capital letter marks a name. Lowercase words are never touched.
    const where = COMMON_WORDS.has(part.toLowerCase()) ? "(?<=[\\p{L}\\p{N},;:)]\\s+)" : L;
    r.replace(new RegExp(`${where}(?:${pattern}|${pattern.toUpperCase()})(?:['’]s)?${R}`, "gu"), "names");
  }
}

/** Removes names: the author's own, self-introductions, author credits and signatures. */
export function redactNames(r: Redactor, name?: string): void {
  if (name?.trim()) redactKnownName(r, name);

  // Sure intros take any case: "my name is sanna virtanen". Stop at the first ordinary word.
  r.replace(
    new RegExp(`(?:${SURE_INTROS})\\s*[:,-]?\\s+(\\p{L}[\\p{L}'’-]*(?:\\s+\\p{L}[\\p{L}'’-]*){0,2})`, "giu"),
    "names",
    (candidate) => !isOrdinaryWord(candidate.split(/\s+/)[0]),
  );
  r.replace(new RegExp(`(?<![\\p{L}])(?:${MAYBE_INTROS})\\s+(\\p{Lu}[\\p{L}'’-]+(?:\\s+\\p{Lu}[\\p{L}'’-]+){0,2})`, "gu"), "names", looksLikeName);
  r.replace(new RegExp(`(?:${SCRIPT_INTROS})\\s*(${NON_LATIN_NAME})`, "giu"), "names");
  r.replace(new RegExp(`(?:${SURE_INTROS}|${MAYBE_INTROS})\\s+(${NON_LATIN_NAME})`, "giu"), "names");

  // "I, Sanna Virtanen, ..." names the writer in apposition.
  r.replace(/\bI,\s+(\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+){0,2})(?=\s*[,(]|\s+(?:from|of|at)\b)/gu, "names", looksLikeName);

  // "Sanna Virtanen here." and "Sanna here," at the start of a sentence.
  r.replace(/(?:^|(?<=[.!?]\s+))(\p{Lu}\p{Ll}+(?:\s+\p{Lu}\p{Ll}+){0,2})\s+here\b(?=\s*[.,!:;-]|\s*$)/gmu, "names", looksLikeName);

  // Author credits in code and documents: hide the rest of the line.
  r.text = r.text.replace(AUTHOR_LINE, (whole, lead: string, rest: string) => {
    const credit = rest.trim();
    if (!/\p{L}/u.test(credit) || credit === HIDDEN || NOT_AN_AUTHOR.test(credit)) return whole;
    r.report.names += 1;
    const tail = /\s*(?:\*\/|-->|"""|''')\s*$/.exec(rest)?.[0] ?? "";
    return `${lead}${HIDDEN}${tail}`;
  });

  redactSignature(r);
}

const NAME_LINE = /^(?:\p{Lu}[\p{L}'’.-]*|\p{Lu}\.)(?:\s+(?:\p{Lu}[\p{L}'’.-]*|\p{Lu}\.)){0,3}$/u;
const LOWER_NAME_LINE = /^\p{Ll}[\p{L}'’-]+(?:\s+\p{Ll}[\p{L}'’-]+){0,2}$/u;
const SCRIPT_NAME_LINE = new RegExp(`^${NON_LATIN_NAME}$`, "u");

const SIGN_OFF =
  /^(?:best regards|kind regards|warm regards|all the best|best wishes|best|regards|thanks|thank you|cheers|br|yours|sincerely|ystävällisin terveisin|terveisin|terkuin|t\.|hälsningar|med vänliga hälsningar|mvh|vänliga hälsningar|viele grüße|mit freundlichen grüßen|saludos|cordialement|cordiali saluti)\s*[,.!]?\s*(.*)$/iu;

function isSignatureName(line: string, afterSignOff: boolean): boolean {
  if (SCRIPT_NAME_LINE.test(line)) return true;
  if (NAME_LINE.test(line)) return looksLikeName(line) || afterSignOff;
  return afterSignOff && LOWER_NAME_LINE.test(line) && !isOrdinaryWord(line.split(/\s+/)[0]);
}

function redactSignature(r: Redactor): void {
  const lines = r.text.split("\n");
  const lastIndexes = lines.map((line, i) => (line.trim() ? i : -1)).filter((i) => i >= 0).slice(-3);
  for (const [position, index] of lastIndexes.entries()) {
    const line = lines[index].trim();
    const signOff = SIGN_OFF.exec(line);
    if (signOff) {
      const rest = signOff[1].trim();
      if (rest && rest !== HIDDEN && isSignatureName(rest, true)) {
        lines[index] = lines[index].replace(rest, HIDDEN);
        r.report.names += 1;
      }
      for (const after of lastIndexes.slice(position + 1)) {
        const candidate = lines[after].trim();
        if (candidate !== HIDDEN && isSignatureName(candidate, true)) {
          lines[after] = HIDDEN;
          r.report.names += 1;
        }
      }
      break;
    }
    const dashed = new RegExp(`^[-–—~]\\s*((?:\\p{Lu}[\\p{L}'’-]*|\\p{Lu}\\.)(?:\\s+(?:\\p{Lu}[\\p{L}'’-]*|\\p{Lu}\\.)){0,2}|${NON_LATIN_NAME})\\s*$`, "u").exec(line);
    if (dashed && index === lastIndexes[lastIndexes.length - 1]) {
      lines[index] = lines[index].replace(dashed[1], HIDDEN);
      r.report.names += 1;
    }
  }
  r.text = lines.join("\n");
}
