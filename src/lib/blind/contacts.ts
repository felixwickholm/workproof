import { escape, type Redactor } from "./redactor";

const DIGIT_WORDS = "zero|oh|one|two|three|four|five|six|seven|eight|nine|nolla|yksi|kaksi|kolme|neljä|viisi|kuusi|seitsemän|kahdeksan|yhdeksän";

/** Social platforms after which the next word is a handle: "gh: sannav-dev", "LinkedIn as sannavirtanen". */
const PLATFORMS = "github|gh|gitlab|twitter|x\\.com|linkedin|instagram|insta|telegram|discord|mastodon|bluesky|threads|tiktok|youtube|kaggle";

/** Contacts first, so names inside emails and links go with them. */
export function redactContacts(r: Redactor, contact?: string): void {
  // Email, plain and obfuscated: "x@y.com", "x [at] y [dot] com", "x at y dot com", "x @ y . com".
  r.replace(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu, "contacts");
  r.replace(/[\p{L}\p{N}._%+-]+\s*[[({]\s*at\s*[\])}]\s*[\p{L}\p{N}-]+(?:\s*(?:[[({]\s*dot\s*[\])}]|\.)\s*[\p{L}\p{N}-]+)+/giu, "contacts");
  r.replace(/[\p{L}\p{N}._%+-]+\s+at\s+[\p{L}\p{N}-]+(?:\s+dot\s+[\p{L}\p{N}-]+)+/giu, "contacts");
  r.replace(/[\p{L}\p{N}._%+-]+\s+@\s*[\p{L}\p{N}-]+(?:\s*\.\s*[\p{L}\p{N}-]+)+/gu, "contacts");

  // Links, profile sites and personal domains such as "sannavirtanen.fi". Method calls like "x.io(" are code.
  r.replace(/\b(?:https?:\/\/|www\.)[^\s)>\]"']+/gi, "contacts");
  r.replace(/\b(?:[a-z0-9-]+\.)*(?:linkedin\.com|github\.com|github\.io|gitlab\.com|behance\.net|dribbble\.com|medium\.com|about\.me)(?:\/[^\s)>\]"']*)?/gi, "contacts");
  r.replace(/(?<![\p{L}\p{N}_./-])[\p{L}\p{N}-]{3,}\.(?:fi|se|no|dk|ee|de|eu|me|io|dev|app|ai|xyz|page|site|blog|com|net|org)(?:\/[^\s)>\]"']*)?(?![\p{L}\p{N}_(])/giu, "contacts");

  // Handles: "@sannav" (not a decorator at the start of a line), and handles named after a platform.
  r.replace(/(?<![\p{L}\p{N}_.@])(?<!^[ \t]*)@[\p{L}\p{N}_](?:[\p{L}\p{N}_.-]*[\p{L}\p{N}_])?/gmu, "contacts");
  r.replace(new RegExp(`\\b(?:${PLATFORMS})\\b\\s*(?:profile|handle|name)?\\s*(?:is|:|as|=|-)\\s*@?([\\p{L}\\p{N}_][\\p{L}\\p{N}_.-]{1,})`, "giu"), "contacts");

  // Phones: "+358 40 123 4567", "(+358) 40 1234567", "040-1234567", "00358 ...", and spelled-out digits.
  r.replace(/(?<![\p{L}\p{N}])(?:\(\+\d{1,3}\)|\+\d{1,3}|\(?0\d{1,4}\)?)(?:[\s.-]?\d{1,4}){2,5}(?![\p{N}])/gu, "contacts", (m) => m.replace(/\D/g, "").length >= 7);
  r.replace(new RegExp(`(?:\\b(?:${DIGIT_WORDS})\\b[\\s,.-]*){7,}`, "giu"), "contacts");

  // Finnish personal identity code (henkilötunnus) and IBAN bank accounts.
  r.replace(/\b\d{6}[-+ABCDEFUVWXYabcdefuvwxy]\d{3}[0-9A-Ya-y]\b/g, "contacts");
  r.replace(/\b[A-Z]{2}\d{2}(?:[ ]?[A-Z0-9]{4}){2,7}(?:[ ]?[A-Z0-9]{1,3})?\b/g, "contacts");

  if (contact && contact.trim().length >= 3) {
    r.replace(new RegExp(escape(contact.trim()), "giu"), "contacts");
    // The same phone number written without spaces or with other separators.
    const digits = contact.replace(/\D/g, "");
    if (digits.length >= 7) {
      const tail = digits.slice(-7).split("").join("[\\s.-]?");
      r.replace(new RegExp(`(?<![\\p{N}])[+(\\d][\\d\\s().-]*${tail}(?![\\p{N}])`, "gu"), "contacts");
    }
  }
}
