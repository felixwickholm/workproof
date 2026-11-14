import { describe, expect, it } from "vitest";
import { protectedNames } from "./protected";

const PROTECTED = [
  "young", "under 30", "under forty, male", "over 50 years", "max 25 years old", "millennial", "Gen Z", "digital native",
  "recent graduate", "fresh grad", "energetic", "mature", "senior citizen", "nuori", "nuorta", "alle 35", "vastavalmistunut",
  "female", "a strong guy", "he should", "nainen", "family man", "no kids", "pregnant", "married", "perheetön",
  "Finnish citizen", "born in Finland", "local", "lives in Espoo", "suomalainen", "Christian", "muslim",
  "native Finnish speaker", "mother tongue Finnish", "first language", "äidinkielenään suomi", "modersmål svenska", "Finnish-speaking",
  "top university", "Aalto graduate", "photo with application", "pleasant appearance", "attractive", "healthy", "no disabilities",
  "culture fit", "fits our culture", "military service", "varusmiespalvelus suoritettu", "single",
  // Added from a second independent review.
  "date of birth", "sex: male", "marital status", "plans to have children", "no career gaps", "clean-shaven",
  "accent-free English", "born and raised here", "Nordic passport", "suorittanut asepalveluksen", "jolla ei ole perhettä",
  "född i Finland", "inte har småbarn", "Finnish-sounding surname", "wears a headscarf", "no tattoos", "under thirty-five",
  "35 or younger", "aged between 25 and 35", "pre-retirement", "recent photo",
  // Character tricks and code.
  "yоung", "you\u200bng", "ｙｏｕｎｇ", "y o u n g", "We want a y o u n g person", "y0ung", "candidate.sex === 'M'", "applicant.isMale", "birth_year > 1995",
];

const NEUTRAL = [
  "API design and error handling", "latency under 30 ms", "at least 30 days of data", "the native unit of the sensor",
  "React Native app", "single-page app", "a single replica", "the race condition in booking", "local storage", "local-first app",
  "senior engineer", "works in Finnish with customers", "children's lessons in year 5", "the data quality checks", "white paper",
  "Check the man page for rsync", "Passport.js login strategy", "the accent colour of the button", "font-weight: 600",
  "a photo upload feature", "<h3>Totals</h3>", "s3 bucket and ec2 instance", "x86 and arm64 builds", "the k8s cluster",
];

describe("protected attributes", () => {
  it.each(PROTECTED)("finds %s", (text) => {
    expect(protectedNames(text).length).toBeGreaterThan(0);
  });

  it.each(NEUTRAL)("leaves %s", (text) => {
    expect(protectedNames(text)).toEqual([]);
  });

});

/** Words about the people the job serves are context. The same words about the person wanted are a wish. */
const SERVED_CONTEXT = [
  "explain medicine changes to elderly clients and their families",
  "young patients on the children's ward",
  "help senior customers with online banking",
  "work with children in a daycare",
  "older residents in assisted living",
  "elderly care home",
  "care for the elderly",
  "we serve young and old customers",
  "patients who are mostly elderly",
  "retired guests at the spa",
  "female patients at the clinic",
  "iäkkäät asiakkaat",
  "nuoret asiakkaat",
  "ikäihmisten hoito",
  "ikääntyneiden asiakkaiden kotihoito",
  "vanhusten hoito",
  "asiakkaat ovat iäkkäitä",
];

const ABOUT_THE_CANDIDATE = [
  ["young", "age"],
  ["under 35", "age"],
  ["recent graduate", "age"],
  ["young customer service agent", "age"],
  ["young customer-facing sales rep", "age"],
  ["elderly clients, young nurse", "age"],
  ["native speaker", "native language"],
  ["native Finnish speaker for our elderly clients", "native language"],
  ["nuori hoitaja", "age"],
  ["nuori hoitaja iäkkäille asiakkaille", "age"],
  ["male nurse for elderly patients", "gender"],
] as const;

describe("served groups", () => {
  it.each(SERVED_CONTEXT)("reads %s as context, not a wish", (text) => {
    expect(protectedNames(text)).toEqual([]);
  });

  it.each(ABOUT_THE_CANDIDATE)("still finds %s as %s", (text, name) => {
    expect(protectedNames(text)).toContain(name);
  });
});
