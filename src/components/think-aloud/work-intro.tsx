"use client";

import { CameraOff, FileText, PenLine } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "../ui/button";
import { VoiceSoon } from "../voice";

const LINES = [
  { Icon: PenLine, text: "You write your work, and a few lines on how you think." },
  { Icon: CameraOff, text: "No camera. Nobody sees your face." },
  { Icon: FileText, text: "The company reads your words as text, with names removed." },
];

/** One screen before the work starts: what the company reads, what it does not, and one big Start. */
export function WorkIntro({ heading, onStart }: { heading: ReactNode; onStart: () => void }) {
  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col py-6 min-[900px]:py-12">
      {heading}
      <h1 className="mt-8 font-serif text-[40px] leading-[44px] tracking-[-0.01em] text-balance text-label min-[900px]:text-[56px] min-[900px]:leading-[60px]">
        We read the thinking, not the face.
      </h1>
      <ul className="mt-8 flex flex-col gap-4">
        {LINES.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-3">
            <Icon aria-hidden className="mt-0.5 size-6 shrink-0 text-label-2" strokeWidth={1.75} />
            <span className="text-[19px] leading-[28px] text-pretty text-label">{text}</span>
          </li>
        ))}
      </ul>
      <div className="mt-10 flex flex-col items-center gap-3">
        <Button onClick={onStart} className="h-14! w-full text-[18px]!" tour="start-session">
          Start
        </Button>
        <VoiceSoon />
      </div>
    </div>
  );
}
