import { addReports, escape, L, R, Redactor } from "./redactor";

const DIGIT_WORDS = "zero|oh|one|two|three|four|five|six|seven|eight|nine|nolla|yksi|kaksi|kolme|neljä|viisi|kuusi|seitsemän|kahdeksan|yhdeksän|noll|ett|två|tre|fyra|fem|sex|sju|åtta|nio";

/** Social platforms and messengers after which the next word is a handle: "gh: sannav-dev", "tg: sanna_ml". */
const PLATFORMS = "github|gh|gitlab|twitter|x\\.com|linkedin|instagram|insta|telegram|tg|signal|whatsapp|skype|discord|mastodon|bluesky|bsky|threads|tiktok|youtube|kaggle|reddit|keybase|matrix";

/** Free mail hosts, so "sv1990 at gmail" is a contact even without a dot. */
const MAIL_HOSTS = "gmail|googlemail|hotmail|outlook|yahoo|icloud|protonmail|proton|gmx|live|msn|aol|yandex|mail";

const TLDS = "fi|se|no|dk|ee|de|eu|me|io|dev|app|ai|xyz|page|site|blog|com|net|org|uk|social|online|tech|co";

/** Documentation hosts a technical answer may cite. They name no person. */
const DOC_HOSTS = /^(?:docs?\.|developer\.|learn\.)|(?:scikit-learn|python|pytorch|tensorflow|numpy|pandas\.pydata|postgresql|mozilla|w3|owasp|kubernetes|react|nodejs|typescriptlang|wikipedia)\.org|readthedocs\.io/i;

// Every repeated part has an upper bound and starts only at a token edge, so long runs of letters,
// digits or "at at at" never make a pattern retry from every position.
const LOCAL = "(?<![\\p{L}\\p{N}._%+-])[\\p{L}\\p{N}._%+-]{1,64}";
const LABEL = "[\\p{L}\\p{N}-]{1,63}";

const BARE_DOMAIN = new RegExp(
  `(?<![\\p{L}\\p{N}_./-])(?:${LABEL}\\.){0,4}[\\p{L}\\p{N}-]{2,63}\\.(?:${TLDS})(?:\\.(?:uk|jp|nz|au|br|za|in))?(?:\\/[^\\s)>\\]"']{0,500})?(?![\\p{L}\\p{N}_(])`,
  "giu",
);

/** Bare domains in prose only: inside code, "flask.app" or "request.session.me" are attribute names. */
function redactBareDomains(r: Redactor): void {
  r.text = r.text
    .split(/(```[\s\S]{0,20000}?```|`[^`\n]{1,200}`)/)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      const prose = new Redactor(part);
      prose.replace(BARE_DOMAIN, "contacts", (domain) => !DOC_HOSTS.test(domain) && /[\p{L}\p{N}-]{3}\./u.test(domain));
      r.report = addReports(r.report, prose.report);
      return prose.text;
    })
    .join("");
}

/** Contacts first, so names inside emails and links go with them. */
export function redactContacts(r: Redactor, contact?: string): void {
  // Email, plain and obfuscated: "x@y.com", "x [at] y [dot] com", "x(at)y(dot)org", "x at y dot com", "x @ y . com".
  r.replace(new RegExp(`${LOCAL}@(?:${LABEL}\\.){1,8}\\p{L}{2,24}`, "gu"), "contacts");
  r.replace(new RegExp(`${LOCAL}\\s{0,3}[[({]\\s{0,3}at\\s{0,3}[\\])}]\\s{0,3}${LABEL}(?:\\s{0,3}(?:[[({]\\s{0,3}dot\\s{0,3}[\\])}]|\\.)\\s{0,3}${LABEL}){1,6}`, "giu"), "contacts");
  r.replace(new RegExp(`${LOCAL}\\s{1,3}at\\s{1,3}${LABEL}(?:\\s{1,3}dot\\s{1,3}${LABEL}){1,6}`, "giu"), "contacts");
  r.replace(new RegExp(`${LOCAL}\\s{1,3}at\\s{1,3}(?:${MAIL_HOSTS})${R}`, "giu"), "contacts");
  r.replace(new RegExp(`${LOCAL}\\s{1,3}@\\s{0,3}${LABEL}(?:\\s{0,3}\\.\\s{0,3}${LABEL}){1,6}`, "gu"), "contacts");
  r.replace(/(?<![\p{L}\p{N}])(?:[\p{L}\p{N}._-] ){2,64}@ (?:[\p{L}\p{N}-] ){2,63}\. ?(?:[\p{L}\p{N}] ?){2,24}/gu, "contacts");

  // Links, profile sites and personal domains such as "sannavirtanen.fi" or "sanna-dev.co.uk". Method calls like "x.io(" are code.
  r.replace(/(?<![\p{L}\p{N}_])(?:https?:\/\/|www\.)[^\s)>\]"']{1,2000}/giu, "contacts", (url) => !DOC_HOSTS.test(url.replace(/^https?:\/\/(?:www\.)?/i, "")));
  r.replace(
    /(?<![\p{L}\p{N}_.-])(?:[a-z0-9-]{1,63}\.){0,4}(?:linkedin\.com|github\.com|github\.io|gitlab\.com|behance\.net|dribbble\.com|medium\.com|about\.me|imgur\.com|bsky\.social)(?:\/[^\s)>\]"']{0,500})?/giu,
    "contacts",
  );
  redactBareDomains(r);


  // Handles: "@sannav" (not a decorator at the start of a line), handles named after a platform, Discord tags.
  r.replace(/(?<![\p{L}\p{N}_.@])(?<!^[ \t]{0,40})@[\p{L}\p{N}_](?:[\p{L}\p{N}_.-]{0,62}[\p{L}\p{N}_])?/gmu, "contacts");
  r.replace(new RegExp(`${L}(?:${PLATFORMS})${R}\\s{0,3}(?:profile|handle|name|tag)?\\s{0,3}(?:is|:|as|=|-)\\s{0,3}@?([\\p{L}\\p{N}_][\\p{L}\\p{N}_.#-]{1,62})`, "giu"), "contacts");
  r.replace(/(?<![\p{L}\p{N}_])[\p{L}\p{N}_.]{2,32}#\d{4}(?![\p{N}])/gu, "contacts");

  // Finnish personal identity code (henkilötunnus) and IBAN bank accounts, before phone numbers take their digits.
  r.replace(new RegExp(`${L}\\d{6}[-+ABCDEFUVWXYabcdefuvwxy]\\d{3}[0-9A-Ya-y]${R}`, "gu"), "contacts");
  r.replace(
    new RegExp(`${L}[A-Za-z]{2}\\d{2}(?:[ ]?[A-Za-z0-9]{4}){2,7}(?:[ ]?[A-Za-z0-9]{1,3})?${R}`, "gu"),
    "contacts",
    (m) => m.replace(/\D/g, "").length >= 8,
  );

  // Phones: "+358 40 123 4567", "(+358) 40 1234567", "040-1234567", "00358 ...", "358401234567", and spelled-out digits.
  r.replace(/(?<![\p{L}\p{N}])(?:\(\+\d{1,3}\)|\+\d{1,3}|\(?0\d{1,4}\)?)(?:[\s.-]?\d{1,4}){2,5}(?![\p{N}])/gu, "contacts", (m) => m.replace(/\D/g, "").length >= 7);
  r.replace(/(?<![\p{L}\p{N}])358\d{8,10}(?![\p{N}])/gu, "contacts");
  r.replace(new RegExp(`${L}(?:(?:${DIGIT_WORDS})${R}[\\s,.-]{0,3}){7,20}`, "giu"), "contacts");

  if (contact && contact.trim().length >= 3) {
    r.replace(new RegExp(escape(contact.trim()), "giu"), "contacts");
    // The same phone number written without spaces or with other separators.
    const digits = contact.replace(/\D/g, "");
    if (digits.length >= 7) {
      const tail = digits.slice(-7).split("").join("[\\s.-]?");
      r.replace(new RegExp(`(?<![\\p{N}])[+(\\d][\\d\\s().-]{0,12}${tail}(?![\\p{N}])`, "gu"), "contacts");
    }
  }
}
