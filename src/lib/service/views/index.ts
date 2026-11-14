import type { CityOverview, CityTaskView, Company, CompanyTaskSummary, EmployerHome, PassportEntry, Portfolio, RelatedPart, ReviewQueue, SeekerHome, ShareMatch, TableProof, TopProofs } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { withReviewers } from "../reviewers";
import { relatedParts } from "../related";
import { clock, findOrThrow, ServiceError } from "../support";
import { buildCityOverview } from "./city";
import { buildCityTask, shareMatches } from "./city-task";
import { buildCompanyTasks, buildTopProofs } from "./leaderboard";
import { buildEmployerHome } from "./employer";
import { buildPassport } from "./passport";
import { buildPortfolio, buildSharedPortfolio } from "./portfolio";
import { buildQueue } from "./queue";
import { buildSeekerHome } from "./seeker";
import { buildTableProofs } from "./table";

export { buildQueue } from "./queue";

export async function getQueue(companyId: string): Promise<ReviewQueue> {
  return buildQueue(await getStore().read(), companyId, clock.now());
}

export async function getPassport(talentId: string): Promise<PassportEntry[]> {
  return buildPassport(await getStore().read(), talentId, clock.now());
}

/** The person's portfolio: every finished event task, newest first. The talent id is their private key. */
export async function getPortfolio(talentId: string): Promise<Portfolio> {
  return buildPortfolio(await getStore().read(), talentId);
}

/** What one shared link shows. No name, contact or key. */
export async function getSharedPortfolio(token: string): Promise<Portfolio> {
  return buildSharedPortfolio(await getStore().read(), token);
}

export async function getCityOverview(): Promise<CityOverview> {
  return buildCityOverview(await getStore().read());
}

/** Every company with the people registered to decide for it. */
export async function listCompanies(): Promise<Company[]> {
  return (await getStore().read()).companies.map(withReviewers);
}

/** The talent id is the person's private key: only they can open their home. */
export async function getSeekerHome(talentId: string): Promise<SeekerHome> {
  return buildSeekerHome(await getStore().read(), talentId, clock.now());
}

export async function getEmployerHome(companyId: string): Promise<EmployerHome> {
  return buildEmployerHome(await getStore().read(), companyId, clock.now());
}

/** Practice proofs sent in this sandbox, for the public table screen: labels and tasks, never the words. */
export async function getTableProofs(): Promise<TableProof[]> {
  return buildTableProofs(await getStore().read());
}

/** The leaderboard for one of a company's tasks. */
export async function getTopProofs(companyId: string, taskId: string): Promise<TopProofs> {
  return buildTopProofs(await getStore().read(), companyId, taskId);
}

export async function getCompanyTasks(companyId: string): Promise<CompanyTaskSummary[]> {
  return buildCompanyTasks(await getStore().read(), companyId);
}

/** One task for the city: counts and labels with totals, never a name. */
export async function getCityTask(challengeId: string): Promise<CityTaskView> {
  return buildCityTask(await getStore().read(), challengeId);
}

export async function getShareMatches(challengeId: string): Promise<ShareMatch[]> {
  return shareMatches(await getStore().read(), challengeId);
}

/**
 * Where each skill shows up in one proof, for a company that may read it now: its own task, Second look,
 * a recommendation, or a proof it already answered and still may read.
 */
export async function getRelatedParts(proofId: string, companyId: string): Promise<RelatedPart[]> {
  const data = await getStore().read();
  const queue = buildQueue(data, companyId, clock.now());
  const readable = [...queue.proofs, ...queue.secondLook, ...queue.recommended, ...queue.decided.filter((d) => !d.withdrawn).map((d) => d.proof)];
  const proof = readable.find((p) => p.proofId === proofId);
  if (!proof) throw new ServiceError(403, `This proof is not in the queue of ${queue.company.name}`);
  return relatedParts(proof, findOrThrow(data.challenges, (c) => c.id === proof.challengeId, "Challenge"));
}
