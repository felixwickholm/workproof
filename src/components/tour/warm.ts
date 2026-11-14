import { api, companyApi } from "@/lib/client/api";

/** What a page asks the server for when it opens, so the tour can ask first. */
export interface WarmIds {
  talentId: string;
  companyId: string;
}

/** One read a tour page makes on arrival, by the client call it uses. */
export type WarmCall = "seekerHome" | "companies" | "companyHome" | "queue" | "city";

/**
 * The read requests each tour page makes on arrival, keyed by where its route starts. Asking them
 * one step ahead means the server has built them (and, in development, compiled them) before Next.
 */
export function warmCalls(route: string): WarmCall[] {
  if (route.startsWith("/seeker") || route.startsWith("/passport")) return ["seekerHome", "companies"];
  if (route.startsWith("/employer")) return ["companyHome", "companies"];
  if (route.startsWith("/company/review")) return ["queue", "companies"];
  if (route.startsWith("/city")) return ["city"];
  return [];
}

/** True for a call that carries the person's key, which a new story stage replaces. */
export const usesTalentKey = (call: WarmCall) => call === "seekerHome";

/** Makes one warm call through the same client the pages use, so its path and key header match. */
export function runWarmCall(call: WarmCall, ids: WarmIds): Promise<unknown> {
  switch (call) {
    case "seekerHome":
      return api.seekerHome(ids.talentId);
    case "companies":
      return api.companies();
    case "companyHome":
      return companyApi.home(ids.companyId);
    case "queue":
      return companyApi.queue(ids.companyId);
    case "city":
      return api.city();
  }
}
