import { api, cityApi, companyApi } from "@/lib/client/api";
import type { CityActions } from "@/lib/service/city-actions";

/** The person at the city who acts in this demo. */
export const CITY_ACTOR = "City of Espoo";

async function loadActions(): Promise<CityActions> {
  const response = await fetch("/api/city/actions", { cache: "no-store" });
  if (!response.ok) throw new Error(`The reminders did not load (${response.status}).`);
  return (await response.json()) as CityActions;
}

/** Everything the city reads and does, in one place for the city's pages. */
export const citySource = {
  overview: () => api.city(),
  challenges: () => api.challenges(),
  actions: loadActions,
  task: cityApi.task,
  matches: cityApi.matches,
  recommend: cityApi.recommend,
  /** A link is read as a job ad; anything else is the company's need in one sentence. */
  draft: (input: string) => (/^https?:\/\//i.test(input) ? companyApi.fromAd(input) : companyApi.draft(input)),
  publishForCompany: cityApi.publishForCompany,
};
