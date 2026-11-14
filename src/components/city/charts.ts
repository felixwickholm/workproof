import { placesOf } from "@/lib/domain/places";
import type { Challenge, Company, ImpactCounts, TaskImpact } from "@/lib/domain/types";
import { funnelSteps, HIRED_LABEL } from "./impact";

/** One bar of the event funnel: its words, its count and its length against the first step. */
export interface FunnelBar {
  key: keyof ImpactCounts;
  label: string;
  value: number;
  /** 0 to 1, against "Took a challenge". */
  share: number;
  /** "about 2 in 3" of the step before, or null where a share would mislead. */
  ofBefore: string | null;
}

/** A length from 0 to 1 against the largest value; a zero stays zero. */
export function lengthOf(value: number, max: number): number {
  if (max <= 0 || value <= 0) return 0;
  return Math.min(1, value / max);
}

/** The funnel from challenges taken to hires, as bars measured against the first step. */
export function funnelBars(counts: ImpactCounts): FunnelBar[] {
  const steps = funnelSteps(counts);
  const max = Math.max(counts.took, ...steps.map((s) => s.value), counts.hires);
  return [
    ...steps.map((s) => ({ key: s.key, label: s.label, value: s.value, share: lengthOf(s.value, max), ofBefore: s.share })),
    { key: "hires" as const, label: HIRED_LABEL, value: counts.hires, share: lengthOf(counts.hires, max), ofBefore: null },
  ];
}

/**
 * The role a challenge is for: the words before the colon in its need ("Data scientist: data quality, ...").
 * The need is rebuilt from the role by the drafter, so this is the role as the company chose it.
 */
export function roleOf(need: string): string {
  const head = need.split(":")[0]?.trim() ?? "";
  if (!head || head === need.trim()) return "Other roles";
  return head.charAt(0).toUpperCase() + head.slice(1);
}

export interface RoleDemand {
  role: string;
  /** Places the companies opened: how many answers they will read. */
  places: number;
  challenges: number;
  /** Work handed in for these challenges. */
  took: number;
}

/**
 * Roles in demand, measured by the places companies opened for them, largest first. Past `limit` roles the
 * rest fold into "Other roles" so the chart never needs more rows than it can show.
 */
export function rolesInDemand(challenges: readonly Challenge[], tasks: readonly TaskImpact[], limit = 6): RoleDemand[] {
  const took = new Map(tasks.map((t) => [t.challengeId, t.took]));
  const byRole = new Map<string, RoleDemand>();
  for (const c of challenges) {
    const role = roleOf(c.need);
    const row = byRole.get(role) ?? { role, places: 0, challenges: 0, took: 0 };
    row.places += placesOf(c) ?? 0;
    row.challenges += 1;
    row.took += took.get(c.id) ?? 0;
    byRole.set(role, row);
  }
  const sorted = [...byRole.values()].sort((a, b) => b.places - a.places || b.took - a.took || a.role.localeCompare(b.role));
  if (sorted.length <= limit) return sorted;
  const rest = sorted.slice(limit - 1).reduce(
    (sum, r) => ({ role: "Other roles", places: sum.places + r.places, challenges: sum.challenges + r.challenges, took: sum.took + r.took }),
    { role: "Other roles", places: 0, challenges: 0, took: 0 },
  );
  return [...sorted.slice(0, limit - 1), rest];
}

export interface CompanyScoring {
  companyId: string;
  name: string;
  scored: number;
  waiting: number;
}

/**
 * Scored and waiting work per company, the companies with most waiting first. A challenge shared by two
 * companies counts for each, because each of them reads it.
 */
export function scoredByCompany(companies: readonly Company[], tasks: readonly TaskImpact[]): CompanyScoring[] {
  return companies
    .map((c) => {
      const own = tasks.filter((t) => t.companies.includes(c.name));
      const scored = own.reduce((n, t) => n + t.scored, 0);
      const took = own.reduce((n, t) => n + t.took, 0);
      return { companyId: c.id, name: c.name, scored, waiting: Math.max(0, took - scored) };
    })
    .filter((c) => c.scored + c.waiting > 0)
    .sort((a, b) => b.waiting - a.waiting || b.scored - a.scored || a.name.localeCompare(b.name));
}

/** An ISO time as its day in Espoo, "2026-11-09". */
const espooDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Helsinki" });
export function dayOf(iso: string): string {
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? "" : espooDay.format(parsed);
}

export interface CompanyTimeline {
  companyId: string;
  name: string;
  /** Challenges published on each day of the axis, in axis order. */
  perDay: number[];
  /** Challenges published before the axis starts. */
  earlier: number;
  /** Work handed in for this company's challenges. */
  took: number;
}

/**
 * When each company published its challenges, on the same days as the work chart, with the work its
 * challenges got. Companies without a challenge are left out; the earliest publisher comes first.
 */
export function companyTimelines(companies: readonly Company[], challenges: readonly Challenge[], tasks: readonly TaskImpact[], days: readonly string[]): CompanyTimeline[] {
  const first = days[0] ?? "";
  const rows: CompanyTimeline[] = [];
  const starts = new Map<string, string>();
  for (const company of companies) {
    const own = challenges.filter((c) => c.companyIds.includes(company.id));
    if (own.length === 0) continue;
    const perDay = days.map(() => 0);
    let earlier = 0;
    let start = "9999";
    for (const c of own) {
      const day = dayOf(c.createdAt);
      if (day < start) start = day;
      const at = days.indexOf(day);
      if (at >= 0) perDay[at] += 1;
      else if (day < first) earlier += 1;
    }
    const took = tasks.filter((t) => t.companies.includes(company.name)).reduce((n, t) => n + t.took, 0);
    rows.push({ companyId: company.id, name: company.name, perDay, earlier, took });
    starts.set(company.id, start);
  }
  return rows.sort((a, b) => (starts.get(a.companyId) ?? "").localeCompare(starts.get(b.companyId) ?? "") || a.name.localeCompare(b.name));
}

const weekday = new Intl.DateTimeFormat("en-GB", { weekday: "short", timeZone: "UTC" });

/** An axis label for an ISO day: "Sat 7", or "Event" on the event day. */
export function dayLabel(day: string, eventDay: string): string {
  if (day === eventDay) return "Event";
  const parsed = new Date(`${day}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return day;
  return `${weekday.format(parsed)} ${parsed.getUTCDate()}`;
}
