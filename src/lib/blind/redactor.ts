import type { RedactionReport } from "@/lib/domain/types";
import { unicodeWords } from "@/lib/util/regex";

type Bucket = keyof RedactionReport;

/** One neutral token for every kind of hidden detail, so the context never tells what was there. */
export const HIDDEN = "[hidden]";

// Unicode-aware word edges. JavaScript's \b only knows ASCII letters.
export const L = "(?<![\\p{L}\\p{N}_])";
export const R = "(?![\\p{L}\\p{N}_])";
/** A capitalised word, for example "Nordwave" or "O'Neill". */
export const CAP = "\\p{Lu}[\\p{L}\\p{N}&'’.-]{0,40}";

/**
 * A legal form or country word that ends a company name: "Halla Supply Oy", "Stora Enso Oyj", "Nokia Finland".
 * Optional and in any case, so the whole name goes and no part of it is left for a reader.
 */
const LEGAL_FORM_WORDS = ["Oyj", "Oy", "Ab", "Ltd", "Inc", "GmbH", "ASA", "LLC", "Corp", "Group", "Finland", "Suomi"];

export function escape(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
}

export function alternation(words: string[]): string {
  return [...new Set(words)].sort((a, b) => b.length - a.length).map(escape).join("|");
}

/** The optional legal form after a company name. */
export const LEGAL_FORM = `(?:\\s{1,5}(?:${caseless(alternation(LEGAL_FORM_WORDS))}))?`;

const ACCENTS: Record<string, string> = {
  a: "aàáâãäåā", o: "oòóôõöøō", u: "uùúûüū", e: "eèéêëē", i: "iìíîïī", c: "cçć", n: "nñń",
  s: "sšś", z: "zžźż", y: "yýÿ", l: "lł", d: "dđ",
};

/** A pattern that matches the text with or without accents: "Mäkelä" also finds "Makela". Case is kept. */
export function accentFree(text: string): string {
  return [...text]
    .map((char) => {
      const base = char.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
      const variants = ACCENTS[base];
      if (!variants) return escape(char);
      return `[${char === char.toUpperCase() ? variants.toUpperCase() : variants}]`;
    })
    .join("");
}

/** Makes the first letter of each alternative case-free without the `i` flag, which would also loosen \p{Lu}. */
export function caseless(alternatives: string): string {
  return alternatives
    .split("|")
    .map((alt) => alt.replace(/^\p{L}/u, (c) => (c.toLowerCase() === c.toUpperCase() ? c : `[${c.toLowerCase()}${c.toUpperCase()}]`)))
    .join("|");
}

function emptyReport(): RedactionReport {
  return { names: 0, contacts: 0, places: 0, schools: 0, employers: 0, other: 0 };
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

/** Fenced and inline code, kept apart so prose rules never touch names in code ("name: retry_count"). */
const CODE_SPANS = /(```[\s\S]{0,20000}?```|`[^`\n]{1,200}`)/;

/** Runs `apply` on the prose between code spans only, and adds what it hid to the report. */
export function inProse(r: Redactor, apply: (prose: Redactor) => void): void {
  r.text = r.text
    .split(CODE_SPANS)
    .map((part, i) => {
      if (i % 2 === 1) return part;
      const prose = new Redactor(part);
      apply(prose);
      r.report = addReports(r.report, prose.report);
      return prose.text;
    })
    .join("");
}

export class Redactor {
  report = emptyReport();
  constructor(public text: string) {}

  /** Replaces each match, or only its first capture group when the pattern has one. Word edges are Unicode-aware. */
  replace(pattern: RegExp, bucket: Bucket, accept: (match: string) => boolean = () => true): void {
    this.text = this.text.replace(unicodeWords(pattern), (whole: string, ...rest: unknown[]) => {
      const group = typeof rest[0] === "string" ? rest[0] : undefined;
      const target = group ?? whole;
      if (!target.trim() || target.includes(HIDDEN) || !accept(target)) return whole;
      this.report[bucket] += 1;
      return group === undefined ? HIDDEN : whole.replace(group, HIDDEN);
    });
  }
}
