/**
 * Protected attributes: wishes that describe a person instead of the work. English, Finnish and Swedish.
 * They never become skills and never reach any text a talent or reviewer sees.
 * Each entry maps to a neutral name for the "Not used" note.
 */

/** A case-insensitive pattern with Unicode word edges, so Finnish and Swedish words match whole. */
function words(source: string): RegExp {
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${source})(?![\\p{L}\\p{N}])`, "iu");
}

const NUMBER_WORDS = "twenty|thirty|forty|fifty|sixty|kaksikymmentä|kolmekymmentä|neljäkymmentä|viisikymmentä|tjugo|trettio|fyrtio|femtio";

const PROTECTED: { name: string; pattern: RegExp }[] = [
  {
    name: "age",
    pattern: words(
      [
        "young|younger|youngest|youthful|youth|elderly|mature|aged?|ageing|aging",
        // "under 30" is an age only where no unit follows: "under 30 ms" is a latency.
        `(?:under|over|below|above|alle|yli|över)\\s+(?:\\d{2}|${NUMBER_WORDS})(?=\\s*(?:$|[,.;)]|and\\b|or\\b|ja\\b|och\\b|years?\\b|yrs\\b|y\\.?o\\b|vuot\\p{L}*|år\\b|-?vuotia\\p{L}*))(?:\\s*(?:years?|yrs|y\\.?o\\.?|vuotta|vuotias\\p{L}*|år))?`,
        `(?:max(?:imum)?|min(?:imum)?|at most|at least|enintään|korkeintaan|högst|minst)\\s+(?:\\d{2}|${NUMBER_WORDS})\\s*(?:years? old|yrs old|y\\.?o\\.?|-?vuotia\\p{L}*|år gammal|åriga?)`,
        "\\d{2}\\s*[-–]\\s*\\d{2}\\s*(?:years?|yrs|vuotta|vuotia\\p{L}*|år|-?åriga?)",
        "\\d{2}\\s*(?:years? old|yo|y\\.o\\.|-?vuotia\\p{L}*|-?åriga?)",
        "years old|born (?:in|after|before) (?:19|20)\\d{2}|born in the (?:80s|90s|00s|eighties|nineties)",
        "digital[- ]natives?|millennials?|gen(?:eration)?[- ]?(?:z|y|x|alpha)|zoomers?|boomers?",
        "recent(?:ly)?[- ]grad\\p{L}*|fresh[- ]grad\\p{L}*|new[- ]grad\\p{L}*|graduated recently|just graduated|vastavalmistu\\p{L}*|nyutexaminerad\\p{L}*|nyligen utexaminerad\\p{L}*",
        "energetic|energinen|energis\\p{L}*|energisk\\p{L}*|nuorekas|nuor\\p{L}*|ung|unga|ungdomlig\\p{L}*|yngre",
        "senior citizens?|retired|retirees?|pensioners?|eläkeläi\\p{L}*|ikä\\p{L}*|iältään|ålder\\p{L}*",
      ].join("|"),
    ),
  },
  {
    name: "native language",
    pattern: words(
      [
        "(?<!cloud[- ]|react |non[- ])natives?(?![- ](?:app|apps|mobile|ios|android|code|modules?|integrations?|sdk|build|binar\\p{L}*|libraries|library|ui|tools?|units?|format|resolution|speed))",
        "mother[- ]tongue|first language|native language|native speakers?|äidinkiel\\p{L}*|modersmål\\p{L}*|förstaspråk\\p{L}*",
        "[\\p{L}]+-speaking|suomea puhuv\\p{L}*|ruotsia puhuv\\p{L}*|svensktalande|finsktalande",
      ].join("|"),
    ),
  },
  {
    name: "nationality or origin",
    pattern: words(
      [
        "nationality|nationalities|citizens?|citizenship|passport holders?|born in|[\\p{L}]+-born|native[- ]born",
        "locals?(?![- ](?:storage|first|development|dev|server|cache|files?|network|models?|data|environment|machine|setup|branch|government|authorit\\p{L}*|council|business\\p{L}*|shops?|stores?|time))",
        "lives in|living in|lives nearby|from the area|asuu|asuva\\p{L}*|bor i",
        "ethnic\\p{L}*|racial|white(?![- ](?:board|paper|label|list|space|box|hat|noise))|caucasian|immigrants?|foreigners?|maahanmuuttaja\\p{L}*|ulkomaalai\\p{L}*|invandrare",
        "kansalai\\p{L}*|kansallisuu\\p{L}*|suomalai\\p{L}*|kantasuomalai\\p{L}*|syntyperäi\\p{L}*|medborgar\\p{L}*|svensk medborgare|finländsk\\p{L}*|nationalitet",
      ].join("|"),
    ),
  },
  {
    name: "gender",
    pattern: words(
      "male|female|man|woman|men|women|guy|guys|girl|girls|boy|boys|lady|ladies|gentleman|gentlemen|he|she|him|his|hers|mies|miehiä|miestä|miehen|nainen|naisia|naista|naisen|tyttö\\p{L}*|kvinna|kvinnor|kvinnlig|manlig|tjej\\p{L}*|kill(?:e|ar)",
    ),
  },
  {
    name: "family status",
    pattern: words(
      [
        "no kids|no children|without kids|without children|has kids|has children|childless|family (?:man|woman|person|commitments?|status|plans|situation|obligations|life)|no family",
        "single(?=\\s*(?:$|[,.;)]|and\\b|or\\b|(?:parent|mother|father|mom|mum|dad)s?\\b))",
        "married|unmarried|spouse|pregnan\\p{L}*|maternity|paternity|parental leave|perheetön|lapseton|ei lapsia|lapseto\\p{L}*|raskaa\\p{L}*|perhetilan\\p{L}*|äitiysloma\\p{L}*|perhevapaa\\p{L}*|naimisi\\p{L}*|barnfri|barnlös|inga barn|graviditet\\p{L}*|föräldraledig\\p{L}*",
      ].join("|"),
    ),
  },
  {
    name: "religion",
    pattern: words(
      "religio\\p{L}*|christian\\p{L}*|muslim\\p{L}*|islam\\p{L}*|jewish|jew|hindu\\p{L}*|buddhist\\p{L}*|catholic\\p{L}*|lutheran\\p{L}*|church[- ]?goer|believer|atheist|uskon\\p{L}*|uskova\\p{L}*|kristi\\p{L}*|muslimi\\p{L}*|kristen|kristna|religiös\\p{L}*|troende",
    ),
  },
  {
    name: "school",
    pattern: words(
      [
        "(?:top|elite|prestigious|leading|ivy|best|good|top[- ]tier|well[- ]known|famous|renowned)[- ](?:league[- ])?(?:university|universities|school|schools|college|colleges|institutions?)",
        "ivy league|oxbridge|huippuyliopisto\\p{L}*|eliittiyliopisto\\p{L}*|toppuniversitet\\p{L}*",
        "aalto|hanken|mit|stanford|oxford|cambridge|harvard|yale|princeton|kth|eth|helsingin yliopisto\\p{L}*|university of helsinki",
      ].join("|"),
    ),
  },
  {
    name: "photo or appearance",
    pattern: words(
      [
        "(?:photo|photos|photograph|picture|valokuva\\p{L}*|kuva|foto|bild) (?:with|of|on|in|for|attached to|hakemu\\p{L}*|med) (?:the |your |an? )?(?:application|applicant|cv|resume|yourself|candidate|hakemu\\p{L}*|ansökan)",
        "with (?:a )?photo|headshot|good[- ]looking|attractive|presentable|appearance|pleasant look\\p{L}*|beautiful|pretty|handsome|slim|tall|well[- ]groomed",
        "ulkonäkö\\p{L}*|ulkoasu|edustava\\p{L}*|hyvännäköi\\p{L}*|utseende\\p{L}*|snygg\\p{L}*|valokuva\\p{L}*",
      ].join("|"),
    ),
  },
  {
    name: "health or disability",
    pattern: words(
      "healthy|health status|good health|in good shape|physically fit|disabilit\\p{L}*|disabled|handicap\\p{L}*|no (?:health )?(?:issues|conditions|illness\\p{L}*)|sick leave|terveydentila\\p{L}*|hyvä terveys|hyväkuntoi\\p{L}*|vamma\\p{L}*|sairausloma\\p{L}*|frisk|funktionsneds\\p{L}*|hälsotillstånd",
    ),
  },
  {
    name: "culture fit",
    pattern: words(
      "culture fit|cultural fit|team fit|fits? (?:in )?(?:with )?(?:our|the) (?:culture|team|vibe|crowd)|like[- ]minded|one of us|our kind of person|kulttuurisopivuu\\p{L}*|sopii (?:meidän )?kulttuuriin|sopii (?:meidän )?(?:porukkaan|tiimiin|joukkoon)|passar in\\p{L}*|kulturell\\p{L}* passform",
    ),
  },
  {
    name: "military service",
    pattern: words(
      "military service|national service|armed forces|served in the army|asevelvollisuu\\p{L}*|varusmie\\p{L}*|intti|armeija\\p{L}*|siviilipalvelu\\p{L}*|värnplikt\\p{L}*|militärtjänst\\p{L}*",
    ),
  },
];

/** Every neutral attribute name the "Not used" note may contain. */
export const PROTECTED_NAMES: readonly string[] = [...PROTECTED.map(({ name }) => name), "wishes about the person"];

/** Neutral names of the protected attributes the text mentions. */
export function protectedNames(text: string): string[] {
  const flat = text.replace(/\s+/g, " ");
  return PROTECTED.filter(({ pattern }) => pattern.test(flat)).map(({ name }) => name);
}

/** The words that matched, for tests and error messages. */
export function protectedMatches(text: string): string[] {
  const flat = text.replace(/\s+/g, " ");
  return PROTECTED.flatMap(({ pattern }) => {
    const found = pattern.exec(flat);
    return found ? [found[0]] : [];
  });
}

/**
 * A language requirement stated as a working language ("works in Finnish with customers") is a job need.
 * Returns the neutral form, "Working language: Finnish", or undefined. A "native" wish never qualifies.
 */
export function workingLanguage(text: string): string | undefined {
  if (protectedNames(text).includes("native language")) return undefined;
  const found =
    /\b(?:works?|working|work with \w+) in (finnish|swedish|english)\b/i.exec(text) ??
    /\bworking language(?: is|:)?\s+(finnish|swedish|english)\b/i.exec(text) ??
    /\btyökiel\p{L}*\s+(?:on\s+)?(suomi|ruotsi|englanti)\b/iu.exec(text) ??
    /\barbetsspråk\p{L}*\s+(?:är\s+)?(finska|svenska|engelska)\b/iu.exec(text);
  if (!found) return undefined;
  const names: Record<string, string> = {
    finnish: "Finnish", swedish: "Swedish", english: "English", suomi: "Finnish", ruotsi: "Swedish",
    englanti: "English", finska: "Finnish", svenska: "Swedish", engelska: "English",
  };
  return `Working language: ${names[found[1].toLowerCase()]}`;
}
