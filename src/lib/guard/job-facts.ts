import { protectedNames } from "./protected";

/**
 * Facts about the job, not wishes about the person: the language the work is done in, a language level
 * the work needs, and licences or permits the law asks for. They are never core skills and never set aside.
 * Each fact is returned in one fixed neutral form, so the company's own words are never repeated to talent.
 */

type Language = "Finnish" | "Swedish" | "English";

const LANGUAGE: Record<string, Language> = {
  finnish: "Finnish", swedish: "Swedish", english: "English",
  suomi: "Finnish", suomea: "Finnish", suomen: "Finnish", ruotsi: "Swedish", ruotsia: "Swedish", ruotsin: "Swedish",
  englanti: "English", englantia: "English", englannin: "English",
  finska: "Finnish", svenska: "Swedish", engelska: "English",
};

const EN = "finnish|swedish|english";
const FI = "suomi|suomea|suomen|ruotsi|ruotsia|ruotsin|englanti|englantia|englannin";
const SV = "finska|svenska|engelska";
const ANY = `${EN}|${FI}|${SV}`;
const L = "(?<![\\p{L}\\p{N}])";
const R = "(?![\\p{L}\\p{N}])";

type Level = "Fluent" | "Good" | "Basic";

const LEVEL: Record<string, Level> = {
  fluent: "Fluent", strong: "Fluent", excellent: "Fluent", sujuva: "Fluent", sujuvaa: "Fluent", flytande: "Fluent",
  good: "Good", working: "Good", hyvä: "Good", hyvää: "Good", god: "Good", goda: "Good",
  basic: "Basic", perus: "Basic", grundläggande: "Basic",
};
const LEVEL_WORDS = Object.keys(LEVEL).join("|");

/** CEFR levels, read as a level word so "C1" itself is never shown. */
function cefrLevel(code: string): Level {
  return code.startsWith("C") ? "Fluent" : code.startsWith("B") ? "Good" : "Basic";
}

const pattern = (source: string) => new RegExp(`${L}(?:${source})${R}`, "giu");

const NOT_REQUIRED = [
  pattern(`(?:no|without)\\s{1,5}(${EN})\\s{1,5}(?:needed|required)`),
  pattern(`(${EN})\\s{1,5}(?:is\\s{1,5})?(?:not|isn't|is not)\\s{1,5}(?:needed|required|necessary|a must)`),
  pattern(`(${FI})(?:\\s{1,5}kiel(?:tä|i|en taitoa))?\\s{1,5}ei\\s{1,5}(?:vaadita|tarvita|edellytetä)`),
  pattern(`ei\\s{1,5}(?:vaadita|tarvita|edellytetä)\\s{1,5}(${FI})`),
  pattern(`(${SV})\\s{1,5}(?:krävs|behövs)\\s{1,5}inte`),
];

const WORK_LANGUAGE = [
  pattern(`(?:work(?:ing)?\\s{1,5}language|language\\s{1,5}of\\s{1,5}work)(?:\\s{1,5}is|\\s{0,5}:)?\\s{1,5}(${EN})`),
  pattern(`works?\\s{1,5}in\\s{1,5}(${EN})`),
  pattern(`työkiel\\p{L}{0,6}(?:\\s{1,5}on)?\\s{1,5}(${FI})`),
  pattern(`arbetsspråk\\p{L}{0,6}(?:\\s{1,5}är)?\\s{1,5}(${SV})`),
];

const LEVEL_NEEDED = [
  pattern(`(${LEVEL_WORDS})\\s{1,5}(${ANY})`),
  pattern(`(${ANY})(?:\\s{1,5}(?:language|kielen?|språk))?\\s{1,5}(?:at\\s{1,5}|level\\s{1,5}|taso\\s{1,5})?(?:level\\s{1,5})?([ABC][12])`),
];

const PLAIN_NEEDED = [
  pattern(`(${EN})(?:\\s{1,5}(?:language|skills))?\\s{1,5}(?:is\\s{1,5})?(?:needed|required|a must)`),
  pattern(`speaks?\\s{1,5}(${EN})`),
  // A wish that is only a language: "Finnish", "English skills".
  pattern(`^(${EN})(?:\\s{1,5}language)?(?:\\s{1,5}skills)?$`),
  pattern(`(${FI})n?\\s{1,5}kielen\\s{1,5}taito`),
];

/** Licences and permits, each with its one fixed form. */
const LICENCES: { pattern: RegExp; fact: string }[] = [
  {
    pattern: pattern(
      "(?:registered\\s{1,5})?nurs(?:e|ing|e's)\\s{1,5}(?:licen[cs]e|registration)|sairaanhoitajan\\s{1,5}(?:laillistus|ammattioikeus|pätevyys)|laillistettu\\s{1,5}sairaanhoitaja|sjuksköterskelegitimation|legitimerad\\s{1,5}sjuksköterska",
    ),
    fact: "Nurse licence needed",
  },
  {
    pattern: pattern("practical\\s{1,5}nurse\\s{1,5}(?:licen[cs]e|qualification)|lähihoitajan\\s{1,5}(?:ammattioikeus|nimike)|nimikesuojattu\\s{1,5}lähihoitaja"),
    fact: "Practical nurse licence needed",
  },
  { pattern: pattern("hygiene\\s{1,5}passport|hygieniapassi\\p{L}{0,4}|hygienpass\\p{L}{0,4}"), fact: "Hygiene passport needed" },
  { pattern: pattern("first[- ]aid\\s{1,5}(?:certificate|card|training)|ensiapu(?:kortti|koulutus)\\p{L}{0,4}"), fact: "First aid certificate needed" },
  { pattern: pattern("occupational\\s{1,5}safety\\s{1,5}card|työturvallisuuskortti\\p{L}{0,4}"), fact: "Occupational safety card needed" },
  { pattern: pattern("forklift\\s{1,5}(?:licen[cs]e|card)|trukkikortti\\p{L}{0,4}|truckkort\\p{L}{0,4}"), fact: "Forklift licence needed" },
  {
    pattern: pattern("work\\s{1,5}permits?|right\\s{1,5}to\\s{1,5}work|työlup\\p{L}{0,4}|työluva\\p{L}{0,4}|arbetstillstånd\\p{L}{0,4}"),
    fact: "Right to work in Finland needed",
  },
];

/** "driving licence B", "B-ajokortti", "körkort B". The class is read only in capitals, so "a must" is no class. */
const DRIVING = pattern(
  "(?:driving|driver'?s)\\s{1,5}licen[cs]e(?:\\s{1,5}(?:class\\s{1,5})?([A-E]{1,2}))?|([A-E]{1,2})[- ]ajokortti|ajokortti(?:\\s{1,5}([A-E]{1,2}))?|körkort(?:\\s{1,5}([A-E]{1,2}))?",
);

function drivingFacts(text: string): string[] {
  return [...text.matchAll(DRIVING)].map((m) => {
    const cls = [m[1], m[2], m[3], m[4]].find((c) => c !== undefined && /^[A-E]{1,2}$/.test(c));
    return cls ? `Driving licence ${cls} needed` : "Driving licence needed";
  });
}

const languageOf = (word: string): Language | undefined => LANGUAGE[word.toLowerCase()];

function languageFacts(text: string): string[] {
  const facts: string[] = [];
  const notRequired = new Set<Language>();
  for (const re of NOT_REQUIRED) {
    for (const m of text.matchAll(re)) {
      const language = languageOf(m[1]);
      if (language) notRequired.add(language);
    }
  }
  facts.push(...[...notRequired].map((language) => `${language} not required`));
  for (const re of WORK_LANGUAGE) {
    for (const m of text.matchAll(re)) {
      const language = languageOf(m[1]);
      if (language) facts.push(`Work language: ${language}`);
    }
  }
  const leveled = new Set<Language>();
  for (const m of text.matchAll(LEVEL_NEEDED[0])) {
    const language = languageOf(m[2]);
    const level = LEVEL[m[1].toLowerCase()];
    if (language && level && !notRequired.has(language)) {
      leveled.add(language);
      facts.push(`${level} ${language} needed`);
    }
  }
  for (const m of text.matchAll(LEVEL_NEEDED[1])) {
    const language = languageOf(m[1]);
    if (language && !leveled.has(language) && !notRequired.has(language)) {
      leveled.add(language);
      facts.push(`${cefrLevel(m[2].toUpperCase())} ${language} needed`);
    }
  }
  for (const re of PLAIN_NEEDED) {
    for (const m of text.matchAll(re)) {
      const language = languageOf(m[1]);
      if (language && !leveled.has(language) && !notRequired.has(language)) facts.push(`${language} needed`);
    }
  }
  return facts;
}

/** Every fixed form a fact can take. Anything else is never published as a requirement. */
const FIXED_FORM = new RegExp(
  [
    "^(?:Finnish|Swedish|English) (?:not required|needed)$",
    "^(?:Fluent|Good|Basic) (?:Finnish|Swedish|English) needed$",
    "^Work language: (?:Finnish|Swedish|English)$",
    "^Driving licence(?: [A-E]{1,2})? needed$",
    ...LICENCES.map(({ fact }) => `^${fact}$`),
  ].join("|"),
);

/** True for a line in one of the fixed fact forms. */
export function isJobFact(line: string): boolean {
  return FIXED_FORM.test(line);
}

/**
 * The job facts a text states, in fixed forms, without repeats. A native-speaker wish is never a fact:
 * it describes origin, and the lawful version is a language level.
 */
export function jobFacts(text: string): string[] {
  if (protectedNames(text).includes("native language")) return [];
  const licences = LICENCES.filter(({ pattern: re }) => text.search(re) >= 0).map(({ fact }) => fact);
  return [...new Set([...languageFacts(text), ...licences, ...drivingFacts(text)])];
}

/** The text with every fact phrase blanked out, so a licence or permit is not mistaken for a wish about the person. */
export function withoutJobFacts(text: string): string {
  const all = [...NOT_REQUIRED, ...WORK_LANGUAGE, ...LEVEL_NEEDED, ...PLAIN_NEEDED, ...LICENCES.map(({ pattern: re }) => re), DRIVING];
  return all.reduce((rest, re) => rest.replace(re, " "), text);
}
