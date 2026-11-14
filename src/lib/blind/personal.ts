import { NATIONALITIES } from "./lexicon";
import { alternation, L, R, type Redactor } from "./redactor";

const TENS = "twenty|thirty|forty|fifty|sixty|seventy";
const UNITS = "one|two|three|four|five|six|seven|eight|nine";
const AGE_WORDS = `(?:(?:${TENS})(?:[- ](?:${UNITS}))?|eighteen|nineteen)`;
const COUNT = "(?:a|an|one|two|three|four|five|six|\\d{1,6})";

/** Nationalities in any case, except words that are also ordinary verbs ("polish the copy"). */
const ANY_CASE_NATIONALITIES = alternation(NATIONALITIES.filter((n) => n !== "Polish"));
const LANGUAGES = alternation([
  ...NATIONALITIES, "English", "Arabic", "Farsi", "Dari", "Pashto", "Urdu", "Hindi", "Mandarin", "Cantonese",
  "Swahili", "Amharic", "Tigrinya", "Hebrew", "Somali", "Kurdish", "Russian", "suomi", "ruotsi", "englanti",
]);

function redactAge(r: Redactor): void {
  r.replace(/\b\d{2}\s{0,5}(?:-|\s)?(?:years?|yrs?)(?:-|\s)old\b|\b\d{2}\s{0,5}(?:yo|y\/o|y\.o\.)(?![\p{L}])|\b\d{2}[- ]?vuotia\p{L}{0,40}|\b\d{2}[- ]?åri\p{L}{0,40}|\b\d{2}\s{1,5}(?:år gammal|jahre alt|años|ans)\b/giu, "other");
  r.replace(new RegExp(`\\b${AGE_WORDS}[- ]?(?:years?|yrs?)[- ]old\\b`, "gi"), "other");
  r.replace(/\b(?:aged?|age:|ikä:?|ålder:?)\s{0,5}\d{2}\b/giu, "other");
  r.replace(/\b(?:born(?: in)?|b\.|syntynyt(?: vuonna)?|född(?: år)?|geboren)\s{0,5}(?:19|20)\d{2}\b/giu, "other");
  r.replace(/\b(?:class of|graduated(?: in)?|valmistuin(?: vuonna)?|vuosikurssi)\s{0,5}(?:19|20)\d{2}\b/giu, "other");
  r.replace(/\b(?:I'm|I am|I’m|olen|jag är|ich bin)\s{1,5}\d{2}\b(?!\s{0,5}(?:%|ms|minutes|hours|days|weeks|percent|years? (?:of|in)|vuotta (?:kokemusta|töissä)))/giu, "other");
  r.replace(/\bin my (?:early |late |mid-?)?(?:twenties|thirties|forties|fifties|sixties|20s|30s|40s|50s|60s)\b/gi, "other");
  r.replace(/\b(?:millennial|gen ?z|boomer|zoomer|digital native)s?\b/gi, "other");
  // "a ten-year-old", "after half a century on this planet".
  r.replace(/\b(?:(?:in|since|from)\s)?(?:19|20)\d{2}\s(?:as|when I was)\s(?:an?\s)?(?:kid|child|teenager|teen|\p{L}{2,12}[- ]years?[- ]old)\b/giu, "other");
  r.replace(/\b(?:a|an)\s(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|\d{1,2})[- ]years?[- ]old\b/gi, "other");
  r.replace(/\b(?:half a century|(?:a\s)?quarter of a century|\d{2}\syears on this planet)(?:\son this planet)?\b/gi, "other");
}

/** A degree with its year gives away an age range: "MSc in 1998", "BSc 2001", "2003 MSc". */
function redactDegreeYears(r: Redactor): void {
  const degree = "(?:msc|bsc|m\\.sc\\.?|b\\.sc\\.?|mba|phd|ma|ba|meng|beng|master'?s|bachelor'?s|degree|diploma|tutkinto|dipl\\.?-ing|di|fm|fk|kandi|ylioppilas\\p{L}{0,40}|graduated|valmistuin|examen)";
  r.replace(new RegExp(`\\b${degree}\\b[^.\\n\\d]{0,30}?\\b((?:19|20)\\d{2})\\b`, "giu"), "other");
  r.replace(new RegExp(`\\b((?:19|20)\\d{2})\\s{0,3}${degree}\\b`, "giu"), "other");
}

/** Residence and visa status, and being the only woman or man in a group. */
function redactStatus(r: Redactor): void {
  r.replace(
    /\b(?:residence permit|work permit|permanent residen(?:ce|t)|visa sponsorship|visa status|(?:my|a|on a|work|student|residence) visa|asylum(?: seeker)?|refugee(?: status)?|oleskelulupa\p{L}{0,40}|oleskeluluva\p{L}{0,40}|työlupa\p{L}{0,40}|työluva\p{L}{0,40}|turvapaika\p{L}{0,40}|pakolai\p{L}{0,40}|uppehållstillstånd\p{L}{0,40}|arbetstillstånd\p{L}{0,40}|asylsökande)\b/giu,
    "other",
  );
  r.replace(
    /\b(?:the\s)?only\s(?:woman|women|man|men|girl|guy|female|male|mother|mom|mum|father|dad|parent|immigrant|foreigner|person of colou?r|black person|non-native speaker)\b(?:\s(?:on|in)\s(?:my|the|our)\s(?:team|class|course|floor|department|group))?|\bone of (?:the )?(?:few|only) (?:women|men|girls|immigrants|foreigners)\b/gi,
    "other",
  );
}

function redactOrigin(r: Redactor): void {
  r.replace(/\bnative\s{1,5}[\p{L}-]{1,40}\s{1,5}speaker\b|\b[\p{L}-]{1,40}\s{1,5}native speaker\b|\bnative speaker of\s{1,5}[\p{L}-]{1,40}/giu, "other");
  r.replace(new RegExp(`\\bnative(?:ly)?\\s{1,5}(?:${LANGUAGES})${R}`, "giu"), "other");
  r.replace(/\b(?:mother tongue|first language|native language|äidinkiel\p{L}{0,40}|modersmål\p{L}{0,40}|muttersprache)\s{0,5}(?:is|on|är|ist|:)?\s{0,5}\p{L}{1,40}/giu, "other");
  r.replace(new RegExp(`${L}(?:${ANY_CASE_NATIONALITIES})(?:-(?:${ANY_CASE_NATIONALITIES}))?${R}`, "giu"), "other");
  r.replace(new RegExp(`${L}Polish${R}`, "gu"), "other");
  r.replace(/\b(?:citizen|national|kansalainen|medborgare) of\s{1,5}\S+|\b(?:citizenship|kansalaisuus)\b/giu, "other");
  r.replace(/\b(?:practi[sc]ing |devout |observant )?(?:muslims?|christians?|jewish|jews?|hindus?|buddhists?|catholics?|lutherans?|orthodox|atheists?|sikhs?|muslimi\p{L}{0,40}|kristitty\p{L}{0,40})\b/giu, "other");
  r.replace(/\b(?:I|we)\s{1,5}pray\w{0,30}\b[^.\n]*|\b(?:mosque|synagogue|ramadan|hijab|halal|kosher)\b/giu, "other");
  r.replace(/\b(?:military service|national service|armed forces|asevelvollisuu\p{L}{0,40}|varusmie\p{L}{0,40}|intti\p{L}{0,40}|siviilipalvelu\p{L}{0,40}|värnplikt\p{L}{0,40})\b/giu, "other");
}

function redactHealth(r: Redactor): void {
  r.replace(/\b(?:I'm|I am|I’m|as a|being)\s{1,5}(?:deaf|blind|disabled|autistic|dyslexic|diabetic|epileptic|hard of hearing|partially sighted|visually impaired|neurodivergent|a wheelchair user|in a wheelchair)\b/giu, "other");
  r.replace(/\b(?:my|have|having|with|diagnosed with)\s{1,5}(?:adhd|autism|dyslexia|diabetes|epilepsy|depression|anxiety|a disability|disabilities|chronic \p{L}{1,40}|cancer|ptsd)\b/giu, "other");
  r.replace(/\b(?:wheelchair|deaf|neurodivergent|disabilit\p{L}{0,40}|kuuro|pyörätuoli\p{L}{0,40}|vammai\p{L}{0,40})\b/giu, "other");
}

function redactFamilyAndGender(r: Redactor): void {
  r.replace(/\b(?:as an?|being an?|I am an?|I'm an?|I’m an?)\s{1,5}(?:single\s{1,5}|young\s{1,5}|working\s{1,5})?(?:mother|father|mom|mum|dad|parent|wife|husband|woman|man|female|male|girl|guy|immigrant|refugee)\b(?:\s{1,5}of\s{1,5}(?:one|two|three|four|five|\d{1,6})(?:\s{1,5}(?:kids|children|boys|girls))?)?/gi, "other");
  r.replace(/\b(?:mother|father|mom|mum|dad|parent)\s{1,5}of\s{1,5}(?:one|two|three|four|five|\d{1,6})(?:\s{1,5}(?:kids|children|boys|girls))?\b/gi, "other");
  r.replace(new RegExp(`\\b(?:have|has|had|with|raising)\\s{1,5}${COUNT}\\s{1,5}(?:kids?|children|child|sons?|daughters?|bab(?:y|ies)|grandchildren)\\b`, "gi"), "other");
  r.replace(/\bmy\s{1,5}(?:husband|wife|spouse|partner|kids|children|son|daughter|boyfriend|girlfriend|baby|family)(?:['’]s)?\b/gi, "other");
  r.replace(/\b(?:a\s{1,5}(?:husband|wife|boyfriend|girlfriend)|our\s{1,5}(?:kids|children|son|daughter|baby))\b/gi, "other");
  r.replace(/\b(?:I'm|I am|I’m|we are|we're)\s{1,5}(?:married|divorced|widowed|engaged|pregnant|expecting)\b/gi, "other");
  r.replace(/\bsingle (?:mom|mum|mother|dad|father|parent)\b/gi, "other");
  r.replace(/\b(?:pregnant|maternity leave|paternity leave|parental leave|raskaana|äitiyslomal\p{L}{0,40}|vanhempainvapaal\p{L}{0,40}|föräldraledig\p{L}{0,40})\b/giu, "other");
  r.replace(/\b(?:mieheni|vaimoni|puolisoni|lapseni|lapsiani|min man|min fru|mina barn|mein mann|meine frau|mi esposo|mi esposa)\b/giu, "other");
  r.replace(/\b(?:as a|being a|I am a|I'm a)\s{1,5}(?:woman|man|female|male|trans\p{L}{0,40}|non-binary|nonbinary)\b(?:\s{1,5}in\s{1,5}\p{L}{1,40})?|\b(?:women|woman|man|men) in tech\b/giu, "other");
  r.replace(/\(?\b(?:she|he|they)\/(?:her|him|them)(?:\/(?:hers|his|theirs))?\b\)?/gi, "other");
}

/** Personal details that say who someone is rather than what they did: age, origin, belief, health, family. */
export function redactPersonal(r: Redactor): void {
  redactAge(r);
  redactDegreeYears(r);
  redactStatus(r);
  redactOrigin(r);
  redactHealth(r);
  redactFamilyAndGender(r);
}
