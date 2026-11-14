"use client";

import { CameraOff, FileText, Mic, Monitor } from "lucide-react";
import type { ReactNode } from "react";
import type { RecorderError } from "@/lib/think-aloud/machine";
import { Button } from "../ui/button";

const LINES = [
  { Icon: Monitor, text: "Your screen and your voice are recorded while you work." },
  { Icon: CameraOff, text: "No camera. Nobody sees your face." },
  { Icon: FileText, text: "The company reads your words as text, with names removed." },
];

const ERRORS: Record<RecorderError, string> = {
  denied: "The microphone is not allowed. Allow it in the browser, or type what you would say.",
  "no-device": "No microphone was found. Connect one, or type what you would say.",
};

interface Props {
  /** The challenge, in one line above the promise. */
  heading: ReactNode;
  canScreen: boolean;
  busy: boolean;
  error?: RecorderError;
  onStart: (wantScreen: boolean) => void;
  onType: () => void;
}

/** One screen before the work starts: what is recorded, what is not, and one big Start. */
export function ThinkAloudIntro({ heading, canScreen, busy, error, onStart, onType }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col py-6 min-[900px]:py-12">
      {heading}
      <h1 className="mt-8 font-serif text-[40px] leading-[44px] tracking-[-0.01em] text-balance text-label min-[900px]:text-[56px] min-[900px]:leading-[60px]">
        We capture the thinking, not the face.
      </h1>
      <ul className="mt-8 flex flex-col gap-4">
        {LINES.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-label-2" strokeWidth={1.75} />
            <span className="text-[19px] leading-[28px] text-pretty text-label">{text}</span>
          </li>
        ))}
      </ul>
      <p className="text-body mt-6 text-pretty text-label-2">The recording stays on this device. The company gets the words as text.</p>
      {error ? (
        <p role="alert" className="text-body mt-6 rounded-inner bg-surface px-4 py-3 text-pretty text-label">
          {ERRORS[error]}
        </p>
      ) : null}
      <div className="mt-10 flex flex-col gap-3">
        <Button onClick={() => onStart(canScreen)} loading={busy} className="h-14! text-[18px]!" tour="start-session">
          <Mic aria-hidden className="size-5" strokeWidth={1.75} />
          Start
        </Button>
        <div className="flex flex-wrap justify-center gap-x-6">
          {canScreen ? (
            <button type="button" onClick={() => onStart(false)} className="press text-body min-h-11 font-medium text-label-2 underline decoration-label-3 underline-offset-4 hover:text-label">
              Voice only
            </button>
          ) : null}
          <button type="button" onClick={onType} className="press text-body min-h-11 font-medium text-label-2 underline decoration-label-3 underline-offset-4 hover:text-label">
            Type instead
          </button>
        </div>
        {canScreen ? null : <p className="text-footnote text-center text-label-2">Screen recording is not available here. Your voice is recorded.</p>}
      </div>
    </div>
  );
}
