import type { RedactionReport } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { redactBackground } from "./background";
import { redactContacts } from "./contacts";
import { redactNames } from "./names";
import { redactPersonal } from "./personal";
import { alternation, caseless, HIDDEN, L, R, Redactor } from "./redactor";

export { addReports } from "./redactor";

/** What the blind layer knows about the author, so their own name and contact can be removed. */
export interface KnownIdentity {
  name?: string;
  contact?: string;
  /** Companies at the event. A mention ("I applied to Tuulos last year") would tell a reviewer about the person. */
  companies?: string[];
}

/** Longer text is cut before the rules run. The API never accepts more than this in one field. */
const MAX_REDACT_CHARS = LIMITS.answer;

/** Each company's distinctive first word, so "Tuulos" and "Tuulos Robotics" both go. */
function redactCompanies(r: Redactor, companies: string[]): void {
  const words = companies.map((name) => name.trim().split(/\s+/)[0]).filter((word) => word.length >= 4);
  if (words.length === 0) return;
  r.replace(new RegExp(`${L}(?:${caseless(alternation(words))})(?:\\s+\\p{Lu}\\p{L}{1,30})?(?:['’]s)?${R}`, "gu"), "employers");
}

export interface Redacted {
  text: string;
  report: RedactionReport;
}

const escapeToken = HIDDEN.replace(/[[\]]/g, "\\$&");

/**
 * The blind layer. Rules, not a model: contacts, names, schools, places, employers and personal
 * details are replaced with one neutral token. Rules can miss things; the README lists the limits.
 */
export function redact(input: string, known: KnownIdentity = {}): Redacted {
  const r = new Redactor(input.slice(0, MAX_REDACT_CHARS));
  redactContacts(r, known.contact);
  redactNames(r, known.name);
  redactCompanies(r, known.companies ?? []);
  redactBackground(r);
  redactPersonal(r);
  // "[hidden] [hidden]" reads as two words of a name; one token is enough.
  r.text = r.text.replace(new RegExp(`${escapeToken}(?:[ \\t]+${escapeToken})+`, "g"), HIDDEN);
  return { text: r.text, report: r.report };
}
