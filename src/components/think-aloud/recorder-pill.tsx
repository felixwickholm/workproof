"use client";

import { Pause, Play, Square } from "lucide-react";
import { clock, lastWords } from "@/lib/think-aloud/transcript";
import { cx } from "../ui/cx";

interface Props {
  status: "recording" | "paused" | "stopped";
  seconds: number;
  /** Microphone loudness, 0 to 1. Typed sessions have none. */
  level: number;
  /** The transcript so far; the pill shows its last words. */
  heard: string;
  /** No microphone: the person types what they would say. */
  typed?: boolean;
  /** A scripted demo session: labelled, and its buttons do nothing. */
  sample?: boolean;
  onPause?: () => void;
  onResume?: () => void;
  onStop?: () => void;
  className?: string;
}

const BARS = [0.55, 0.85, 1, 0.7, 0.45];

/**
 * Always in view while the person works: a level meter, the running time, the last words heard,
 * Pause and Stop. Bars move with the voice through transform only.
 */
export function RecorderPill({ status, seconds, level, heard, typed, sample, onPause, onResume, onStop, className }: Props) {
  const recording = status === "recording";
  const words = lastWords(heard);
  return (
    <div
      role="status"
      aria-label={sample ? "Sample session" : recording ? "Recording your thinking" : "Recording paused"}
      data-tour="recorder"
      className={cx("flex h-14 min-w-0 items-center gap-3 rounded-full bg-raised pr-1.5 pl-4 shadow-float", className)}
    >
      <span aria-hidden className={cx("size-2.5 shrink-0 rounded-full", recording ? "bg-negative" : "bg-label-3")} />
      {typed ? null : (
        <span aria-hidden className="flex h-5 items-center gap-[3px]">
          {BARS.map((weight, i) => (
            <span
              key={i}
              className="h-5 w-[3px] origin-center rounded-full bg-label transition-transform duration-100"
              style={{ transform: `scaleY(${recording ? Math.max(0.15, Math.min(1, level * weight * 1.6)) : 0.15})` }}
            />
          ))}
        </span>
      )}
      <span className="text-body tnum shrink-0 font-medium text-label">{clock(seconds)}</span>
      <span className="text-footnote min-w-0 flex-1 truncate text-label-2 max-[520px]:hidden">
        {sample ? "Sample session" : words || (typed ? "Type what you would say" : recording ? "Say what you think" : "Paused")}
        {sample && words ? ` · ${words}` : ""}
      </span>
      {status === "stopped" ? null : (
        <>
          <button
            type="button"
            onClick={recording ? onPause : onResume}
            disabled={sample}
            aria-label={recording ? "Pause" : "Go on"}
            className="press flex size-11 shrink-0 items-center justify-center rounded-full text-label hover:bg-fill"
          >
            {recording ? <Pause aria-hidden className="size-5" strokeWidth={1.75} /> : <Play aria-hidden className="size-5" strokeWidth={1.75} />}
          </button>
          <button
            type="button"
            onClick={onStop}
            disabled={sample}
            data-demo-target="stop"
            className="press text-subhead flex h-11 shrink-0 items-center gap-2 rounded-full bg-fill px-4 font-semibold text-label hover:bg-label/10"
          >
            <Square aria-hidden className="size-4 fill-current" strokeWidth={1.75} />
            Stop
          </button>
        </>
      )}
    </div>
  );
}
