import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { ServiceError } from "@/lib/service/support";

/**
 * Reads a public job ad for the task drafter. A link typed by a visitor is untrusted, so the server only
 * fetches public https pages: no private, loopback or link-local address, no redirect to another host,
 * at most 300 kB of HTML within 5 seconds. This site's own sample ads under /ads/ are the one exception.
 */

export const AD_TIMEOUT_MS = 5_000;
export const MAX_AD_BYTES = 300 * 1024;
const MAX_REDIRECTS = 3;

export const UNSAFE_LINK = "Use a public https link to a job ad.";
export const UNREADABLE_AD = "The job ad could not be read. Paste one sentence about the work instead.";

export interface AdFetchDeps {
  fetch: typeof fetch;
  /** Every address a host name resolves to. */
  resolve: (host: string) => Promise<string[]>;
}

const defaultAdDeps: AdFetchDeps = {
  fetch: (input, init) => fetch(input, init),
  resolve: async (host) => (await lookup(host, { all: true })).map((a) => a.address),
};

/** Addresses no fetch from a visitor's link may reach: private, loopback, link-local, carrier-grade NAT, unique-local, unspecified. */
export function isPrivateAddress(address: string): boolean {
  const ip = address.replace(/^\[|\]$/g, "").toLowerCase();
  const v4 = ip.startsWith("::ffff:") && isIP(ip.slice(7)) === 4 ? ip.slice(7) : ip;
  if (isIP(v4) === 4) {
    const [a, b] = v4.split(".").map(Number);
    return a === 0 || a === 10 || a === 127 || (a === 100 && b >= 64 && b <= 127) || (a === 169 && b === 254) || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || a >= 224;
  }
  if (isIP(ip) === 6) return ip === "::" || ip === "::1" || /^f[cd]/.test(ip) || /^fe[89ab]/.test(ip) || ip.startsWith("ff");
  return true;
}

/** This site's own sample ads: same origin, under /ads/. */
function isOwnSample(url: URL, ownOrigin: string | undefined): boolean {
  return ownOrigin !== undefined && url.origin === ownOrigin && url.pathname.startsWith("/ads/");
}

async function checkTarget(url: URL, ownOrigin: string | undefined, deps: AdFetchDeps): Promise<void> {
  if (isOwnSample(url, ownOrigin)) return;
  if (url.protocol !== "https:" || url.username || url.password) throw new ServiceError(400, UNSAFE_LINK);
  const host = url.hostname.replace(/^\[|\]$/g, "");
  const addresses = isIP(host) ? [host] : await deps.resolve(host).catch(() => [] as string[]);
  if (addresses.length === 0 || addresses.some(isPrivateAddress)) throw new ServiceError(400, UNSAFE_LINK);
}

function parse(link: string): URL {
  try {
    return new URL(link);
  } catch {
    throw new ServiceError(400, UNSAFE_LINK);
  }
}

/** Reads the body up to the size limit, whatever the content-length header says. */
async function readCapped(response: Response): Promise<string> {
  if (Number(response.headers.get("content-length") ?? 0) > MAX_AD_BYTES) throw new ServiceError(400, UNREADABLE_AD);
  if (!response.body) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_AD_BYTES) {
      await reader.cancel();
      throw new ServiceError(400, UNREADABLE_AD);
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** Fetches one job ad as HTML text, following redirects only on the same host, each target checked again. */
export async function fetchAd(link: string, ownOrigin: string | undefined, deps: AdFetchDeps = defaultAdDeps): Promise<string> {
  let url = parse(link.trim());
  const host = url.host;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AD_TIMEOUT_MS);
  try {
    for (let hop = 0; ; hop++) {
      await checkTarget(url, ownOrigin, deps);
      const response = await deps.fetch(url, { redirect: "manual", signal: controller.signal, headers: { accept: "text/html" } });
      if (response.status >= 300 && response.status < 400) {
        const next = response.headers.get("location");
        const target = next ? new URL(next, url) : undefined;
        if (!target || target.host !== host || hop >= MAX_REDIRECTS) throw new ServiceError(400, UNSAFE_LINK);
        url = target;
        continue;
      }
      const type = response.headers.get("content-type") ?? "";
      if (!response.ok || !type.toLowerCase().startsWith("text/html")) throw new ServiceError(400, UNREADABLE_AD);
      return await readCapped(response);
    }
  } catch (error) {
    if (error instanceof ServiceError) throw error;
    throw new ServiceError(400, UNREADABLE_AD);
  } finally {
    clearTimeout(timer);
  }
}
