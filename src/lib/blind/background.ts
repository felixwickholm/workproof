import { FINNISH_CITY_STEMS, KNOWN_EMPLOYERS, NOT_EMPLOYERS, PLACES, SCHOOLS, SCHOOLS_ANY_CASE } from "./lexicon";
import { addReports, alternation, CAP, caseless, L, R, Redactor } from "./redactor";

/** Words after which a lowercase place or employer from the lists is still a place or employer. */
const BEFORE_PLACE = "(?:at|in|from|for|to|near|i|från|aus|de|en)";

/** Sentences about studying: any school from the list is hidden there, in any case ("studied at lut"). */
const STUDY = /\b(?:stud(?:y|ied|ying|ies)|graduat\w*|degree|exchange|alumn\w*|bachelor'?s|master'?s|msc|bsc|phd|opiskel\p{L}*|valmistu\p{L}*|tutkin\p{L}*|studera\p{L}*|examen)\b/iu;

/** Explicit work phrases. Only these mark an employer, so "at Scale" or "for Approval" stay. */
const WORK_PHRASES = [
  "worked at", "worked for", "work at", "work for", "working at", "working for", "works at", "works for",
  "employed by", "employed at", "my employer is", "my employer", "colleagues at", "interned at", "intern at",
  "internship at", "formerly at", "previously at", "joined", "job at", "position at", "role at",
  "töissä", "työskentelen", "työskentelin", "työskentelee", "jobbar på", "jobbade på", "arbetar på", "arbetade på",
  "arbeite bei", "arbeitete bei", "trabajo en", "trabajé en", "je travaille chez", "j'ai travaillé chez",
].join("|").replace(/ /g, "\\s+");
const WORK = caseless(WORK_PHRASES);

/** Residence and origin phrases: "I live in Lohja", "grew up in Rauma", "asun Lohjalla". */
const HOME_PHRASES = caseless("live in|lives in|living in|lived in|grew up in|moved from|moved to|moved here from|relocated from|based in|born in|raised in|i'm from|i am from|come from|comes from|originally from|asun|asuin|asuu|kotoisin|muutin|bor i|bodde i|kommer från|wohne in|komme aus|vivo en|soy de|j'habite à|je viens de");

const notEmployer = (name: string) => !NOT_EMPLOYERS.has(name.split(/\s+/)[0]);

function redactSchools(r: Redactor): void {
  r.replace(new RegExp(`${L}(?:University of(?: Applied Sciences)?(?:\\s+${CAP}){1,3})`, "gu"), "schools");
  r.replace(new RegExp(`${L}(?:${CAP}\\s+){1,3}(?:University of Applied Sciences|University|Uni|Institute of Technology|Polytechnic|College|Business School|School of [\\p{L}]+(?: and [\\p{L}]+)?|Academy)${R}`, "gu"), "schools");
  r.replace(new RegExp(`${L}(?:\\p{L}+\\s+)?(?:yliopisto|ammattikorkeakoulu|korkeakoulu|högskola|universitet)\\p{L}*`, "giu"), "schools");
  r.replace(new RegExp(`${L}(?:${alternation(SCHOOLS)})${R}`, "gu"), "schools");
  r.replace(new RegExp(`${L}(?:${alternation(SCHOOLS_ANY_CASE)})${R}`, "giu"), "schools");
  // In sentences about studying, short school names in any case: "aalto university and lut".
  const anyCase = new RegExp(`${L}(?:${alternation(SCHOOLS)}|\\p{L}+\\s+(?:university|uni))${R}`, "giu");
  r.text = r.text
    .split(/(?<=[.!?\n])/)
    .map((sentence) => {
      if (!STUDY.test(sentence)) return sentence;
      const sub = new Redactor(sentence);
      sub.replace(anyCase, "schools");
      r.report = addReports(r.report, sub.report);
      return sub.text;
    })
    .join("");
}

function redactPlaces(r: Redactor): void {
  const places = alternation(PLACES);
  const stems = alternation(FINNISH_CITY_STEMS);
  const lowerStems = alternation(FINNISH_CITY_STEMS.filter((stem) => stem.length >= 5));
  r.replace(new RegExp(`${L}(?:${places})${R}`, "gu"), "places");
  r.replace(new RegExp(`${L}(?:${stems})\\p{L}*${R}`, "gu"), "places");
  // Lowercase list places only after a place word: "I live in espoo".
  r.replace(new RegExp(`${L}${BEFORE_PLACE}\\s+((?:${places})|(?:${lowerStems})\\p{L}*)${R}`, "giu"), "places");
  // Any capitalised name after a home phrase: "I live in Rauma", "asun Lohjalla".
  r.replace(new RegExp(`(?:${HOME_PHRASES})\\s+(${CAP}(?:\\s+${CAP})?)`, "gu"), "places", notEmployer);
}

function redactEmployers(r: Redactor): void {
  r.replace(new RegExp(`${L}(${CAP}(?:\\s+${CAP}){0,2}\\s+(?:Oyj|Oy|Ab|AB|Ltd|Inc|GmbH|AS|ASA|LLC|Corp|Group))${R}`, "gu"), "employers");
  const known = alternation(KNOWN_EMPLOYERS);
  r.replace(new RegExp(`${L}(?:${known})${R}`, "gu"), "employers");
  r.replace(new RegExp(`${L}(?:${BEFORE_PLACE}|ex-|former|previously)\\s*((?:${known}))${R}`, "giu"), "employers");
  r.replace(new RegExp(`${L}ex-(${CAP})`, "gu"), "employers", notEmployer);
  r.replace(new RegExp(`(?:${WORK})\\s+(${CAP}(?:\\s+${CAP}){0,2})`, "gu"), "employers", notEmployer);
}

/** Schools before places, so "University of Helsinki" counts as a school; then places and employers. */
export function redactBackground(r: Redactor): void {
  redactSchools(r);
  redactPlaces(r);
  redactEmployers(r);
}
