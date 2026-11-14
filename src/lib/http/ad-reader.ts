import { jobFacts } from "@/lib/guard/job-facts";

/**
 * Reads a job ad by its structure, the way a person skims one: the role from the first heading, the work
 * from the list under a "what you will do" heading, the asks from the list under a "what we look for"
 * heading. "About us", "We offer", how to apply and contact lines are left out, and a heading is never an
 * item. English, Finnish and Swedish headings are known. The result is plain text only.
 */
export interface JobAd {
  /** The role, from the first main heading, else from the page title. */
  title: string;
  /** What the person will do. */
  duties: string[];
  /** What the company asks for, wishes about the person included: the drafter sets those aside. */
  requirements: string[];
  /** Sentences outside both lists that state a job fact, such as "Work language English". */
  facts: string[];
}

type Section = "duties" | "requirements" | "skip" | "other";

type Block = { kind: "heading"; level: number; text: string } | { kind: "item" | "text"; text: string };

/** Most items one list keeps: real ads rarely list more, and a page with more is usually a menu. */
const MAX_ITEMS = 12;
/** A line longer than this is a paragraph that lost its tags, not one item. */
const MAX_ITEM_LENGTH = 240;
/** A bold line or a line ending in ":" this short reads as a heading. */
const MAX_HEADING_WORDS = 8;

/** Headings of parts that never describe the work: the company, the offer, how to apply, contacts. */
const SKIP = new RegExp(
  [
    "about (?:us|the company|our company|the team)", "who we are", "our (?:company|story|culture|values)", "the company", "we offer", "what we offer",
    "offer you", "you(?:'ll| will) get(?! to)", "in return", "benefits", "perks", "why (?:join|work)", "salary", "compensation", "apply", "application",
    "contact", "questions", "more information", "further information", "next steps", "recruitment process",
    "meistä", "yrityksestä", "yritys", "tarjoamme", "tarjoa", "edut", "palkka", "hae\\b", "hakeminen", "haku", "hakemus", "lisätie", "yhteystied",
    "om oss", "vi erbjuder", "förmåner", "lön", "ansökan", "ansök", "kontakt",
  ].join("|"),
  "iu",
);

/** Headings over what the company asks of the person. */
const REQUIREMENTS = new RegExp(
  [
    "look(?:ing)? for", "requirements?", "required", "qualifications?", "you have", "you bring", "you(?:'ll| will) bring", "who you are", "about you",
    "we expect", "we hope", "we value", "we wish", "must[- ]haves?", "nice[- ]to[- ]haves?", "skills", "competenc", "experience", "profile",
    "your background", "ideal candidate", "you are", "you need",
    "odotamme", "vaatimu", "edellytä", "toivomme", "arvostamme", "osaami", "sinulla on", "sinulta", "kelpoisuus", "pätevyy", "meriit",
    "vi söker", "vi förväntar", "krav", "du har", "kvalifikation", "kompetens",
  ].join("|"),
  "iu",
);

/** Headings over the work itself. */
const DUTIES = new RegExp(
  [
    "what you(?:'ll| will) do", "get to do", "you will", "you(?:'ll)? work on", "your (?:role|tasks|work|job|day|responsibilities|mission)", "responsibilit",
    "the role", "in this role", "role description", "job description", "the job", "duties", "tasks", "day[- ]to[- ]day", "what the work is",
    "tehtäv", "työnkuva", "vastuualue", "työssä", "arbetsuppgift", "uppgifter", "rollen",
  ].join("|"),
  "iu",
);

/** What a heading introduces. Parts to skip are checked first, so "What you will get" is an offer. */
export function sectionOf(heading: string): Section {
  const text = heading.toLowerCase().replace(/[’‘]/gu, "'").replace(/[:.!?\s]+$/u, "");
  if (SKIP.test(text)) return "skip";
  if (REQUIREMENTS.test(text)) return "requirements";
  if (DUTIES.test(text)) return "duties";
  return "other";
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", hellip: "…", rsquo: "’", lsquo: "‘" };

function decode(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (whole, name: string) => ENTITIES[name.toLowerCase()] ?? whole);
}

const squash = (text: string) => decode(text).replace(/\s+/g, " ").trim();

/** Elements whose content is never part of the ad: code, menus, footers, forms. */
const DROPPED = /<(script|style|noscript|template|svg|nav|footer|aside|form|button|select|iframe)\b[\s\S]*?<\/\1\s*>/gi;

/** Tags that end a line of text. */
const BLOCK_TAGS = new Set([
  "p", "div", "section", "article", "main", "header", "ul", "ol", "li", "dl", "dt", "dd", "table", "tr", "td", "th", "blockquote", "br", "hr",
  "h1", "h2", "h3", "h4", "h5", "h6", "body", "html",
]);

/** A line that starts with a bullet sign is a list item, even outside a list. */
const BULLET = /^[•·▪●◦*–—-]\s+/u;

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;

/** The page as lines in reading order: headings with their level, list items and plain text. */
function blocksOf(html: string): Block[] {
  const body = html.replace(/<!--[\s\S]*?-->/g, " ").replace(DROPPED, " ");
  const blocks: Block[] = [];
  let buffer = "";
  let bold = "";
  let heading = 0;
  let listDepth = 0;
  let boldDepth = 0;

  const flush = () => {
    const text = squash(buffer);
    const boldText = squash(bold);
    buffer = "";
    bold = "";
    if (text.length < 2) return;
    if (heading > 0) blocks.push({ kind: "heading", level: heading, text });
    else if (listDepth > 0) blocks.push({ kind: "item", text });
    else if (BULLET.test(text)) blocks.push({ kind: "item", text: text.replace(BULLET, "") });
    else if ((boldText === text || /:$/.test(text)) && words(text) <= MAX_HEADING_WORDS) blocks.push({ kind: "heading", level: 4, text: text.replace(/:$/, "") });
    else blocks.push({ kind: "text", text });
  };

  for (const part of body.split(/(<[^>]*>)/)) {
    const tag = /^<(\/?)([a-z][a-z0-9]*)\b/i.exec(part);
    if (!tag) {
      buffer += part;
      if (boldDepth > 0) bold += part;
      continue;
    }
    const closing = tag[1] === "/";
    const name = tag[2].toLowerCase();
    if (name === "strong" || name === "b") boldDepth = Math.max(0, boldDepth + (closing ? -1 : 1));
    if (!BLOCK_TAGS.has(name)) continue;
    flush();
    if (/^h[1-6]$/.test(name)) heading = closing ? 0 : Number(name[1]);
    if (name === "li") listDepth = Math.max(0, listDepth + (closing ? -1 : 1));
  }
  flush();
  return splitInlineHeadings(blocks);
}

/** "Tehtävät: teet..." on one line is a heading followed by its text, when the part before the colon is a known heading. */
function splitInlineHeadings(blocks: Block[]): Block[] {
  return blocks.flatMap((block): Block[] => {
    if (block.kind !== "text") return [block];
    const match = /^([^:]{2,40}):\s+(.+)$/u.exec(block.text);
    if (!match || sectionOf(match[1]) === "other") return [block];
    return [{ kind: "heading", level: 4, text: match[1] }, { kind: "text", text: match[2] }];
  });
}

/** Contact details, links and application steps: never part of the work. "Send weekly reports" stays a duty. */
const CONTACT =
  /@|https?:\/\/|www\.|\+?\d[\d\s-]{7,}\d|^(?:apply|hae|ansök)\b|\b(?:send|lähetä|skicka)\b.{0,40}\b(?:cv|resume|application|hakemu\p{L}*|ansökan)|\b(?:apply by|deadline|haku päättyy|contact us|ota yhteyttä)\b/iu;

/** A sentence that offers something to the person, wherever it stands: never a duty or a requirement. */
const OFFER = /^(?:we offer|we provide|we pay|you(?:'ll| will) get(?! to)|in return|tarjoamme|vi erbjuder)\b/iu;

/** A paragraph as sentences, so one sentence can be kept without its neighbours. */
function sentences(text: string): string[] {
  return text.split(/(?<=[.!?])\s+(?=\p{Lu})/u).map((s) => s.trim()).filter(Boolean);
}

/** An item as the company wrote it, without a bullet sign or a closing full stop. */
function tidyItem(text: string): string {
  return text.replace(BULLET, "").replace(/[\s.;,]+$/u, "").trim();
}

const keep = (line: string) => line.length >= 3 && line.length <= MAX_ITEM_LENGTH && !CONTACT.test(line) && !OFFER.test(line);

/** The page title without the site name, the company and notes in brackets: "Data analyst | Example Oy" is "Data analyst". */
function titleFromPage(html: string): string {
  const raw = squash(/<title\b[^>]*>([\s\S]*?)<\/title>/i.exec(html)?.[1] ?? "");
  return raw.split(/\s+[|·–—-]\s+|,\s+/u)[0].replace(/\s*\([^)]*\)\s*/g, " ").trim();
}

function pushNew(list: string[], line: string): void {
  if (list.length < MAX_ITEMS && !list.includes(line)) list.push(line);
}

export function readAd(html: string): JobAd {
  const blocks = blocksOf(html);
  const main = blocks.find((b) => b.kind === "heading" && b.level === 1) ?? blocks.find((b) => b.kind === "heading" && b.level <= 2 && sectionOf(b.text) === "other");
  const title = main?.text ?? titleFromPage(html);
  const ad: JobAd = { title, duties: [], requirements: [], facts: [] };
  // Items outside any known part, used only when the ad has no "do" or "look for" heading at all.
  const loose: string[] = [];
  let section: Section = "other";
  let sectionLevel = 0;

  for (const block of blocks) {
    if (block === main) continue;
    if (block.kind === "heading") {
      const next = sectionOf(block.text);
      // A smaller heading that names no part ("Technical" under "What we look for") belongs to the part above it.
      if (next === "other" && section !== "other" && block.level > sectionLevel) continue;
      section = next;
      sectionLevel = block.level;
      continue;
    }
    if (section === "skip") continue;
    const lines = block.kind === "item" ? [tidyItem(block.text)] : sentences(block.text).map(tidyItem);
    for (const line of lines.filter(keep)) {
      if (section === "duties" || section === "requirements") pushNew(ad[section], line);
      else if (jobFacts(line).length > 0) pushNew(ad.facts, line);
      else if (block.kind === "item") pushNew(loose, line);
    }
  }
  if (ad.duties.length === 0 && ad.requirements.length === 0) ad.requirements.push(...loose);
  return ad;
}
