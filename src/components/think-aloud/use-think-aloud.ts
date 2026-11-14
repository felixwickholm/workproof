"use client";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import { elapsedSeconds, IDLE, isLive, mediaErrorReason, recorderReducer, type RecorderState } from "@/lib/think-aloud/machine";
import { joinHeard } from "@/lib/think-aloud/transcript";
import { meterStream } from "@/lib/voice/level";
import { listenInBrowser, recognitionConstructor } from "@/lib/voice/recognition";
import type { ListenSession } from "@/lib/voice/types";
import { keepReplay, type Replay } from "./replays";

/** Whether this browser can record the screen at all. Phones and some browsers cannot. */
export function canCaptureScreen(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.mediaDevices?.getDisplayMedia === "function";
}

/**
 * Live speech to text in this browser, or null. Automated browsers report the API but have no speech
 * service behind it, so they type, like any browser without it.
 */
function liveRecognition() {
  if (typeof navigator !== "undefined" && navigator.webdriver) return null;
  return recognitionConstructor() ?? null;
}

export interface ThinkAloud {
  state: RecorderState;
  /** Seconds recorded so far; ticks while recording. */
  seconds: number;
  /** Microphone loudness, 0 to 1. */
  level: number;
  /** Words heard by the browser, settled and still changing. */
  heard: string;
  /** True while the browser turns speech into text; false means the person types what they would say. */
  listening: boolean;
  /** Words the person typed instead of saying them. */
  typed: string;
  setTyped: (text: string) => void;
  /** The full transcript as it will be sent. */
  transcript: string;
  /** The recording to replay on this device, after Stop. */
  replay: Replay | null;
  /** A plain note about the screen, for example when this browser cannot record it. */
  screenNote: string | null;
  start: (wantScreen: boolean) => Promise<void>;
  typeInstead: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => Promise<void>;
  /** Hands the recording to "My work" for this proof, so it survives leaving the page. */
  keepFor: (proofId: string) => void;
}

/**
 * Records the screen (optional) and the microphone while the person works, and turns the voice into
 * text. The recording stays in the browser as an object URL; only the transcript and its length are
 * ever sent. Tracks, the meter and the URL are released when the page goes away.
 */
export function useThinkAloud(lang = "en-US"): ThinkAloud {
  const [state, dispatch] = useReducer(recorderReducer, IDLE);
  const [now, setNow] = useState(0);
  const [level, setLevel] = useState(0);
  const [settled, setSettled] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [typed, setTyped] = useState("");
  const [replay, setReplay] = useState<Replay | null>(null);
  const [screenNote, setScreenNote] = useState<string | null>(null);

  const streams = useRef<MediaStream[]>([]);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const stopMeter = useRef<(() => void) | null>(null);
  const session = useRef<ListenSession | null>(null);
  /** Text from earlier listening stretches (before a pause). */
  const earlier = useRef("");
  const replayRef = useRef<Replay | null>(null);
  const kept = useRef(false);
  const capture = useRef<"screen" | "voice">("voice");

  const live = isLive(state) && state.status === "recording";
  useEffect(() => {
    if (!live) return;
    const tick = () => setNow(Date.now());
    tick();
    const id = window.setInterval(tick, 500);
    return () => window.clearInterval(id);
  }, [live]);

  const listen = useCallback(async () => {
    const Ctor = liveRecognition();
    if (!Ctor) return setListening(false);
    try {
      session.current = await listenInBrowser(Ctor, false, {
        lang,
        onPartial: (text, pending) => {
          setSettled(joinHeard(earlier.current, text));
          setInterim(pending ?? "");
        },
        onError: () => setListening(false),
      });
      setListening(true);
    } catch {
      setListening(false);
    }
  }, [lang]);

  const quiet = useCallback(async () => {
    const current = session.current;
    session.current = null;
    if (!current) return;
    earlier.current = joinHeard(earlier.current, await current.stop());
    setSettled(earlier.current);
    setInterim("");
  }, []);

  const release = useCallback(() => {
    session.current?.cancel();
    session.current = null;
    stopMeter.current?.();
    stopMeter.current = null;
    for (const stream of streams.current) for (const track of stream.getTracks()) track.stop();
    streams.current = [];
    setLevel(0);
  }, []);

  const start = useCallback(
    async (wantScreen: boolean) => {
      dispatch({ type: "start", wantScreen });
      setScreenNote(null);
      let screen: MediaStream | null = null;
      if (wantScreen && canCaptureScreen()) {
        try {
          screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        } catch {
          // The person chose not to share the screen: the voice alone is recorded.
          setScreenNote("Only your voice is recorded.");
        }
      } else if (wantScreen) {
        setScreenNote("Screen recording is not available here.");
      }
      let mic: MediaStream;
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw Object.assign(new Error("No microphone"), { name: "NotFoundError" });
        mic = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (error) {
        for (const track of screen?.getTracks() ?? []) track.stop();
        dispatch({ type: "failed", reason: mediaErrorReason(error) });
        return;
      }
      streams.current = [mic, ...(screen ? [screen] : [])];
      capture.current = screen ? "screen" : "voice";
      if (typeof MediaRecorder !== "undefined") {
        try {
          const combined = new MediaStream([...(screen?.getVideoTracks() ?? []), ...mic.getAudioTracks()]);
          const rec = new MediaRecorder(combined);
          chunks.current = [];
          rec.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.current.push(event.data);
          };
          rec.start(1000);
          recorder.current = rec;
        } catch {
          recorder.current = null;
        }
      }
      try {
        stopMeter.current = meterStream(mic, setLevel);
      } catch {
        stopMeter.current = null;
      }
      dispatch({ type: "granted", capture: screen ? "screen" : "mic", at: Date.now() });
      void listen();
    },
    [listen],
  );

  const typeInstead = useCallback(() => {
    setListening(false);
    dispatch({ type: "type-instead", at: Date.now() });
  }, []);

  const pause = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.pause();
    void quiet();
    dispatch({ type: "pause", at: Date.now() });
  }, [quiet]);

  const resume = useCallback(() => {
    if (recorder.current?.state === "paused") recorder.current.resume();
    dispatch({ type: "resume", at: Date.now() });
    if (streams.current.length) void listen();
  }, [listen]);

  const stop = useCallback(async () => {
    dispatch({ type: "stop", at: Date.now() });
    await quiet();
    const rec = recorder.current;
    recorder.current = null;
    if (rec && rec.state !== "inactive") {
      await new Promise<void>((done) => {
        rec.onstop = () => done();
        rec.stop();
      });
      if (chunks.current.length) {
        const blob = new Blob(chunks.current, { type: rec.mimeType || (capture.current === "screen" ? "video/webm" : "audio/webm") });
        const made: Replay = { url: URL.createObjectURL(blob), kind: capture.current };
        replayRef.current = made;
        setReplay(made);
      }
    }
    release();
  }, [quiet, release]);

  const keepFor = useCallback((proofId: string) => {
    if (!replayRef.current) return;
    keepReplay(proofId, replayRef.current);
    kept.current = true;
  }, []);

  // Leaving the page turns the microphone and the screen off, and drops a recording nobody kept.
  useEffect(
    () => () => {
      if (recorder.current && recorder.current.state !== "inactive") recorder.current.stop();
      release();
      if (replayRef.current && !kept.current) URL.revokeObjectURL(replayRef.current.url);
    },
    [release],
  );

  const heard = joinHeard(settled, interim);
  return {
    state,
    seconds: elapsedSeconds(state, now),
    level,
    heard,
    listening,
    typed,
    setTyped,
    transcript: joinHeard(heard, typed),
    replay,
    screenNote,
    start,
    typeInstead,
    pause,
    resume,
    stop,
    keepFor,
  };
}
