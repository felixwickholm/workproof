import { COMMON_WORDS, NAMES_LIKE_WORDS, NOT_NAMES } from "./lexicon";
import { unicodeWords } from "@/lib/util/regex";
import { accentFree, caseless, escape, HIDDEN, inProse, L, R, type Redactor } from "./redactor";

/** Letters of scripts other than Latin: a name written in Chinese, Arabic or Cyrillic. */
const NON_LATIN = "[^\\p{Script=Latin}\\p{N}\\p{P}\\p{S}\\s]{1,30}";
const NON_LATIN_NAME = `${NON_LATIN}(?:[ \\t]+${NON_LATIN}){0,2}`;

/** "My name is", "call me" and the like. What follows is a name in any case. */
const SURE_INTROS = [
  "my name is", "my name's", "name's", "call me", "they call me", "i go by",
  "minun nimeni on", "nimeni on", "mun nimi on", "olen nimeltäni",
  "jag heter", "mitt namn är", "ich heiße", "ich heisse", "mein name ist", "me llamo", "mi nombre es",
  "je m'appelle", "je m’appelle", "mon nom est", "mi chiamo", "meu nome é",
].join("|").replace(/ /g, "\\s{1,5}");

/** "I am", "this is" and the like. A name only when it is capitalised and not an ordinary word. */
const MAYBE_INTROS = caseless("I am|I'm|I’m|this is|it's|it’s|here is|olen|tässä|jag är|det här är|ich bin|hier ist|soy|je suis|sono");

/** Intros in other scripts, followed by a name in the same script. */
const SCRIPT_INTROS = "我叫|我的名字是|我是|私は|わたしは|僕は|اسمي|أنا|انا|меня зовут|моё имя|мое имя|я\\s|제 이름은|저는";

/** Lines that credit an author, as in code headers: "# author: ...", "// written by ...", "Copyright (c) 2024 ...". */
const AUTHOR_LINE =
  /((?:作者|著者|署名|المؤلف|كتبه|مع تحياتي|تحياتي|автор|с уважением|\bauthors?|\bwritten by|\bcreated by|\bmaintained by|\bmaintainers?|\bcontributors?|\bsigned|\btekijä|\bkirjoittanut|\bförfattare|\bskriven av|\bcopyright(?:\s{0,5}(?:\(c\)|©))?(?:\s{0,5}\d{4}(?:\s{0,5}[-–]\s{0,5}\d{4})?)?|©(?:\s{0,5}\d{4})?)\s{0,5}[:：,،-]?\s{0,5})([^\n]+)/giu;

const NOT_AN_AUTHOR = /^(?:an?|the|ai|chatgpt|claude|copilot|gpt|an ai|hand|me|us|someone|the team|our team|reserved|all rights)\b/i;

function isOrdinaryWord(word: string): boolean {
  if (NAMES_LIKE_WORDS.has(word)) return false;
  const lower = word.toLowerCase();
  return COMMON_WORDS.has(lower) || NOT_NAMES.has(word) || /(?:ing|ed|ly|ive|ous|ful|able|ible)$/.test(lower);
}

/** A capitalised name, not an ordinary word, not technical ("GroupShuffleSplit", "Q3"). */
function looksLikeName(candidate: string): boolean {
  const first = candidate.trim().split(/\s{1,5}/)[0] ?? "";
  if (!first || isOrdinaryWord(first)) return false;
  if (/\p{Lu}.*\p{Lu}/u.test(first.slice(1)) || /\p{N}/u.test(first)) return false;
  return true;
}

/** One capitalised name word, hyphenated or with an apostrophe: "Mikko", "Al-Sayed", "O'Neill". */
const NAME_WORD = "\\p{Lu}\\p{Ll}{1,30}(?:[-'’]\\p{Lu}?\\p{Ll}{1,30}){0,2}";
/** One to three name words on one line. */
const NAME_WORDS = `${NAME_WORD}(?:[ \\t]{1,5}${NAME_WORD}){0,2}`;

/** Where "<name> here" introduces the writer: the start of a sentence, or after a greeting such as "hey" or "its". */
const BEFORE_HERE = `(?:^|(?<=[.!?]\\s{1,5})|(?<=(?:^|[\\s,.!?])(?:${caseless("hi|hey|hello|moi|hei|terve|its|it's|it’s|this is")})[,!]?\\s{1,5}))`;

/** Phone spellings of "I'm": "im", "i m", "iam", and the spoken Finnish "oon" / "mä oon". */
const CASUAL_INTROS = caseless("im|i m|iam|mä oon|ma oon|oon");

/** "name: Mikko", "nimi: Mikko" in prose. The name must end there, so "name: retry_count" is never a name. */
const NAME_FIELD = new RegExp(`(?:^|(?<=[\\s,;(]))(?:${caseless("full name|name|nimi|namn")})\\s{0,3}[:=]\\s{0,3}(${NAME_WORDS})(?![\\p{L}\\p{N}_.(])`, "gmu");

/** A sign-off at the very end of the answer, on the same line as the text: "... hang. /Mikko", "br Mikko", "t. Mikko". */
const INLINE_SIGN_OFF = new RegExp(
  `(?:^|(?<=[\\s.!?,;]))(?:[-–—~/]\\s{0,3}|(?:${caseless("br|t\\.|terveisin|terkuin|mvh|regards|cheers|thanks|kiitos")})[,.!:]?\\s{1,3})(${NAME_WORDS})\\s{0,3}[.!]?\\s{0,5}$`,
  "u",
);

/** "im Mikko", "oon Mikko", and in lowercase only right before "from": "im mikko from lahti". */
function redactCasualIntros(r: Redactor): void {
  const start = "(?<![\\p{L}\\p{N}_'’])";
  r.replace(new RegExp(`${start}(?:${CASUAL_INTROS})\\s{1,5}(${NAME_WORDS})`, "gu"), "names", looksLikeName);
  r.replace(
    new RegExp(`${start}(?:${CASUAL_INTROS}|${MAYBE_INTROS})\\s{1,5}(\\p{Ll}[\\p{L}'’-]{1,30})(?=\\s{1,5}(?:from|kotoisin)(?![\\p{L}]))`, "gu"),
    "names",
    (word) => !isOrdinaryWord(word),
  );
}

/** "Ahmed Al-Sayed, 34, ..." at the start of a line: a name followed by a bare age gives both away. */
const NAME_WITH_AGE = new RegExp(
  `(?:^|(?<=[.!?]\\s{1,5}))(${NAME_WORDS})(?:\\s{1,5}here)?\\s{0,3},\\s{0,3}(\\d{2})(?=\\s{0,3}(?:[,;)]|\\.(?!\\d)|$|(?:y\\/o|yo|v\\.|years? old)(?![\\p{L}]))|\\s{1,5}(?:from|and|ja|och)(?![\\p{L}]))`,
  "gmu",
);

function redactNameWithAge(r: Redactor): void {
  r.text = r.text.replace(NAME_WITH_AGE, (whole, name: string, age: string) => {
    if (!looksLikeName(name)) return whole;
    r.report.names += 1;
    r.report.other += 1;
    return whole.replace(name, HIDDEN).replace(new RegExp(`(?<!\\d)${age}(?!\\d)`), HIDDEN);
  });
}

const IDENTIFIER = /[\p{L}\p{N}_](?:[\p{L}\p{N}_.-]{0,200}[\p{L}\p{N}_])?/gu;
const SEGMENT_EDGE = /[_.\-\p{N}]/u;

function plain(text: string): string {
  return [...text].map((c) => c.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()).join("");
}

/** True where a name part starts or ends a segment of an identifier: at an edge, "_", ".", "-", a digit or a camelCase step. */
function segmentEdge(token: string, at: number, side: "start" | "end"): boolean {
  if (at <= 0 || at >= token.length) return true;
  const before = token[at - 1];
  const after = token[at];
  if (SEGMENT_EDGE.test(side === "start" ? before : after)) return true;
  return /\p{Ll}/u.test(before) && /\p{Lu}/u.test(after);
}

/**
 * Identifiers, file names and handles that carry the author's name: "sanna_virtanen_split",
 * "sannaVirtanenSplit", "SANNA_VIRTANEN_KEY", "virtanen_results.csv". The whole identifier is hidden.
 * A lowercase word on its own ("price", "virtanen") is left alone: it may be an ordinary word.
 */
function redactNameInIdentifiers(r: Redactor, forms: string[]): void {
  // A part that is also an ordinary word ("mark", "price") counts only as part of the full name.
  const wanted = [...new Set(forms.map(plain).filter((form) => form.length >= 3 && !COMMON_WORDS.has(form)))];
  if (wanted.length === 0) return;
  r.replace(IDENTIFIER, "names", (token) => {
    const flat = plain(token);
    if (flat.length !== token.length || wanted.includes(token)) return false;
    return wanted.some((form) => {
      for (let at = flat.indexOf(form); at >= 0; at = flat.indexOf(form, at + 1)) {
        if (segmentEdge(token, at, "start") && segmentEdge(token, at + form.length, "end")) return true;
      }
      return false;
    });
  });
}

const LOOKALIKE: Record<string, string> = { a: "a4@", e: "e3", i: "i1!", o: "o0", s: "s5$", t: "t7", l: "l1", g: "g9", b: "b8" };

/** "S a n n a" and "S4nn4": the letters of a name part, spaced out or with digits for letters. */
function looseName(part: string): string {
  return [...plain(part)]
    .map((c) => `[${escape(LOOKALIKE[c] ?? c)}${escape(c.toUpperCase())}]`)
    .join("[ .·]?");
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
    r.replace(new RegExp(`${L}(?:${forms.join("|")})[\\p{N}_-]{0,40}${R}`, "giu"), "names");
    // Initials: "L. Haddad", "Leila H.", "LH".
    r.replace(new RegExp(`${L}${accentFree(first[0].toUpperCase())}\\.\\s{0,5}${accentFree(last)}${R}`, "gu"), "names");
    r.replace(new RegExp(`${L}${accentFree(first)}\\s{1,5}${accentFree(last[0].toUpperCase())}\\.?${R}`, "gu"), "names");
    const initials = parts.map((p) => p[0].toUpperCase()).join("");
    r.replace(new RegExp(`${L}${initials}${R}`, "gu"), "names");
  }

  const loose = parts.filter((p) => p.length >= 4 && !COMMON_WORDS.has(p.toLowerCase())).map(looseName);
  // Only spaced or digit forms here; the plain word is handled by the rules below.
  if (loose.length > 0) r.replace(new RegExp(`${L}(?:${loose.join("|")})${R}`, "gu"), "names", (m) => /[ .·\d@$!]/.test(m));

  const handles =
    parts.length > 1
      ? [`${first}${last}`, `${first}_${last}`, `${first}.${last}`, `${first}-${last}`, `${first[0]}${last}`, `${first}${last[0]}`]
      : [];
  redactNameInIdentifiers(r, [...parts, ...handles]);

  for (const part of parts) {
    const capitalised = part[0].toUpperCase() + part.slice(1);
    const pattern = accentFree(capitalised);
    // A part that is also a common word ("Will", "May", "Mark") is hidden only mid-sentence,
    // where a capital letter marks a name. Lowercase words are never touched.
    const where = COMMON_WORDS.has(part.toLowerCase()) ? "(?<=[\\p{L}\\p{N},;:)]\\s{1,5})" : L;
    r.replace(new RegExp(`${where}(?:${pattern}|${pattern.toUpperCase()})(?:['’]s)?${R}`, "gu"), "names");
  }
}

/** Removes names: the author's own, self-introductions, author credits and signatures. */
export function redactNames(r: Redactor, name?: string): void {
  if (name?.trim()) redactKnownName(r, name);

  // Sure intros take any case: "my name is sanna virtanen". Stop at the first ordinary word.
  r.replace(
    new RegExp(`(?:${SURE_INTROS})\\s{0,5}[:,-]?\\s{1,5}(\\p{L}[\\p{L}'’-]{0,40}(?:\\s{1,5}\\p{L}[\\p{L}'’-]{0,40}){0,2})`, "giu"),
    "names",
    (candidate) => !isOrdinaryWord(candidate.split(/\s{1,5}/)[0]),
  );
  r.replace(new RegExp(`(?<![\\p{L}])(?:${MAYBE_INTROS})\\s{1,5}(\\p{Lu}[\\p{L}'’-]{1,40}(?:\\s{1,5}\\p{Lu}[\\p{L}'’-]{1,40}){0,2})`, "gu"), "names", looksLikeName);
  r.replace(new RegExp(`(?:${SCRIPT_INTROS})\\s{0,5}(${NON_LATIN_NAME})`, "giu"), "names");
  r.replace(new RegExp(`(?:${SURE_INTROS}|${MAYBE_INTROS})\\s{1,5}(${NON_LATIN_NAME})`, "giu"), "names");

  // "I, Sanna Virtanen, ..." names the writer in apposition.
  r.replace(/\bI,\s{1,5}(\p{Lu}\p{Ll}+(?:\s{1,5}\p{Lu}\p{Ll}+){0,2})(?=\s{0,5}[,(]|\s{1,5}(?:from|of|at)\b)/gu, "names", looksLikeName);

  // "Sanna Virtanen here.", "hey Sanna here," and "its Ahmed Al-Sayed here" at the start of a sentence or after a greeting.
  r.replace(new RegExp(`${BEFORE_HERE}(${NAME_WORDS})\\s{1,5}here\\b(?=\\s{0,5}[.,!:;-]|\\s{0,5}$)`, "gmu"), "names", looksLikeName);

  redactCasualIntros(r);
  redactNameWithAge(r);
  inProse(r, (prose) => prose.replace(NAME_FIELD, "names", looksLikeName));
  r.replace(INLINE_SIGN_OFF, "names", looksLikeName);

  // Author credits in code and documents: hide the rest of the line.
  r.text = r.text.replace(unicodeWords(AUTHOR_LINE), (whole, lead: string, rest: string) => {
    const credit = rest.trim();
    if (!/\p{L}/u.test(credit) || credit === HIDDEN || NOT_AN_AUTHOR.test(credit)) return whole;
    r.report.names += 1;
    const tail = /\s{0,5}(?:\*\/|-->|"""|''')\s{0,5}$/.exec(rest)?.[0] ?? "";
    return `${lead}${HIDDEN}${tail}`;
  });

  redactSignature(r);
  redactNameLines(r);
}

/** A short line at the start or end of the answer that is only a name: 1 to 4 capitalised or non-Latin words. */
const EDGE_NAME_LINE = new RegExp(`^(?:${NON_LATIN}|\\p{Lu}[\\p{L}'’.-]{0,40})(?:[\\s\\p{P}]{1,3}(?:${NON_LATIN}|\\p{Lu}[\\p{L}'’.-]{0,40})){0,3}$`, "u");

function redactNameLines(r: Redactor): void {
  const lines = r.text.split("\n");
  const filled = lines.map((line, i) => (line.trim() ? i : -1)).filter((i) => i >= 0);
  if (filled.length < 2) return;
  for (const index of new Set([filled[0], filled[filled.length - 1]])) {
    const line = lines[index].trim().replace(/^[\p{P}\s]{1,40}|[\p{P}\s]{1,40}$/gu, "");
    if (!line || line.includes(HIDDEN) || !EDGE_NAME_LINE.test(line)) continue;
    const latin = /\p{Script=Latin}/u.test(line);
    if (latin && !looksLikeName(line)) continue;
    if (!latin || line.split(/\s{1,5}/).length >= 2) {
      lines[index] = HIDDEN;
      r.report.names += 1;
    }
  }
  r.text = lines.join("\n");
}

const NAME_LINE = /^(?:\p{Lu}[\p{L}'’.-]{0,40}|\p{Lu}\.)(?:\s{1,5}(?:\p{Lu}[\p{L}'’.-]{0,40}|\p{Lu}\.)){0,3}$/u;
const LOWER_NAME_LINE = /^\p{Ll}[\p{L}'’-]{1,40}(?:\s{1,5}\p{Ll}[\p{L}'’-]{1,40}){0,2}$/u;
const SCRIPT_NAME_LINE = new RegExp(`^${NON_LATIN_NAME}$`, "u");

const SIGN_OFF =
  /^(?:best regards|kind regards|warm regards|all the best|best wishes|best|regards|thanks|thank you|cheers|br|yours|sincerely|ystävällisin terveisin|terveisin|terkuin|t\.|hälsningar|med vänliga hälsningar|mvh|vänliga hälsningar|viele grüße|mit freundlichen grüßen|saludos|cordialement|cordiali saluti)\s{0,5}[,.!]?\s{0,5}(.*)$/iu;

function isSignatureName(line: string, afterSignOff: boolean): boolean {
  if (SCRIPT_NAME_LINE.test(line)) return true;
  if (NAME_LINE.test(line)) return looksLikeName(line) || afterSignOff;
  return afterSignOff && LOWER_NAME_LINE.test(line) && !isOrdinaryWord(line.split(/\s{1,5}/)[0]);
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
    const dashed = new RegExp(`^[-–—~]\\s{0,5}((?:\\p{Lu}[\\p{L}'’-]{0,40}|\\p{Lu}\\.)(?:\\s{1,5}(?:\\p{Lu}[\\p{L}'’-]{0,40}|\\p{Lu}\\.)){0,2}|${NON_LATIN_NAME})\\s{0,5}$`, "u").exec(line);
    if (dashed && index === lastIndexes[lastIndexes.length - 1]) {
      lines[index] = lines[index].replace(dashed[1], HIDDEN);
      r.report.names += 1;
    }
  }
  r.text = lines.join("\n");
}
