import { unicodeWords } from "@/lib/util/regex";
import { protectedScanCopies } from "./normalise";

/**
 * Protected attributes: wishes that describe a person instead of the work. English, Finnish and Swedish.
 * They never become skills and never reach any text a talent or reviewer sees.
 * Each entry maps to a neutral name for the "Not used" note.
 */

/** A case-insensitive pattern with Unicode word edges, so Finnish and Swedish words match whole. */
function words(source: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, "iu");
}

const NUMBER_WORDS =
  "(?:twenty|thirty|forty|fifty|sixty)(?:[- ](?:one|two|three|four|five|six|seven|eight|nine))?|kaksikymmentä|kolmekymmentä|neljäkymmentä|viisikymmentä|tjugo|trettio|fyrtio|femtio";

const PROTECTED: { name: string; pattern: RegExp }[] = [
  {
    name: "age",
    pattern: words(
      [
        "young|younger|youngest|youthful|youth|elderly|mature|aged?|ageing|aging",
        // "under 30" is an age only where no unit follows: "under 30 ms" is a latency.
        `(?:under|over|below|above|alle|yli|över)\\s{1,5}(?:\\d{2}|${NUMBER_WORDS})(?=\\s{0,5}(?:$|[,.;)]|and\\b|or\\b|ja\\b|och\\b|years?\\b|yrs\\b|y\\.?o\\b|vuot\\p{L}{0,40}|år\\b|-?vuotia\\p{L}{0,40}))(?:\\s{0,5}(?:years?|yrs|y\\.?o\\.?|vuotta|vuotias\\p{L}{0,40}|år))?`,
        `(?:max(?:imum)?|min(?:imum)?|at most|at least|enintään|korkeintaan|högst|minst)\\s{1,5}(?:\\d{2}|${NUMBER_WORDS})\\s{0,5}(?:years? old|yrs old|y\\.?o\\.?|-?vuotia\\p{L}{0,40}|år gammal|åriga?)`,
        "\\d{2}\\s{0,5}[-–]\\s{0,5}\\d{2}\\s{0,5}(?:years?|yrs|vuotta|vuotia\\p{L}{0,40}|år|-?åriga?)",
        "\\d{2}\\s{0,5}(?:years? old|yo|y\\.o\\.|-?vuotia\\p{L}{0,40}|-?åriga?)",
        "years old|born (?:in|after|before) (?:19|20)\\d{2}|born in the (?:80s|90s|00s|eighties|nineties)",
        "digital[- ]natives?|millennials?|gen(?:eration)?[- ]?(?:z|y|x|alpha)|zoomers?|boomers?",
        "recent(?:ly)?[- ]grad\\p{L}{0,40}|fresh[- ]grad\\p{L}{0,40}|new[- ]grad\\p{L}{0,40}|graduated recently|just graduated|vastavalmistu\\p{L}{0,40}|nyutexaminerad\\p{L}{0,40}|nyligen utexaminerad\\p{L}{0,40}",
        "energetic|energinen|energis\\p{L}{0,40}|energisk\\p{L}{0,40}|nuorekas|nuor\\p{L}{0,40}|ung|unga|ungdomlig\\p{L}{0,40}|yngre",
        "senior citizens?|retired|retirees?|(?:pre-)?retirement|pensioners?|eläkeläi\\p{L}{0,40}|ikä\\p{L}{0,40}|iältään|ålder\\p{L}{0,40}",
        "date of birth|birth ?(?:date|year|day)|year of birth|dob|syntymä(?:aika|vuosi|päivä)\\p{L}{0,40}|födelse(?:år|datum|dag)\\p{L}{0,40}",
        "(?:\\d{2}|aged?) (?:or|and) (?:younger|older|under|over)|aged? between|fresh (?:mindset|blood|eyes)|young blood",
      ].join("|"),
    ),
  },
  {
    name: "native language",
    pattern: words(
      [
        "(?<!cloud[- ]|react |non[- ]|digital[- ])natives?(?![- ](?:app|apps|mobile|ios|android|code|modules?|integrations?|sdk|build|binar\\p{L}{0,40}|libraries|library|ui|tools?|units?|format|resolution|speed))",
        "mother[- ]tongue|first language|native language|native speakers?|äidinkiel\\p{L}{0,40}|modersmål\\p{L}{0,40}|förstaspråk\\p{L}{0,40}",
        "accent[- ]free|accentless|(?:no|without an?|neutral|native|foreign|strong|heavy|local) accent|aksentiton\\p{L}{0,40}|utan brytning|brytning",
        "[\\p{L}]+-speaking|suomea puhuv\\p{L}{0,40}|ruotsia puhuv\\p{L}{0,40}|svensktalande|finsktalande",
      ].join("|"),
    ),
  },
  {
    name: "nationality or origin",
    pattern: words(
      [
        "nationality|nationalities|citizens?|citizenship|passport holders?|born in|[\\p{L}]+-born|native[- ]born",
        "locals?(?![- ](?:storage|first|development|dev|server|cache|files?|network|models?|data|db|database|copy|copies|draft\\p{L}{0,10}|state|repo\\p{L}{0,10}|config\\p{L}{0,10}|host|variables?|var|environment|machine|setup|branch|government|authorit\\p{L}{0,40}|council|business\\p{L}{0,40}|shops?|stores?|time|queue|clock|path|port|build|test\\p{L}{0,10}))",
        "lives in|living in|lives nearby|from the area|asuu|asuva\\p{L}{0,40}|bor i",
        "born and raised|raised (?:here|locally|in)|grew up (?:here|locally|in)|född (?:i|och uppvuxen)|uppvuxen i|syntynyt (?:ja kasvanut )?\\p{L}{1,40}(?:ssa|ssä)",
        "(?:\\p{L}{1,40} )?passports?(?:[- ]holders?)?(?![.-]?js)|[\\p{L}]+-sounding (?:sur)?names?|(?:sur)?names? that sounds?",
        "ethnic\\p{L}{0,40}|racial|white(?![- ](?:board|paper|label|list|space|box|hat|noise))|caucasian|immigrants?|foreigners?|maahanmuuttaja\\p{L}{0,40}|ulkomaalai\\p{L}{0,40}|invandrare",
        "kansalai\\p{L}{0,40}|kansallisuu\\p{L}{0,40}|suomalai\\p{L}{0,40}|kantasuomalai\\p{L}{0,40}|syntyperäi\\p{L}{0,40}|medborgar\\p{L}{0,40}|svensk medborgare|finländsk\\p{L}{0,40}|nationalitet",
      ].join("|"),
    ),
  },
  {
    name: "gender",
    pattern: words(
      "gender|sex|sukupuol\\p{L}{0,40}|kön|male|female|man(?! pages?)|woman|men|women|guy|guys|girl|girls|boy|boys|lady|ladies|gentleman|gentlemen|he|she|him|his|hers|mies|miehiä|miestä|miehen|nainen|naisia|naista|naisen|tyttö\\p{L}{0,40}|kvinna|kvinnor|kvinnlig|manlig|tjej\\p{L}{0,40}|kill(?:e|ar)",
    ),
  },
  {
    name: "family status",
    pattern: words(
      [
        "no kids|no children|without kids|without children|has kids|has children|childless|family (?:man|woman|person|commitments?|status|plans|situation|obligations|life)|no family",
        "single(?=\\s{0,5}(?:$|[,.;)]|and\\b|or\\b|(?:parent|mother|father|mom|mum|dad)s?\\b))",
        "marital|marriage|siviilisääty\\p{L}{0,40}|civilstånd|(?:plan|plans|planning|intend\\p{L}{0,40}) (?:to have|on having|for) (?:kids|children|a baby|a family|pregnancy)|(?:kids|children|a baby) soon",
        "småbarn|(?:inga|inte har|utan) barn|ei ole perhettä|perhettä|perheelli\\p{L}{0,40}|perhetilan\\p{L}{0,40}",
        "married|unmarried|spouse|pregnan\\p{L}{0,40}|maternity|paternity|parental leave|perheetön|lapseton|ei lapsia|lapseto\\p{L}{0,40}|raskaa\\p{L}{0,40}|perhetilan\\p{L}{0,40}|äitiysloma\\p{L}{0,40}|perhevapaa\\p{L}{0,40}|naimisi\\p{L}{0,40}|barnfri|barnlös|inga barn|graviditet\\p{L}{0,40}|föräldraledig\\p{L}{0,40}",
      ].join("|"),
    ),
  },
  {
    name: "religion",
    pattern: words(
      "religio\\p{L}{0,40}|christian\\p{L}{0,40}|muslim\\p{L}{0,40}|islam\\p{L}{0,40}|jewish|jew|hindu\\p{L}{0,40}|buddhist\\p{L}{0,40}|catholic\\p{L}{0,40}|lutheran\\p{L}{0,40}|church[- ]?goer|believer|atheist|uskon\\p{L}{0,40}|uskova\\p{L}{0,40}|kristi\\p{L}{0,40}|muslimi\\p{L}{0,40}|kristen|kristna|religiös\\p{L}{0,40}|troende",
    ),
  },
  {
    name: "school",
    pattern: words(
      [
        "(?:top|elite|prestigious|leading|ivy|best|good|top[- ]tier|well[- ]known|famous|renowned)[- ](?:league[- ])?(?:university|universities|school|schools|college|colleges|institutions?)",
        "ivy league|oxbridge|huippuyliopisto\\p{L}{0,40}|eliittiyliopisto\\p{L}{0,40}|toppuniversitet\\p{L}{0,40}",
        "aalto|hanken|mit|stanford|oxford|cambridge|harvard|yale|princeton|kth|eth|helsingin yliopisto\\p{L}{0,40}|university of helsinki",
      ].join("|"),
    ),
  },
  {
    name: "photo or appearance",
    pattern: words(
      [
        "(?:photo|photos|photograph|picture|valokuva\\p{L}{0,40}|kuva|foto|bild) (?:with|of|on|in|for|attached to|hakemu\\p{L}{0,40}|med) (?:the |your |an? )?(?:application|applicant|cv|resume|yourself|candidate|hakemu\\p{L}{0,40}|ansökan)",
        "(?:recent|current|your|attach a) (?:photo|picture|headshot)s?(?! (?:of the (?!applicant|candidate)|gallery|upload\\p{L}{0,40}|editing|app|feature|library|viewer))|clean[- ]shaven|beard\\p{L}{0,40}|well[- ]dressed|tattoo\\p{L}{0,40}|piercing\\p{L}{0,40}|headscarf|hijab",
        "with (?:a )?photo|headshot|good[- ]looking|attractive|presentable|appearance|pleasant look\\p{L}{0,40}|beautiful|pretty|handsome|slim|tall|well[- ]groomed",
        "ulkonäkö\\p{L}{0,40}|ulkoasu|edustava\\p{L}{0,40}|hyvännäköi\\p{L}{0,40}|utseende\\p{L}{0,40}|snygg\\p{L}{0,40}|valokuva\\p{L}{0,40}",
      ].join("|"),
    ),
  },
  {
    name: "health or disability",
    pattern: words(
      "healthy|health status|good health|in good shape|physically fit|disabilit\\p{L}{0,40}|disabled|handicap\\p{L}{0,40}|no (?:health )?(?:issues|conditions|illness\\p{L}{0,40})|sick leave|terveydentila\\p{L}{0,40}|hyvä terveys|hyväkuntoi\\p{L}{0,40}|vamma\\p{L}{0,40}|sairausloma\\p{L}{0,40}|frisk|funktionsneds\\p{L}{0,40}|hälsotillstånd",
    ),
  },
  {
    name: "culture fit",
    pattern: words(
      "culture fit|cultural fit|team fit|fits? (?:in )?(?:with )?(?:our|the) (?:culture|team|vibe|crowd)|like[- ]minded|one of us|our kind of person|kulttuurisopivuu\\p{L}{0,40}|sopii (?:meidän )?kulttuuriin|sopii (?:meidän )?(?:porukkaan|tiimiin|joukkoon)|passar in\\p{L}{0,40}|kulturell\\p{L}{0,40} passform",
    ),
  },
  {
    name: "career gaps",
    pattern: words("career gaps?|gaps? in (?:the |your |their )?(?:cv|career|employment|work history)|continuous (?:employment|career)|aukko\\p{L}{0,40} (?:työhistoriassa|urassa)|luckor? i cv"),
  },
  {
    name: "military service",
    pattern: words(
      "military service|national service|armed forces|served in the army|asepalvelu\\p{L}{0,40}|asevelvollisuu\\p{L}{0,40}|varusmie\\p{L}{0,40}|intti|armeija\\p{L}{0,40}|siviilipalvelu\\p{L}{0,40}|värnplikt\\p{L}{0,40}|militärtjänst\\p{L}{0,40}",
    ),
  },
];

/**
 * The people a job serves. A protected word next to one of them describes those people, not the person
 * wanted: "explains medicine changes to elderly clients" or "iäkkäät asiakkaat" is context, not a wish.
 * English nouns are plural only, so "young customer service agent" still describes the candidate.
 */
const SERVED_NOUNS =
  "clients|customers|patients|residents|pupils|students|users|guests|children|kids|visitors|families|asiakka\\p{L}{0,10}|asiakkai\\p{L}{0,10}|potila\\p{L}{0,10}|asukka\\p{L}{0,10}|asukkai\\p{L}{0,10}|oppila\\p{L}{0,10}|lapset|lasten|lapsi\\p{L}{0,10}|vanhuks\\p{L}{0,10}|vanhusten|käyttäj\\p{L}{0,10}";
const SERVED_TRAITS =
  "elderly|older|old|young|younger|senior|aged|ageing|aging|retired|disabled|female|male|immigrant|foreign|nuor\\p{L}{0,10}|iäk\\p{L}{0,10}|ikääntyn\\p{L}{0,10}|vanh\\p{L}{0,10}|eläkeläis\\p{L}{0,10}";
/** Finnish nouns that already name a served group by age: "ikäihmisten hoito". */
const SERVED_GROUPS = "ikäihmi\\p{L}{0,10}|senior citizens|the elderly|elderly care|elder care|senior care";

const SERVED_CONTEXT = new RegExp(
  [
    `(?<![\\p{L}\\p{N}])(?:${SERVED_TRAITS})(?:\\s(?:and|or|ja|tai)\\s(?:${SERVED_TRAITS}))?[ -](?:${SERVED_NOUNS})(?![\\p{L}\\p{N}-])`,
    `(?<![\\p{L}\\p{N}])(?:${SERVED_NOUNS})\\s(?:who|that)\\s(?:are|is)\\s(?:mostly\\s|often\\s|mainly\\s)?(?:${SERVED_TRAITS})(?![\\p{L}\\p{N}])`,
    `(?<![\\p{L}\\p{N}])(?:${SERVED_NOUNS})\\s(?:ovat|on)\\s(?:${SERVED_TRAITS})(?![\\p{L}\\p{N}])`,
    `(?<![\\p{L}\\p{N}])(?:(?:care|caring|work|working|serve|serving)\\s(?:for|with)\\s)?(?:${SERVED_GROUPS})(?![\\p{L}\\p{N}])`,
  ].join("|"),
  "giu",
);

/** The text with served-group phrases replaced by a neutral word, so only wishes about the candidate remain. */
function withoutServedGroups(text: string): string {
  return text.replace(SERVED_CONTEXT, " people ");
}

/** Every neutral attribute name the "Not used" note may contain. */
export const PROTECTED_NAMES: readonly string[] = [...PROTECTED.map(({ name }) => name), "wishes about the person"];

/**
 * Neutral names of the protected attributes the text mentions. The text is scanned in normalised
 * copies (lookalike letters, spacing, leetspeak, identifiers such as `isMale`), so tricks do not hide a word.
 * Words about the people the job serves ("elderly clients") are context and are not counted.
 */
export function protectedNames(text: string): string[] {
  const copies = protectedScanCopies(text.replace(/\s{1,5}/g, " ")).map(withoutServedGroups);
  return PROTECTED.filter(({ pattern }) => copies.some((copy) => unicodeWords(pattern).test(copy))).map(({ name }) => name);
}
