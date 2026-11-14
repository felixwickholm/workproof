import type { ProofKind } from "@/lib/domain/types";

/** How the person answers right now. Every task also takes a written or a spoken answer. */
export type AnswerMode = "write" | "say" | "picture";

/** The mode a task opens in, from what it asks for. Video starts in words: uploads are off in this demo. */
export function defaultMode(kind: ProofKind): AnswerMode {
  if (kind === "photo" || kind === "design") return "picture";
  if (kind === "voice") return "say";
  return "write";
}

export interface AnswerValue {
  answer: string;
  /** The answer came from the microphone; only its text is kept. */
  spoken: boolean;
  picture: string | null;
  caption: string;
}

/** True when the answer can be sent on: words, or a picture with a sentence about it. */
export function answerReady(mode: AnswerMode, value: AnswerValue): boolean {
  return mode === "picture" ? Boolean(value.picture && value.caption.trim()) : Boolean(value.answer.trim());
}
