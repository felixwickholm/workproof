/**
 * Recordings kept in this browser tab, by proof, so "My work" can replay one after sending. The
 * recording never leaves the device; a reload ends it. Only the newest few are kept.
 */
export interface Replay {
  url: string;
  /** "screen": the screen with the voice. "voice": the microphone only. */
  kind: "screen" | "voice";
}

const KEEP = 4;
const kept = new Map<string, Replay>();

export function keepReplay(proofId: string, replay: Replay) {
  kept.set(proofId, replay);
  while (kept.size > KEEP) {
    const [oldest] = kept.keys();
    URL.revokeObjectURL(kept.get(oldest)!.url);
    kept.delete(oldest);
  }
}

export function replayFor(proofId: string): Replay | undefined {
  return kept.get(proofId);
}
