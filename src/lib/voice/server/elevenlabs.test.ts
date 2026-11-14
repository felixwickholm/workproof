import { describe, expect, it, vi } from "vitest";
import { readAudioBody, synthesize, transcribe, voiceStatus } from "./elevenlabs";

const env = { ELEVENLABS_API_KEY: "test-key" };

function fakeFetch(response: Response) {
  return vi.fn<typeof fetch>(async () => response);
}

describe("voiceStatus", () => {
  it("reports the server service only when a key is set, and never the key", () => {
    expect(voiceStatus(env)).toEqual({ provider: "elevenlabs", tts: true, stt: true });
    expect(JSON.stringify(voiceStatus(env))).not.toContain("test-key");
    expect(voiceStatus({ ELEVENLABS_API_KEY: "  " })).toEqual({ provider: "browser", tts: false, stt: false });
    expect(voiceStatus({})).toEqual({ provider: "browser", tts: false, stt: false });
  });
});

describe("synthesize", () => {
  it("calls text to speech with the key, the default voice and model", async () => {
    const fetch = fakeFetch(new Response("mp3-bytes", { headers: { "content-type": "audio/mpeg" } }));
    const stream = await synthesize("  Tell us why.  ", { env, fetch });
    expect(await new Response(stream).text()).toBe("mp3-bytes");

    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb?output_format=mp3_44100_128");
    expect(init?.headers).toMatchObject({ "xi-api-key": "test-key" });
    expect(JSON.parse(String(init?.body))).toEqual({ text: "Tell us why.", model_id: "eleven_multilingual_v2" });
  });

  it("uses the configured voice", async () => {
    const fetch = fakeFetch(new Response("x"));
    await synthesize("Hi", { env: { ...env, ELEVENLABS_VOICE_ID: "voice-7" }, fetch });
    expect(String(fetch.mock.calls[0][0])).toContain("/text-to-speech/voice-7?");
  });

  it("answers 503 without a key and never calls out", async () => {
    const fetch = fakeFetch(new Response("x"));
    await expect(synthesize("Hi", { env: {}, fetch })).rejects.toMatchObject({ status: 503 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("refuses empty and over-long text", async () => {
    const fetch = fakeFetch(new Response("x"));
    await expect(synthesize("   ", { env, fetch })).rejects.toMatchObject({ status: 400 });
    await expect(synthesize("a".repeat(601), { env, fetch })).rejects.toMatchObject({ status: 413 });
  });

  it("turns an upstream failure into a plain 502", async () => {
    const fetch = fakeFetch(new Response("quota", { status: 401 }));
    await expect(synthesize("Hi", { env, fetch })).rejects.toMatchObject({ status: 502, message: expect.stringMatching(/did not answer/) });
  });
});

describe("transcribe", () => {
  const audio = new Blob([new Uint8Array([1, 2, 3])], { type: "audio/webm" });

  it("sends the audio once with the model and language, and returns only the text", async () => {
    const fetch = fakeFetch(Response.json({ text: " I called the client first. ", words: [{ text: "I" }], language_code: "en" }));
    await expect(transcribe(audio, "en", { env, fetch })).resolves.toEqual({ text: "I called the client first." });

    const [url, init] = fetch.mock.calls[0];
    expect(String(url)).toBe("https://api.elevenlabs.io/v1/speech-to-text");
    const form = init?.body as FormData;
    expect(form.get("model_id")).toBe("scribe_v2");
    expect(form.get("language_code")).toBe("en");
    expect((form.get("file") as Blob).size).toBe(3);
  });

  it("lets the service detect a language it was not given in a valid form", async () => {
    const fetch = fakeFetch(Response.json({ text: "Hei" }));
    await transcribe(audio, "en-US;drop", { env, fetch });
    expect((fetch.mock.calls[0][1]?.body as FormData).has("language_code")).toBe(false);
  });

  it("refuses empty and oversized audio, and a missing key", async () => {
    const fetch = fakeFetch(Response.json({ text: "x" }));
    await expect(transcribe(new Blob([]), "en", { env, fetch })).rejects.toMatchObject({ status: 400 });
    await expect(transcribe(new Blob([new Uint8Array(1024 * 1024 + 1)]), "en", { env, fetch })).rejects.toMatchObject({ status: 413 });
    await expect(transcribe(audio, "en", { env: {}, fetch })).rejects.toMatchObject({ status: 503 });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("turns a failed or odd answer into a plain 502", async () => {
    await expect(transcribe(audio, "en", { env, fetch: fakeFetch(new Response("", { status: 500 })) })).rejects.toMatchObject({ status: 502 });
    await expect(transcribe(audio, "en", { env, fetch: fakeFetch(Response.json({ message: "?" })) })).rejects.toMatchObject({ status: 502 });
  });
});

describe("readAudioBody", () => {
  const post = (body: BodyInit, headers: Record<string, string>) => new Request("http://localhost/api/voice/transcribe", { method: "POST", body, headers });

  it("reads audio up to the cap", async () => {
    const blob = await readAudioBody(post(new Uint8Array(10), { "content-type": "audio/webm" }));
    expect(blob.size).toBe(10);
    expect(blob.type).toBe("audio/webm");
  });

  it("stops at the cap even when the length header is missing", async () => {
    await expect(readAudioBody(post(new Uint8Array(11), { "content-type": "audio/webm" }), 10)).rejects.toMatchObject({ status: 413 });
  });

  it("refuses something that is not audio", async () => {
    await expect(readAudioBody(post("{}", { "content-type": "application/json" }))).rejects.toMatchObject({ status: 415 });
  });
});
