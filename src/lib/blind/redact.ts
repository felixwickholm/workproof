import type { RedactionReport } from "@/lib/domain/types";
import { redactBackground } from "./background";
import { redactContacts } from "./contacts";
import { redactNames } from "./names";
import { redactPersonal } from "./personal";
import { HIDDEN, Redactor } from "./redactor";

export { addReports, emptyReport, HIDDEN } from "./redactor";

/** What the blind layer knows about the author, so their own name and contact can be removed. */
export interface KnownIdentity {
  name?: string;
  contact?: string;
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
  const r = new Redactor(input);
  redactContacts(r, known.contact);
  redactNames(r, known.name);
  redactBackground(r);
  redactPersonal(r);
  // "[hidden] [hidden]" reads as two words of a name; one token is enough.
  r.text = r.text.replace(new RegExp(`${escapeToken}(?:[ \\t]+${escapeToken})+`, "g"), HIDDEN);
  return { text: r.text, report: r.report };
}
