/** Which engine turns speech into text and text into speech. */
export type AdapterName = "browser" | "elevenlabs" | "typed";

/**
 * Where the voice goes while it becomes text. The sheet tells the person this in plain words,
 * because a promise about privacy has to match what the code really does.
 */
export type VoicePrivacy = "on-device" | "browser-service" | "server-once" | "typed";

export interface ListenOptions {
  /** BCP 47 tag, for example "en-US" or "fi-FI". */
  lang: string;
  /** Live text: `text` is settled, `interim` is the part the engine may still change. */
  onPartial(text: string, interim?: string): void;
  /** Microphone loudness from 0 to 1, about 60 times a second. */
  onLevel?(level: number): void;
  /** A problem after listening started, already worded for the person. */
  onError?(message: string): void;
}

export interface ListenSession {
  /** Stops listening and resolves with the final transcript. */
  stop(): Promise<string>;
  /** Stops listening and drops everything heard. */
  cancel(): void;
}

export interface VoiceAdapter {
  readonly name: AdapterName;
  readonly canListen: boolean;
  readonly canSpeak: boolean;
  readonly privacy: VoicePrivacy;
  listen(options: ListenOptions): Promise<ListenSession>;
  speak(text: string, options?: { lang?: string }): Promise<void>;
  stopSpeaking(): void;
}

/** What `GET /api/voice/status` answers. It never carries the key. */
export interface VoiceStatus {
  provider: "elevenlabs" | "browser";
  tts: boolean;
  stt: boolean;
}

/** A voice failure with a message meant for the person, not for a log. */
export class VoiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VoiceError";
  }
}
