import { afterEach, describe, expect, it, vi } from "vitest";
import { AD_TIMEOUT_MS, fetchAd, isPrivateAddress, MAX_AD_BYTES, UNREADABLE_AD, UNSAFE_LINK, type AdFetchDeps } from "./ad-fetch";

const AD = "<html><head><title>Data analyst | Example Oy</title><script>alert(1)</script></head><body><h1>Data analyst</h1><p>Intro</p><ul><li>SQL &amp; dashboards</li><li>Explain numbers to sales</li></ul></body></html>";
const html = (body = AD, headers: Record<string, string> = {}) => new Response(body, { headers: { "content-type": "text/html; charset=utf-8", ...headers } });

function deps(reply: (url: URL) => Response, addresses: Record<string, string[]> = { "jobs.example.org": ["93.184.216.34"] }): AdFetchDeps & { fetch: ReturnType<typeof vi.fn> } {
  return {
    fetch: vi.fn(async (input: RequestInfo | URL) => reply(new URL(String(input)))) as unknown as AdFetchDeps["fetch"] & ReturnType<typeof vi.fn>,
    resolve: async (host) => addresses[host] ?? [],
  };
}

afterEach(() => vi.useRealTimers());

describe("isPrivateAddress", () => {
  it.each(["10.0.0.1", "127.0.0.1", "169.254.169.254", "172.16.0.1", "192.168.1.1", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1", "not-an-ip"])("refuses %s", (ip) => {
    expect(isPrivateAddress(ip)).toBe(true);
  });
  it.each(["93.184.216.34", "8.8.8.8", "2606:4700::1111"])("allows %s", (ip) => expect(isPrivateAddress(ip)).toBe(false));
});

describe("fetchAd", () => {
  it("reads a public https ad", async () => {
    const d = deps(() => html());
    expect(await fetchAd("https://jobs.example.org/ad/1", undefined, d)).toBe(AD);
    expect(d.fetch.mock.calls[0][1]).toMatchObject({ redirect: "manual" });
  });

  it.each([
    ["http, not https", "http://jobs.example.org/ad"],
    ["a private address", "https://10.0.0.5/ad"],
    ["the cloud metadata address", "https://169.254.169.254/latest"],
    ["a host that resolves to loopback", "https://inside.example.org/ad"],
    ["a host that does not resolve", "https://nowhere.example.org/ad"],
    ["a password in the link", "https://user:pw@jobs.example.org/ad"],
    ["no link at all", "not a link"],
  ])("refuses %s before any fetch", async (_, link) => {
    const d = deps(() => html(), { "jobs.example.org": ["93.184.216.34"], "inside.example.org": ["127.0.0.1"] });
    await expect(fetchAd(link, undefined, d)).rejects.toMatchObject({ status: 400, message: UNSAFE_LINK });
    expect(d.fetch).not.toHaveBeenCalled();
  });

  it("follows a redirect on the same host only", async () => {
    const same = deps((url) => (url.pathname === "/old" ? new Response(null, { status: 301, headers: { location: "/new" } }) : html()));
    expect(await fetchAd("https://jobs.example.org/old", undefined, same)).toBe(AD);
    const other = deps(() => new Response(null, { status: 302, headers: { location: "https://169.254.169.254/" } }));
    await expect(fetchAd("https://jobs.example.org/old", undefined, other)).rejects.toMatchObject({ message: UNSAFE_LINK });
    expect(other.fetch).toHaveBeenCalledOnce();
  });

  it("reads only HTML, and at most 300 kB", async () => {
    await expect(fetchAd("https://jobs.example.org/a", undefined, deps(() => new Response("{}", { headers: { "content-type": "application/json" } })))).rejects.toMatchObject({ message: UNREADABLE_AD });
    await expect(fetchAd("https://jobs.example.org/a", undefined, deps(() => html("x".repeat(MAX_AD_BYTES + 1))))).rejects.toMatchObject({ message: UNREADABLE_AD });
    await expect(fetchAd("https://jobs.example.org/a", undefined, deps(() => new Response("gone", { status: 404, headers: { "content-type": "text/html" } })))).rejects.toMatchObject({ message: UNREADABLE_AD });
  });

  it("gives up after the deadline", async () => {
    vi.useFakeTimers();
    const d: AdFetchDeps = {
      resolve: async () => ["93.184.216.34"],
      fetch: (_input, init) => new Promise((_, reject) => init?.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError")))),
    };
    const pending = expect(fetchAd("https://jobs.example.org/slow", undefined, d)).rejects.toMatchObject({ message: UNREADABLE_AD });
    await vi.advanceTimersByTimeAsync(AD_TIMEOUT_MS);
    await pending;
  });

  it("lets this site's own sample ads through over http on the same origin, and nothing else there", async () => {
    const d = deps(() => html(), {});
    expect(await fetchAd("http://localhost:3000/ads/data-analyst", "http://localhost:3000", d)).toBe(AD);
    await expect(fetchAd("http://localhost:3000/api/city", "http://localhost:3000", d)).rejects.toMatchObject({ message: UNSAFE_LINK });
  });
});
