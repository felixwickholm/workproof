import type { CityOverview, Company, EmployerHome, PassportEntry, ReviewQueue, SeekerHome, TableProof } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { withReviewers } from "../reviewers";
import { clock } from "../support";
import { buildCityOverview } from "./city";
import { buildEmployerHome } from "./employer";
import { buildPassport } from "./passport";
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
