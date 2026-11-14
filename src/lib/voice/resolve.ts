import { createBrowserAdapter } from "./browser";
import { createElevenLabsAdapter } from "./elevenlabs";
import { detectCapabilities, pickAdapter } from "./pick";
import { createTypedAdapter } from "./typed";
import type { VoiceAdapter, VoiceStatus } from "./types";

let statusRequest: Promise<VoiceStatus | null> | null = null;

/** Asks the server once per page load whether a voice service is set up. */
function fetchStatus(): Promise<VoiceStatus | null> {
  statusRequest ??= fetch("/api/voice/status")
    .then((response) => (response.ok ? (response.json() as Promise<VoiceStatus>) : null))
    .catch(() => null);
  return statusRequest;
}

/** The best voice adapter this browser and server allow. It always resolves; typing is the floor. */
export async function resolveVoiceAdapter(lang: string): Promise<VoiceAdapter> {
  const status = await fetchStatus();
  const choice = pickAdapter(detectCapabilities(window as Parameters<typeof detectCapabilities>[0]), status);
  try {
    if (choice === "elevenlabs" && status) return createElevenLabsAdapter(lang, status);
    if (choice === "browser") return await createBrowserAdapter(lang);
  } catch {
    // Falls through to typing below.
  }
  return createTypedAdapter(lang);
}
