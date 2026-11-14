import type { Challenge, Company, OwnProof, Skill } from "@/lib/domain/types";
import type { StoreData } from "@/lib/store";

/** A small, hand-built event for the view tests. Every number the tests expect can be counted here by hand. */
export const NOW = new Date("2026-11-14T12:00:00.000Z");

export const PRIVATE = { olena: "t_olena_private_9c1e", sam: "t_sam_private_4b7d" };

const skill = (id: string, label: string): Skill => ({ id, label, why: "" });
const TRIAGE = skill("triage", "Triage");
const PLANNING = skill("planning", "Planning");
const TALK = skill("communication", "Communication");

/** Each company's registered reviewers, as the seed registers them. */
const REVIEWERS: Record<string, string[]> = { "co-kaari": ["Anna Koivisto"], "co-otso": ["Henrik Lund"], "co-kivira": ["Tomas Berg"] };

const company = (id: string, name: string, sector: string, district: Company["district"]): Company => ({
  id,
  name,
  reviewers: REVIEWERS[id] ?? [],
  blurb: "",
  sector,
  district,
  size: "40 people",
  workLanguage: "Finnish and English",
  finnishNeeded: false,
  permitSupport: true,
  relocationHelp: false,
});

const task = (id: string, companyIds: string[], proofKind: Challenge["proofKind"], skills: Skill[], createdAt: string, setAside: string[] = []): Challenge => ({
  id,
  companyIds,
  title: `Task ${id}`,
  need: "",
  coreSkills: skills,
  setAside,
  format: "make",
  proofKind,
  minutes: 20,
  brief: "",
  deliverable: "",
  reviewGuide: [],
  aiAllowed: true,
  kind: "event",
  approvedBy: "A Reviewer",
  createdAt,
});

const proof = (proofId: string, challenge: Challenge, submittedAt: string, hiddenCount: number): OwnProof => ({
  proofId,
  label: `Proof ${proofId.toUpperCase()}`,
  challengeId: challenge.id,
  challengeTitle: challenge.title,
  skills: challenge.coreSkills,
  proofKind: challenge.proofKind,
  work: "Work",
  explain: [],
  glance: "",
  hiddenCount,
  redactions: { names: hiddenCount, contacts: 0, places: 0, schools: 0, employers: 0, other: 0 },
  submittedAt,
});

export function sampleEvent(): StoreData {
  const a = task("ch-a", ["co-kaari"], "plan", [TRIAGE, PLANNING, TALK], "2026-11-09T00:00:00.000Z", ["Driving licence", "Five years"]);
  const b = task("ch-b", ["co-otso"], "writing", [TRIAGE, TALK, skill("plain-language", "Plain language")], "2026-11-12T00:00:00.000Z");
  const pool = task("ch-pool", ["co-kaari", "co-kivira"], "code", [PLANNING, skill("sql", "SQL"), skill("testing", "Testing")], "2026-11-10T00:00:00.000Z");
  const taster: Challenge = { ...task("taster-1", [], "writing", [skill("taste", "Taste")], "2026-11-14T09:00:00.000Z"), kind: "taster", approvedBy: undefined };
  const submission = (id: string, challengeId: string, talentId: string, submittedAt: string, shareWithSimilar: boolean) => ({
    id,
    challengeId,
    talentId,
    answer: "Work",
    explain: [],
    shareWithSimilar,
    submittedAt,
  });
  return {
    version: 1,
    event: { name: "Espoo Talent Day", date: "2026-11-14", responseWindowHours: 48 },
    companies: [
      company("co-kaari", "Kaari Home Care", "Home care", "Matinkylä"),
      company("co-otso", "Otso Health", "Occupational health", "Tapiola"),
      company("co-kivira", "Kivira Labs", "Payments software", "Keilaniemi"),
    ],
    challenges: [a, b, pool, taster],
    talents: [
      { id: PRIVATE.olena, name: "Olena Kovalenko", contact: "olena@example.org", locked: true },
      { id: PRIVATE.sam, name: "Sam Example", contact: "sam@example.org", locked: true },
    ],
    submissions: [
      submission("p1", "ch-a", PRIVATE.olena, "2026-11-13T10:00:00.000Z", true),
      submission("p2", "ch-b", PRIVATE.olena, "2026-11-12T10:00:00.000Z", true),
      submission("p3", "ch-a", PRIVATE.sam, "2026-11-11T10:00:00.000Z", false),
      submission("p4", "ch-pool", PRIVATE.sam, "2026-11-14T08:00:00.000Z", false),
      submission("p5", "taster-1", PRIVATE.sam, "2026-11-14T09:30:00.000Z", false),
    ],
    proofs: [
      proof("p1", a, "2026-11-13T10:00:00.000Z", 7),
      proof("p2", b, "2026-11-12T10:00:00.000Z", 2),
      proof("p3", a, "2026-11-11T10:00:00.000Z", 1),
      proof("p4", pool, "2026-11-14T08:00:00.000Z", 0),
      proof("p5", taster, "2026-11-14T09:30:00.000Z", 3),
    ],
    decisions: [
      { id: "d1", proofId: "p1", companyId: "co-kaari", reviewer: "Anna Koivisto", decision: "meet", feedback: "You saw the blood thinner risk.", decidedAt: "2026-11-14T10:00:00.000Z" },
      { id: "d2", proofId: "p2", companyId: "co-otso", reviewer: "Henrik Lund", decision: "pass", feedback: "Clear letter; we hire in spring.", decidedAt: "2026-11-13T06:00:00.000Z" },
      { id: "d3", proofId: "p3", companyId: "co-kaari", reviewer: "Anna Koivisto", decision: "meet", feedback: "Good plan.", decidedAt: "2026-11-12T00:00:00.000Z" },
    ],
    meetings: [
      { id: "m1", proofId: "p1", companyId: "co-kaari", slot: "Sat 13:00, Table 1", status: "invited", talentConfirmedMet: false, companyConfirmedMet: false },
      { id: "m3", proofId: "p3", companyId: "co-kaari", slot: "Sat 14:00, Table 2", status: "met", talentConfirmedMet: true, companyConfirmedMet: true },
    ],
    audit: [],
    demo: { personaTalentId: PRIVATE.olena, personaName: "Olena Kovalenko", stage: "invited" },
  };
}

/** Strings that must never reach a company or the city. */
export const IDENTITY = [PRIVATE.olena, PRIVATE.sam, "Olena", "Kovalenko", "Sam Example", "example.org"];
