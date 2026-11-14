import { describe, expect, it } from "vitest";
import { sandboxes, type StoreData } from "@/lib/store";
import { VOICE_RATE } from "@/lib/voice/server/elevenlabs";
import { VOICE_CALLS_PER_MINUTE_ALL } from "./limits";
import { guardVoice } from "./voice-guard";

const tinyEvent = (): StoreData => ({
  version: 1,
  event: { name: "Voice day", date: "2026-11-14", responseWindowHours: 48 },
  companies: [],
  challenges: [],
  talents: [],
  submissions: [],
  proofs: [],
  decisions: [],
  meetings: [],
  audit: [],
  demo: { personaTalentId: "t_persona", personaName: "Test Person", stage: "invited" },
});

const id = (n: number) => `sb_11111111-0000-4000-8000-${String(n).padStart(12, "0")}`;

/** A request with a live sandbox and no forwarded address, as a server reached without a proxy sees it. */
function visitor(n: number, now: number): Request {
  if (!sandboxes().find(id(n), now)) sandboxes().create(id(n), now, tinyEvent);
  return new Request("http://localhost/api/voice/speak", { method: "POST", headers: { cookie: `workprint_sandbox=${id(n)}` } });
}

describe("voice guard", () => {
  it("refuses a caller without a live sandbox", () => {
    const now = Date.now();
    expect(() => guardVoice(new Request("http://localhost/api/voice/speak", { method: "POST" }), now)).toThrow("Open the site first.");
    const forged = new Request("http://localhost/api/voice/speak", { method: "POST", headers: { cookie: `workprint_sandbox=${id(999)}` } });
    expect(() => guardVoice(forged, now)).toThrow("Open the site first.");
  });

  it("limits each visitor on their own count, with no address present", () => {
    const now = Date.now() + 10 * 60_000;
    for (let i = 0; i < VOICE_RATE.perMinute; i++) guardVoice(visitor(1, now), now);
    expect(() => guardVoice(visitor(1, now), now)).toThrow(/Too many/);
  });

  it("caps all visitors together, so many sandboxes and no address do not get around it", () => {
    const now = Date.now() + 20 * 60_000;
    let calls = 0;
    for (let n = 10; calls < VOICE_CALLS_PER_MINUTE_ALL; n++) {
      for (let i = 0; i < Math.min(10, VOICE_CALLS_PER_MINUTE_ALL - calls); i++, calls++) guardVoice(visitor(n, now), now);
    }
    expect(() => guardVoice(visitor(500, now), now)).toThrow(/Too many/);
    expect(() => guardVoice(visitor(500, now + 60_000), now + 60_000)).not.toThrow();
  });
});
