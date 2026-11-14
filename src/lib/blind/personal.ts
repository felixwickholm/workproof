import { NATIONALITIES } from "./lexicon";
import { alternation, L, R, type Redactor } from "./redactor";

const TENS = "twenty|thirty|forty|fifty|sixty|seventy";
const UNITS = "one|two|three|four|five|six|seven|eight|nine";
const AGE_WORDS = `(?:(?:${TENS})(?:[- ](?:${UNITS}))?|eighteen|nineteen)`;
const COUNT = "(?:a|an|one|two|three|four|five|six|\\d+)";

/** Nationalities in any case, except words that are also ordinary verbs ("polish the copy"). */
const ANY_CASE_NATIONALITIES = alternation(NATIONALITIES.filter((n) => n !== "Polish"));
const LANGUAGES = alternation([
  ...NATIONALITIES, "English", "Arabic", "Farsi", "Dari", "Pashto", "Urdu", "Hindi", "Mandarin", "Cantonese",
  "Swahili", "Amharic", "Tigrinya", "Hebrew", "Somali", "Kurdish", "Russian", "suomi", "ruotsi", "englanti",
]);

function redactAge(r: Redactor): void {
  r.replace(/\b\d{2}\s*(?:-|\s)?(?:years?|yrs?)(?:-|\s)old\b|\b\d{2}\s*(?:yo|y\/o|y\.o\.)(?![\p{L}])|\b\d{2}[- ]?vuotia\p{L}*|\b\d{2}[- ]?åri\p{L}*|\b\d{2}\s+(?:år gammal|jahre alt|años|ans)\b/giu, "other");
  r.replace(new RegExp(`\\b${AGE_WORDS}[- ]?(?:years?|yrs?)[- ]old\\b`, "gi"), "other");
  r.replace(/\b(?:aged?|age:|ikä:?|ålder:?)\s*\d{2}\b/giu, "other");
  r.replace(/\b(?:born(?: in)?|b\.|syntynyt(?: vuonna)?|född(?: år)?|geboren)\s*(?:19|20)\d{2}\b/giu, "other");
  r.replace(/\b(?:class of|graduated(?: in)?|valmistuin(?: vuonna)?|vuosikurssi)\s*(?:19|20)\d{2}\b/giu, "other");
  r.replace(/\b(?:I'm|I am|I’m|olen|jag är|ich bin)\s+\d{2}\b(?!\s*(?:%|ms|minutes|hours|days|weeks|percent|years? (?:of|in)|vuotta (?:kokemusta|töissä)))/giu, "other");
  r.replace(/\bin my (?:early |late |mid-?)?(?:twenties|thirties|forties|fifties|sixties|20s|30s|40s|50s|60s)\b/gi, "other");
  r.replace(/\b(?:millennial|gen ?z|boomer|zoomer|digital native)s?\b/gi, "other");
}

function redactOrigin(r: Redactor): void {
  r.replace(/\bnative\s+[\p{L}-]+\s+speaker\b|\b[\p{L}-]+\s+native speaker\b|\bnative speaker of\s+[\p{L}-]+/giu, "other");
  r.replace(new RegExp(`\\bnative(?:ly)?\\s+(?:${LANGUAGES})${R}`, "giu"), "other");
  r.replace(/\b(?:mother tongue|first language|native language|äidinkiel\p{L}*|modersmål\p{L}*|muttersprache)\s*(?:is|on|är|ist|:)?\s*\p{L}+/giu, "other");
  r.replace(new RegExp(`${L}(?:${ANY_CASE_NATIONALITIES})(?:-(?:${ANY_CASE_NATIONALITIES}))?${R}`, "giu"), "other");
  r.replace(new RegExp(`${L}Polish${R}`, "gu"), "other");
  r.replace(/\b(?:citizen|national|kansalainen|medborgare) of\s+\S+|\b(?:citizenship|kansalaisuus)\b/giu, "other");
  r.replace(/\b(?:practi[sc]ing |devout |observant )?(?:muslims?|christians?|jewish|jews?|hindus?|buddhists?|catholics?|lutherans?|orthodox|atheists?|sikhs?|muslimi\p{L}*|kristitty\p{L}*)\b/giu, "other");
  r.replace(/\b(?:I|we)\s+pray\w*\b[^.\n]*|\b(?:mosque|synagogue|ramadan|hijab|halal|kosher)\b/giu, "other");
  r.replace(/\b(?:military service|national service|armed forces|asevelvollisuu\p{L}*|varusmie\p{L}*|intti\p{L}*|siviilipalvelu\p{L}*|värnplikt\p{L}*)\b/giu, "other");
}

function redactHealth(r: Redactor): void {
  r.replace(/\b(?:I'm|I am|I’m|as a|being)\s+(?:deaf|blind|disabled|autistic|dyslexic|diabetic|epileptic|hard of hearing|partially sighted|visually impaired|neurodivergent|a wheelchair user|in a wheelchair)\b/giu, "other");
  r.replace(/\b(?:my|have|having|with|diagnosed with)\s+(?:adhd|autism|dyslexia|diabetes|epilepsy|depression|anxiety|a disability|disabilities|chronic \p{L}+|cancer|ptsd)\b/giu, "other");
  r.replace(/\b(?:wheelchair|deaf|neurodivergent|disabilit\p{L}*|kuuro|pyörätuoli\p{L}*|vammai\p{L}*)\b/giu, "other");
}

function redactFamilyAndGender(r: Redactor): void {
  r.replace(/\b(?:as an?|being an?|I am an?|I'm an?|I’m an?)\s+(?:single\s+|young\s+|working\s+)?(?:mother|father|mom|mum|dad|parent|wife|husband|woman|man|female|male|girl|guy|immigrant|refugee)\b(?:\s+of\s+(?:one|two|three|four|five|\d+)(?:\s+(?:kids|children|boys|girls))?)?/gi, "other");
  r.replace(/\b(?:mother|father|mom|mum|dad|parent)\s+of\s+(?:one|two|three|four|five|\d+)(?:\s+(?:kids|children|boys|girls))?\b/gi, "other");
  r.replace(new RegExp(`\\b(?:have|has|had|with|raising)\\s+${COUNT}\\s+(?:kids?|children|child|sons?|daughters?|bab(?:y|ies)|grandchildren)\\b`, "gi"), "other");
  r.replace(/\bmy\s+(?:husband|wife|spouse|partner|kids|children|son|daughter|boyfriend|girlfriend|baby|family)(?:['’]s)?\b/gi, "other");
  r.replace(/\b(?:a\s+(?:husband|wife|boyfriend|girlfriend)|our\s+(?:kids|children|son|daughter|baby))\b/gi, "other");
  r.replace(/\b(?:I'm|I am|I’m|we are|we're)\s+(?:married|divorced|widowed|engaged|pregnant|expecting)\b/gi, "other");
  r.replace(/\bsingle (?:mom|mum|mother|dad|father|parent)\b/gi, "other");
  r.replace(/\b(?:pregnant|maternity leave|paternity leave|parental leave|raskaana|äitiyslomal\p{L}*|vanhempainvapaal\p{L}*|föräldraledig\p{L}*)\b/giu, "other");
  r.replace(/\b(?:mieheni|vaimoni|puolisoni|lapseni|lapsiani|min man|min fru|mina barn|mein mann|meine frau|mi esposo|mi esposa)\b/giu, "other");
  r.replace(/\b(?:as a|being a|I am a|I'm a)\s+(?:woman|man|female|male|trans\p{L}*|non-binary|nonbinary)\b(?:\s+in\s+\p{L}+)?|\b(?:women|woman|man|men) in tech\b/giu, "other");
  r.replace(/\(?\b(?:she|he|they)\/(?:her|him|them)(?:\/(?:hers|his|theirs))?\b\)?/gi, "other");
}

/** Personal details that say who someone is rather than what they did: age, origin, belief, health, family. */
export function redactPersonal(r: Redactor): void {
  redactAge(r);
  redactOrigin(r);
  redactHealth(r);
  redactFamilyAndGender(r);
}
