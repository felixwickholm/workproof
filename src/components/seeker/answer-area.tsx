"use client";

import { Field, TextArea } from "@/components/ui/field";
import { cx } from "@/components/ui/cx";
import { SpokenBadge, VoiceButton } from "@/components/voice";
import { LIMITS } from "@/lib/http/limits";
import type { ProofKind } from "@/lib/domain/types";
import type { AnswerMode, AnswerValue } from "./answer-mode";
import { PictureSlot } from "./picture-slot";

interface Props {
  kind: ProofKind;
  mode: AnswerMode;
  onMode: (mode: AnswerMode) => void;
  value: AnswerValue;
  onChange: (patch: Partial<AnswerValue>) => void;
  /** The question the voice sheet shows. */
  prompt: string;
}

/** The answer area, shaped by the kind of proof, with a way to write or speak instead. */
export function AnswerArea({ kind, mode, onMode, value, onChange, prompt }: Props) {
  const setText = (answer: string) => onChange({ answer, spoken: answer.trim() ? value.spoken : false });
  const voice = (label: string, className?: string) => (
    <VoiceButton label={label} title="Say your answer" prompt={prompt} maxLength={LIMITS.answer} onUse={(text) => onChange({ answer: text, spoken: true })} className={className} />
  );
  const switches: { mode: AnswerMode; label: string }[] = [
    ...(kind === "photo" || kind === "design" ? [{ mode: "picture" as const, label: kind === "photo" ? "Add a photo instead" : "Add a picture instead" }] : []),
    { mode: "write", label: "Write it instead" },
    { mode: "say", label: "Say it instead" },
  ];

  return (
    <div className="flex flex-col gap-4">
      {kind === "video" ? (
        <p className="text-subhead rounded-inner bg-surface p-4 text-pretty text-label">
          Video upload is switched off in this demo. Answer in words or by voice; the sample proofs show how a clip looks.
        </p>
      ) : null}

      {mode === "picture" ? (
        <>
          <PictureSlot kind={kind === "design" ? "design" : "photo"} value={value.picture} onChange={(picture) => onChange({ picture })} />
          <Field label="What does it show?" value={value.caption} onChange={(caption) => onChange({ caption })} placeholder="For example: the plate from above, gluten-free bread on its own board" maxLength={LIMITS.attachmentAlt} />
          <TextArea label="Notes (optional)" value={value.answer} onChange={setText} placeholder="What you did and why" minRows={3} maxLength={LIMITS.answer} />
        </>
      ) : mode === "say" ? (
        <>
          <div className="flex flex-col items-start gap-3 rounded-inner bg-surface p-5">
            {voice(value.answer ? "Say it again" : "Say your answer", "text-headline")}
            <p className="text-footnote text-label-2">Only the text is kept. The voice is not shared.</p>
          </div>
          {value.answer ? (
            <>
              {value.spoken ? <SpokenBadge /> : null}
              <TextArea label="Your answer as text" value={value.answer} onChange={setText} minRows={5} maxLength={LIMITS.answer} />
            </>
          ) : null}
        </>
      ) : (
        <>
          {/* On a laptop the answer is the job of the screen, so its box fills the column. */}
          <div className="min-[900px]:[&_textarea]:min-h-[420px]">
            <TextArea label="Your answer" value={value.answer} onChange={setText} placeholder="Write your answer" minRows={8} maxLength={LIMITS.answer} />
          </div>
          {value.spoken ? <SpokenBadge /> : null}
        </>
      )}

      <div className="flex flex-wrap gap-x-5 gap-y-1">
        {switches
          .filter((s) => s.mode !== mode)
          .map((s) =>
            s.mode === "say" && mode === "write" ? (
              <span key={s.mode}>{voice(s.label)}</span>
            ) : (
              <button
                key={s.mode}
                type="button"
                onClick={() => onMode(s.mode)}
                className={cx("press text-subhead min-h-11 font-medium text-label underline decoration-label-3 underline-offset-4 hover:decoration-label")}
              >
                {s.label}
              </button>
            ),
          )}
      </div>
    </div>
  );
}
