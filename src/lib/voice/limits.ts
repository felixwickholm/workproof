/** Voice limits shared by the browser and the server routes, so the two never disagree. */
export const VOICE_LIMITS = {
  /** Longest text the server reads aloud. */
  speakChars: 600,
  /** Largest recorded take the server accepts. */
  audioBytes: 1024 * 1024,
  /** Longest take; the sheet stops listening here. */
  seconds: 60,
} as const;
