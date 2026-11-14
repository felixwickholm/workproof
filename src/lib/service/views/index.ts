import type { CityOverview, Company, EmployerHome, PassportEntry, ReviewQueue, SeekerHome } from "@/lib/domain/types";
import { getStore } from "@/lib/store";
import { clock } from "../support";
import { buildCityOverview } from "./city";
import { buildEmployerHome } from "./employer";
import { buildPassport } from "./passport";
import { buildQueue } from "./queue";
import { buildSeekerHome } from "./seeker";

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

export async function listCompanies(): Promise<Company[]> {
  return (await getStore().read()).companies;
}

/** The talent id is the person's private key: only they can open their home. */
export async function getSeekerHome(talentId: string): Promise<SeekerHome> {
  return buildSeekerHome(await getStore().read(), talentId, clock.now());
}

export async function getEmployerHome(companyId: string): Promise<EmployerHome> {
  return buildEmployerHome(await getStore().read(), companyId, clock.now());
}
