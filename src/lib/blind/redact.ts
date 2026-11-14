import type { RedactionReport } from "@/lib/domain/types";
import { FINNISH_CITY_STEMS, NATIONALITIES, NOT_EMPLOYERS, PLACES, SCHOOLS } from "./lexicon";

/** What the blind layer knows about the author, so their own name and contact can be removed. */
export interface KnownIdentity {
  name?: string;
  contact?: string;
}

export interface Redacted {
  text: string;
  report: RedactionReport;
}

type Bucket = keyof RedactionReport;

const TOKENS: Record<Bucket, string> = {
  names: "[name]",
  contacts: "[contact]",
  places: "[place]",
  schools: "[school]",
  employers: "[employer]",
  other: "[personal detail]",
};

// Unicode-aware word edges. JavaScript's \b only knows ASCII letters.
const L = "(?<![\\p{L}\\p{N}_])";
const R = "(?![\\p{L}\\p{N}_])";
const CAP = "\\p{Lu}[\\p{L}\\p{N}&'’.-]*";

function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

function alternation(words: string[]): string {
  return [...new Set(words)].sort((a, b) => b.length - a.length).map(escape).join("|");
}

export function emptyReport(): RedactionReport {
  return { names: 0, contacts: 0, places: 0, schools: 0, employers: 0, other: 0 };
}

class Redactor {
  report = emptyReport();
  constructor(public text: string) {}

  /** Replaces each match, or only its first capture group when the pattern has one. */
  replace(pattern: RegExp, bucket: Bucket, accept: (match: string) => boolean = () => true): void {
    this.text = this.text.replace(pattern, (whole: string, ...rest: unknown[]) => {
      const group = typeof rest[0] === "string" ? rest[0] : undefined;
      const target = group ?? whole;
      if (!accept(target)) return whole;
      this.report[bucket] += 1;
      return group === undefined ? TOKENS[bucket] : whole.replace(group, TOKENS[bucket]);
    });
  }
}

const NAME_LINE = /^\p{Lu}[\p{L}'’.-]*(?:\s+\p{Lu}[\p{L}'’.-]*){0,3}$/u;

const SIGN_OFF = /^(?:best regards|kind regards|warm regards|all the best|best|regards|thanks|thank you|cheers|br|yours|sincerely|ystävällisin terveisin|terveisin|t\.)\s*[,.]?\s*(.*)$/iu;

function redactSignature(r: Redactor): void {
  const lines = r.text.split("\n");
  const lastIndexes = lines.map((line, i) => (line.trim() ? i : -1)).filter((i) => i >= 0).slice(-3);
  for (const [position, index] of lastIndexes.entries()) {
    const line = lines[index].trim();
    const signOff = SIGN_OFF.exec(line);
    if (signOff) {
      const rest = signOff[1].trim();
      if (NAME_LINE.test(rest)) {
        lines[index] = lines[index].replace(rest, TOKENS.names);
        r.report.names += 1;
      }
      for (const after of lastIndexes.slice(position + 1)) {
        const candidate = lines[after].trim();
        if (NAME_LINE.test(candidate)) {
          lines[after] = TOKENS.names;
          r.report.names += 1;
        }
      }
      break;
    }
    const dashed = /^[-–—~]\s*(\p{Lu}[\p{L}'-]*(?:\s+\p{Lu}[\p{L}'-]*){0,2})\s*$/u.exec(line);
    if (dashed && index === lastIndexes[lastIndexes.length - 1]) {
      lines[index] = lines[index].replace(dashed[1], TOKENS.names);
      r.report.names += 1;
    }
  }
  r.text = lines.join("\n");
}

const INTRO_STOP = new Set(["Not", "The", "A", "An", "In", "On", "Using", "Going", "Sure", "Happy", "Glad", "Also", "Still", "Now", "Here", "Writing", "Looking", "Working", "Done", "Fine"]);

export function redact(input: string, known: KnownIdentity = {}): Redacted {
  const r = new Redactor(input);

  // Contacts first, so names inside emails and links go with them.
  r.replace(/[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.\p{L}{2,}/gu, "contacts");
  r.replace(/\b(?:https?:\/\/|www\.)[^\s)>\]"']+/gi, "contacts");
  r.replace(/\b(?:[a-z0-9-]+\.)*(?:linkedin\.com|github\.com|github\.io|gitlab\.com|behance\.net|dribbble\.com|medium\.com|about\.me)(?:\/[^\s)>\]"']*)?/gi, "contacts");
  r.replace(/(?<![\p{L}\p{N}])(?:\+\d{1,3}|\(?0\d{1,3}\)?)(?:[\s.-]?\d{2,4}){2,4}(?![\p{N}])/gu, "contacts", (m) => m.replace(/\D/g, "").length >= 7);
  if (known.contact && known.contact.trim().length >= 3) {
    r.replace(new RegExp(escape(known.contact.trim()), "giu"), "contacts");
  }

  // The author's own name, in full and in parts, then self-introductions and signatures.
  const parts = (known.name ?? "").split(/[\s-]+/).filter((part) => part.length >= 2);
  if (known.name && parts.length > 1) r.replace(new RegExp(`${L}${escape(known.name.trim())}${R}`, "giu"), "names");
  if (parts.length > 0) r.replace(new RegExp(`${L}(?:${alternation(parts)})(?:['’]s)?${R}`, "giu"), "names");
  r.replace(
    new RegExp(`(?:[Mm]y name is|[Nn]ame's|I am|I'm|I’m|[Tt]his is|[Mm]inun nimeni on|[Oo]len)\\s+(\\p{Lu}[\\p{L}'-]+(?:\\s+\\p{Lu}[\\p{L}'-]+){0,2})`, "gu"),
    "names",
    (name) => !INTRO_STOP.has(name.split(/\s+/)[0]) && !NOT_EMPLOYERS.has(name.split(/\s+/)[0]),
  );
  redactSignature(r);

  // Schools before places, so "University of Helsinki" counts as a school.
  r.replace(new RegExp(`${L}(?:University of(?: Applied Sciences)?(?:\\s+${CAP}){1,3})`, "gu"), "schools");
  r.replace(new RegExp(`${L}(?:${CAP}\\s+){1,3}(?:University of Applied Sciences|University|Institute of Technology|Polytechnic|College|Business School|School of [\\p{L}]+|Academy)${R}`, "gu"), "schools");
  r.replace(new RegExp(`${L}(?:${CAP}\\s+)?(?:yliopisto|ammattikorkeakoulu|korkeakoulu)\\p{L}*`, "giu"), "schools");
  r.replace(new RegExp(`${L}(?:${alternation(SCHOOLS)})${R}`, "gu"), "schools");

  r.replace(new RegExp(`${L}(?:${alternation(PLACES)})${R}`, "gu"), "places");
  r.replace(new RegExp(`${L}(?:${alternation(FINNISH_CITY_STEMS)})\\p{L}*${R}`, "gu"), "places");

  // Nationality and native language.
  r.replace(/\bnative\s+[\p{L}-]+\s+speaker\b|\b[\p{L}-]+\s+native speaker\b|\bnative speaker of\s+[\p{L}-]+/giu, "other");
  r.replace(new RegExp(`${L}(?:${alternation(NATIONALITIES)})${R}`, "gu"), "other");
  r.replace(/\b(?:citizen|national) of\s+\S+/gi, "other");

  // Employers: company suffixes, then names after work phrases, then any capitalised name after "at" or "for".
  r.replace(new RegExp(`${L}(${CAP}(?:\\s+${CAP}){0,2}\\s+(?:Oyj|Oy|Ab|AB|Ltd|Inc|GmbH|AS|ASA|LLC|Corp|Group))${R}`, "gu"), "employers");
  r.replace(
    new RegExp(`(?:worked|work|working|employed|interned|intern|internship|job|position|role|engineer|developer|analyst|scientist|manager|designer|consultant|currently|joined|founded)\\s+(?:at|for|with|in)\\s+(${CAP}(?:\\s+${CAP}){0,2})`, "gu"),
    "employers",
    (name) => !NOT_EMPLOYERS.has(name.split(/\s+/)[0]),
  );
  r.replace(new RegExp(`${L}(?:at|for)\\s+(${CAP}(?:\\s+${CAP}){0,2})`, "gu"), "employers", (name) => !NOT_EMPLOYERS.has(name.split(/\s+/)[0]));

  // Ages and birth years.
  r.replace(/\b\d{2}[- ]?(?:years?|yrs?)[- ]old\b|\b\d{2}[- ]vuotias\b/giu, "other");
  r.replace(/\b(?:aged?|age:)\s*\d{2}\b/gi, "other");
  r.replace(/\b(?:born(?: in)?|b\.)\s*(?:19|20)\d{2}\b/gi, "other");
  r.replace(/\b(?:I'm|I am|I’m)\s+\d{2}\b(?!\s*(?:%|ms|minutes|hours|days|weeks|percent|years? (?:of|in)))/gi, "other");
  r.replace(/\bin my (?:early |late |mid-?)?(?:twenties|thirties|forties|fifties|sixties|20s|30s|40s|50s|60s)\b/gi, "other");

  // Gender and family descriptions.
  r.replace(/\b(?:as an?|being an?|I am an?|I'm an?|I’m an?)\s+(?:single\s+|young\s+|working\s+)?(?:mother|father|mom|mum|dad|parent|wife|husband|woman|man|female|male|girl|guy|immigrant|refugee)\b(?:\s+of\s+(?:one|two|three|four|five|\d+)(?:\s+(?:kids|children|boys|girls))?)?/gi, "other");
  r.replace(/\b(?:mother|father|mom|mum|dad|parent)\s+of\s+(?:one|two|three|four|five|\d+)(?:\s+(?:kids|children|boys|girls))?\b/gi, "other");
  r.replace(/\bmy\s+(?:husband|wife|spouse|partner|kids|children|son|daughter|boyfriend|girlfriend)(?:['’]s)?\b/gi, "other");
  r.replace(/\bsingle (?:mom|mum|mother|dad|father|parent)\b/gi, "other");
  r.replace(/\b(?:pregnant|maternity leave|paternity leave|parental leave)\b/gi, "other");
  r.replace(/\(?\b(?:she|he|they)\/(?:her|him|them)(?:\/(?:hers|his|theirs))?\b\)?/gi, "other");

  return { text: r.text, report: r.report };
}

export function addReports(a: RedactionReport, b: RedactionReport): RedactionReport {
  return {
    names: a.names + b.names,
    contacts: a.contacts + b.contacts,
    places: a.places + b.places,
    schools: a.schools + b.schools,
    employers: a.employers + b.employers,
    other: a.other + b.other,
  };
}
