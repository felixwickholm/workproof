import { afterEach, describe, expect, it, vi } from "vitest";
import { sandboxes, type StoreData } from "@/lib/store";
import { POST as speak } from "./speak/route";
import { GET as status } from "./status/route";
import { POST as transcribe } from "./transcribe/route";

afterEach(() => vi.unstubAllEnvs());

/** A visitor who opened the site: their sandbox exists, so the voice routes serve them. */
const VISITOR = "sb_5b1e0c4d-2f3a-4b6c-9d8e-7f6a5b4c3d2e";
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
sandboxes().create(VISITOR, Date.now(), tinyEvent);

const json = (body: unknown, cookie: string | null = VISITOR) =>
  new Request("http://localhost/api/voice/speak", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "content-type": "application/json", ...(cookie ? { cookie: `workprint_sandbox=${cookie}` } : {}) },
  });

describe("voice routes without a key", () => {
  it("status says the browser voice is used", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const response = await status();
    expect(await response.json()).toEqual({ provider: "browser", tts: false, stt: false });
  });

  it("speak answers 503 with a plain message", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const response = await speak(json({ text: "Tell us why." }));
    expect(response.status).toBe(503);
    expect((await response.json()).error).toMatch(/browser's own voice/);
  });

  it("transcribe answers 503 with a plain message", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "");
    const request = new Request("http://localhost/api/voice/transcribe?lang=en", {
      method: "POST",
      body: new Uint8Array([1, 2, 3]),
      headers: { "content-type": "audio/webm", cookie: `workprint_sandbox=${VISITOR}` },
    });
    expect((await transcribe(request)).status).toBe(503);
  });
});

describe("voice routes check input before calling out", () => {
  it("speak refuses text over 600 characters", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    const response = await speak(json({ text: "a".repeat(601) }));
    expect(response.status).toBe(400);
  });

  it("status never returns the key", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    const body = await (await status()).text();
    expect(body).not.toContain("test-key");
    expect(JSON.parse(body)).toEqual({ provider: "elevenlabs", tts: true, stt: true });
  });
});

describe("voice routes serve only visitors of the site", () => {
  it("speak answers 401 without a sandbox cookie, before reading the body", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    const response = await speak(json({ text: "Tell us why." }, null));
    expect(response.status).toBe(401);
    expect((await response.json()).error).toBe("Open the site first.");
  });

  it("speak answers 401 for a well-formed cookie that names no live sandbox", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    const response = await speak(json({ text: "Tell us why." }, "sb_00000000-0000-4000-8000-000000000000"));
    expect(response.status).toBe(401);
  });

  it("transcribe answers 401 without a sandbox cookie", async () => {
    vi.stubEnv("ELEVENLABS_API_KEY", "test-key");
    const request = new Request("http://localhost/api/voice/transcribe", { method: "POST", body: new Uint8Array([1, 2, 3]) });
    expect((await transcribe(request)).status).toBe(401);
  });
});
