"use client";

import { AudioLines, Lock, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TextArea } from "@/components/ui/field";
import { Sheet } from "@/components/ui/sheet";
import { LIMITS } from "@/lib/http/limits";
import { formatClock, privacyLine } from "@/lib/voice/copy";
import { VOICE_LIMITS } from "@/lib/voice/limits";
import { LiveTranscript } from "./live-transcript";
import { useVoiceTake, type TakePhase, type VoiceTake } from "./use-voice-take";
import { VoiceOrb } from "./voice-orb";

export interface VoiceSheetProps {
  open: boolean;
  onClose(): void;
  /** The sheet's heading, for example "Explain your choices". */
  title: string;
  /** The question the person answers. Shown first, and read aloud with `speakPrompt`. */
  prompt: string;
  /** BCP 47 tag for listening and speaking. Default "en-US". */
  lang?: string;
  /** The take stops by itself here. Default 60. */
  maxSeconds?: number;
  /** Receives the checked transcript; the sheet then closes. */
  onUse(transcript: string): void;
  speakPrompt?: boolean;
  /** A scripted answer for the guided walkthrough. Plays only with `autoPlayDemo`. */
  demoTranscript?: string;
  /** Plays `demoTranscript` as a labelled demo take, with no microphone needed. */
  autoPlayDemo?: boolean;
  /** Longest answer the field accepts. Default: the follow-up answer limit. */
  maxLength?: number;
}

const CAPTIONS: Partial<Record<TakePhase, string>> = {
  preparing: "One moment",
  idle: "Tap to answer",
  starting: "Allow the microphone if the browser asks",
  processing: "Making the text",
};

function caption(take: VoiceTake) {
  if (take.phase !== "listening") return CAPTIONS[take.phase] ?? "";
  return take.demo ? "Listening" : "Listening. Tap to stop.";
}

/**
 * Answer by voice: the question, one orb that follows the voice, a live transcript and a
 * clock. The person checks and edits the text before using it; only the text leaves the sheet.
 * Where the browser cannot listen, the same sheet asks for typing instead.
 */
export function VoiceSheet({ open, onClose, title, ...rest }: VoiceSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <VoiceTakeBody onClose={onClose} {...rest} />
    </Sheet>
  );
}

function VoiceTakeBody({
  onClose,
  prompt,
  lang = "en-US",
  maxSeconds = VOICE_LIMITS.seconds,
  onUse,
  speakPrompt = false,
  demoTranscript,
  autoPlayDemo = false,
  maxLength = LIMITS.explain,
}: Omit<VoiceSheetProps, "open" | "title">) {
  const take = useVoiceTake({
    prompt,
    lang,
    maxSeconds,
    speakPrompt,
    demoTranscript: autoPlayDemo ? demoTranscript : undefined,
  });
  const { phase, adapter } = take;
  const writing = phase === "review" || phase === "typed" || phase === "error";

  const use = () => {
    const answer = take.draft.trim();
    if (!answer) return;
    onUse(answer);
    onClose();
  };

  return (
    <div data-voice-state={phase} className="flex flex-col">
      {take.demo ? (
        <span className="mb-3 inline-flex h-7 w-fit items-center gap-1.5 rounded-full bg-fill px-3 text-footnote font-medium text-label-2">
          <AudioLines size={16} aria-hidden />
          Demo voice
        </span>
      ) : null}
      <p className="text-headline text-label">{prompt}</p>

      {writing ? (
        <div key="write" className="rise mt-5 flex flex-col gap-3">
          {phase === "error" ? (
            <p role="alert" className="text-subhead text-label">
              {take.error}
            </p>
          ) : null}
          {phase === "typed" ? <p className="text-subhead text-label-2">This browser cannot listen here, so type your answer.</p> : null}
          {phase === "review" ? <p className="text-subhead text-label-2">Your answer as text. Fix any word before you use it.</p> : null}
          <TextArea
            label="Your answer"
            hideLabel
            value={take.draft}
            onChange={take.setDraft}
            placeholder="Type what you would say"
            autoFocus={phase !== "review"}
            minRows={4}
            maxLength={maxLength}
          />
        </div>
      ) : (
        <div key="listen" className="mt-2 flex flex-col">
          <div className="flex flex-col items-center">
            <VoiceOrb
              level={take.level}
              listening={phase === "listening"}
              busy={phase === "starting" || phase === "processing" || phase === "preparing"}
              disabled={phase !== "idle" && !(phase === "listening" && !take.demo)}
              onPress={take.toggle}
            />
            <p aria-live="polite" className="-mt-1 text-subhead font-medium text-label">
              {caption(take)}
            </p>
            <p role="timer" aria-label={`${formatClock(take.elapsed)} of ${formatClock(maxSeconds)}`} className="tnum mt-1 text-footnote text-label-2">
              {formatClock(take.elapsed)} / {formatClock(maxSeconds)}
            </p>
          </div>
          <div className="mt-5">
            <LiveTranscript
              text={take.text}
              interim={take.interim}
              placeholder={adapter?.name === "elevenlabs" ? "The text appears when you stop." : "Your words appear here as you speak."}
            />
          </div>
        </div>
      )}

      {adapter ? (
        <p className="mt-4 flex items-start gap-2 text-footnote text-label-2">
          <Lock size={16} aria-hidden className="mt-px shrink-0" />
          {privacyLine(adapter.privacy)}
        </p>
      ) : null}

      {writing ? (
        <div className="mt-5 flex flex-col items-center gap-2">
          <Button onClick={use} disabled={!take.draft.trim()}>
            Use this answer
          </Button>
          {adapter?.canListen || take.demo ? (
            <Button variant="quiet" size="sm" onClick={take.recordAgain}>
              <RotateCcw size={16} aria-hidden />
              {phase === "error" ? "Try again" : "Record again"}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
