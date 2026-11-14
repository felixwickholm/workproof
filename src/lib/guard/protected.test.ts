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
];

const NEUTRAL = [
  "API design and error handling", "latency under 30 ms", "at least 30 days of data", "the native unit of the sensor",
  "React Native app", "single-page app", "a single replica", "the race condition in booking", "local storage", "local-first app",
  "senior engineer", "works in Finnish with customers", "children's lessons in year 5", "the data quality checks", "white paper",
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
