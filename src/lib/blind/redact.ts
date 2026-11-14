import type { RedactionReport } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { redactBackground } from "./background";
import { redactContacts } from "./contacts";
import { redactNames } from "./names";
import { redactPersonal } from "./personal";
import { caseless, escape, HIDDEN, L, LEGAL_FORM, R, Redactor } from "./redactor";

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

/**
 * One company by its distinctive first word, with as much of its full name as follows in any case:
 * "Kaari Home Care" hides whole, never leaving "Care" behind. A first word alone may take one more capitalised word ("Tuulos Labs").
 */
function companyPattern(name: string): string | undefined {
  const parts = name.trim().split(/\s+/).map((part) => caseless(escape(part)));
  if (parts.length === 0 || name.trim().split(/\s+/)[0].length < 4) return undefined;
  const fuller = parts.slice(1).map((_, i) => parts.slice(0, parts.length - i).join("\\s{1,5}"));
  return [...fuller, `${parts[0]}(?:\\s{1,5}\\p{Lu}\\p{L}{1,30})?`].join("|");
}

/** Company names at the event, whole, with a trailing legal form ("Oy") and a possessive. */
function redactCompanies(r: Redactor, companies: string[]): void {
  const patterns = companies.map(companyPattern).filter((p): p is string => p !== undefined);
  if (patterns.length === 0) return;
  r.replace(new RegExp(`${L}(?:${patterns.join("|")})${LEGAL_FORM}(?:['’]s)?${R}`, "gu"), "employers");
}

interface Redacted {
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
