import { describe, expect, it } from "vitest";
import { protectedNames, workingLanguage } from "./protected";

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

  it("turns a working language into a neutral line, never a native one", () => {
    expect(workingLanguage("works in Finnish with customers")).toBe("Working language: Finnish");
    expect(workingLanguage("työkieli on ruotsi")).toBe("Working language: Swedish");
    expect(workingLanguage("native Finnish speaker who works in Finnish")).toBeUndefined();
  });
});
