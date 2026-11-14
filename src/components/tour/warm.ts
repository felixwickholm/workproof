import { api, companyApi } from "@/lib/client/api";

/** What a page asks the server for when it opens, so the tour can ask first. */
interface WarmIds {
  talentId: string;
  companyId: string;
}

/** One read a tour page makes on arrival, by the client call it uses. */
type WarmCall =
  | { call: "seekerHome" | "companies" | "companyHome" | "queue" | "city" }
  | { call: "challenge"; id: string };

const plain = (...calls: Exclude<WarmCall, { id: string }>["call"][]): WarmCall[] => calls.map((call) => ({ call }));

/**
 * The read requests each tour page makes on arrival, keyed by where its route starts. Asking them
 * one step ahead means the server has built them before the tour moves on.
 */
export function warmCalls(route: string | undefined): WarmCall[] {
  if (!route) return [];
  const challenge = /^\/challenges\/([^/]+)/.exec(route);
  if (challenge) return [{ call: "challenge", id: decodeURIComponent(challenge[1]) }];
  // "/" is Mikko's home, the same screen as "/seeker".
  if (route === "/" || route.startsWith("/seeker") || route.startsWith("/my-work")) return plain("seekerHome", "companies");
  if (route.startsWith("/employer")) return plain("companyHome", "companies");
  if (route.startsWith("/company/review")) return plain("queue", "companies");
  if (route.startsWith("/company")) return plain("companies");
  if (route.startsWith("/city")) return plain("city");
  return [];
}

/** True for a call that carries the person's key, which a new story stage replaces. */
export const usesTalentKey = (warm: WarmCall) => warm.call === "seekerHome";

/** Makes one warm call through the same client the pages use, so its path and key header match. */
export function runWarmCall(warm: WarmCall, ids: WarmIds): Promise<unknown> {
  switch (warm.call) {
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
    case "challenge":
      return api.challenge(warm.id);
  }
}
