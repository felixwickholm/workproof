"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { demoLevel, words } from "@/lib/voice/copy";
import { resolveVoiceAdapter } from "@/lib/voice/resolve";
import { VoiceError, type ListenSession, type VoiceAdapter } from "@/lib/voice/types";

export type TakePhase = "preparing" | "idle" | "starting" | "listening" | "processing" | "review" | "typed" | "error";

interface TakeOptions {
  prompt: string;
  lang: string;
  maxSeconds: number;
  speakPrompt: boolean;
  /** Set only when the scripted demo take should play. */
  demoTranscript?: string;
}

export interface VoiceTake {
  phase: TakePhase;
  demo: boolean;
  adapter: VoiceAdapter | null;
  /** Settled words and the words the engine may still change. */
  text: string;
  interim: string;
  /** The editable answer in review, typing and error states. */
  draft: string;
  setDraft(value: string): void;
  error: string | null;
  elapsed: number;
  /** Loudness 0..1 for the orb; set without re-rendering. */
  level: MotionValue<number>;
  /** The orb: start in idle or error, stop while listening. */
  toggle(): void;
  recordAgain(): void;
}

const WORD_MS = 190;
const DEMO_START_MS = 900;
/** With no real loudness for this long, the orb breathes calmly instead. */
const QUIET_MS = 400;
const NOTHING_HEARD = "Nothing was heard. Try again, or type your answer.";

function messageOf(error: unknown) {
  return error instanceof VoiceError ? error.message : "Listening stopped. Try again, or type your answer.";
}

/**
 * One voice take from tap to transcript. It mounts when the sheet opens and cleans up
 * everything (microphone, speech, timers) when the sheet closes.
 */
export function useVoiceTake({ prompt, lang, maxSeconds, speakPrompt, demoTranscript }: TakeOptions): VoiceTake {
  const demo = Boolean(demoTranscript);
  const [adapter, setAdapter] = useState<VoiceAdapter | null>(null);
  const [phase, setPhase] = useState<TakePhase>(demo ? "idle" : "preparing");
  const [text, setText] = useState("");
  const [interim, setInterim] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [startedAt, setStartedAt] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const level = useMotionValue(0);

  const session = useRef<ListenSession | null>(null);
  const adapterRef = useRef<VoiceAdapter | null>(null);
  const heard = useRef("");
  const lastLevelAt = useRef(0);
  const demoTimers = useRef<number[]>([]);

  const clearDemo = () => {
    for (const id of demoTimers.current) window.clearTimeout(id);
    demoTimers.current = [];
  };

  const beginListening = useCallback(() => {
    heard.current = "";
    setText("");
    setInterim("");
    setError(null);
    setElapsed(0);
    setStartedAt(Date.now());
    setPhase("listening");
  }, []);

  /** The scripted take: words stream in, the last two still "being guessed", then review. */
  const playDemo = useCallback(() => {
    if (!demoTranscript) return;
    clearDemo();
    beginListening();
    const all = words(demoTranscript);
    const later = (ms: number, run: () => void) => demoTimers.current.push(window.setTimeout(run, ms));
    all.forEach((_, i) => {
      later((i + 1) * WORD_MS, () => {
        const settledCount = Math.max(0, i - 1);
        setText(all.slice(0, settledCount).join(" "));
        setInterim(all.slice(settledCount, i + 1).join(" "));
      });
    });
    later((all.length + 3) * WORD_MS, () => {
      setText(all.join(" "));
      setInterim("");
      setDraft(all.join(" "));
      setPhase("review");
    });
  }, [demoTranscript, beginListening]);

  // Find the best adapter. The scripted demo still learns it, so its privacy line stays true.
  useEffect(() => {
    let live = true;
    void resolveVoiceAdapter(lang).then((found) => {
      if (!live) return;
      adapterRef.current = found;
      setAdapter(found);
      if (demo) return;
      setPhase(found.canListen ? "idle" : "typed");
      if (speakPrompt && found.canSpeak) void found.speak(prompt, { lang });
    });
    return () => {
      live = false;
    };
  }, [demo, lang, prompt, speakPrompt]);

  // The demo starts by itself, after the question has had a moment on screen.
  useEffect(() => {
    if (!demo) return;
    const id = window.setTimeout(playDemo, DEMO_START_MS);
    return () => window.clearTimeout(id);
  }, [demo, playDemo]);

  // Closing the sheet turns off the microphone, the voice and the demo.
  useEffect(
    () => () => {
      session.current?.cancel();
      session.current = null;
      adapterRef.current?.stopSpeaking();
      clearDemo();
    },
    [],
  );

  const fail = useCallback((message: string) => {
    session.current?.cancel();
    session.current = null;
    setError(message);
    setDraft(heard.current);
    setInterim("");
    setPhase("error");
  }, []);

  const start = useCallback(async () => {
    if (demo) return playDemo();
    const current = adapterRef.current;
    if (!current?.canListen) return;
    current.stopSpeaking();
    setPhase("starting");
    try {
      session.current = await current.listen({
        lang,
        onPartial(settled, guess = "") {
          heard.current = [settled, guess].filter(Boolean).join(" ");
          setText(settled);
          setInterim(guess);
        },
        onLevel(value) {
          lastLevelAt.current = performance.now();
          level.set(value);
        },
        onError: fail,
      });
      beginListening();
    } catch (problem) {
      fail(messageOf(problem));
    }
  }, [demo, playDemo, lang, level, fail, beginListening]);

  const stop = useCallback(async () => {
    const current = session.current;
    if (!current) return;
    session.current = null;
    setPhase("processing");
    try {
      const final = (await current.stop()).trim();
      if (!final) return fail(NOTHING_HEARD);
      setText(final);
      setInterim("");
      setDraft(final);
      setPhase("review");
    } catch (problem) {
      fail(messageOf(problem));
    }
  }, [fail]);

  const stopRef = useRef(stop);
  useEffect(() => {
    stopRef.current = stop;
  });

  // The take clock; at the limit the take stops by itself and goes to review.
  useEffect(() => {
    if (phase !== "listening") return;
    const id = window.setInterval(() => {
      const seconds = (Date.now() - startedAt) / 1000;
      setElapsed(seconds);
      if (seconds >= maxSeconds && !demo) void stopRef.current();
    }, 200);
    return () => window.clearInterval(id);
  }, [phase, startedAt, maxSeconds, demo]);

  // The demo moves the orb like speech; a real take without a level meter breathes calmly.
  useEffect(() => {
    if (phase !== "listening") {
      level.set(0);
      return;
    }
    let frame = 0;
    const began = performance.now();
    lastLevelAt.current = 0;
    const tick = (now: number) => {
      if (demo) level.set(demoLevel(now - began));
      else if (now - lastLevelAt.current > QUIET_MS) level.set(0.12 + 0.08 * Math.sin((now - began) / 500));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase, demo, level]);

  const toggle = useCallback(() => {
    if (phase === "listening" && !demo) void stop();
    else if (phase === "idle" || phase === "error") void start();
  }, [phase, demo, start, stop]);

  return { phase, demo, adapter, text, interim, draft, setDraft, error, elapsed, level, toggle, recordAgain: () => void start() };
}
