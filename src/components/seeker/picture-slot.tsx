"use client";

import { Camera, ImageUp, X } from "lucide-react";
import { useId, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cx } from "@/components/ui/cx";
import { Spinner } from "@/components/ui/spinner";
import { dataUrlBytes, toCleanJpeg } from "./picture";

interface Props {
  /** The re-encoded JPEG as a data URL, or null before a picture is chosen. */
  value: string | null;
  onChange: (value: string | null) => void;
  /** "photo": take one with the camera. "design": choose a picture of the design. */
  kind: "photo" | "design";
}

const LABEL = { photo: "Photo of the work, not of you", design: "Picture of your design" } as const;

/** The person's own check before sending. Pixels are not analysed, so this is the rule the server enforces. */
const PICTURE_CHECK_LABEL = "I checked this picture. It shows the work only: no face, no name, no badge, no contact details.";

/**
 * One labelled slot for a picture of the work. On a phone it opens the camera. The picture is
 * re-encoded here, in the browser, before anything is sent: at most 1280px, JPEG, no metadata.
 */
export function PictureSlot({ value, onChange, kind }: Props) {
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function choose(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const jpeg = await toCleanJpeg(file);
      if (jpeg) onChange(jpeg);
      else setError("This picture is too detailed to send. Try another one, or write your answer instead.");
    } catch {
      setError("This file could not be read as a picture. Try a JPEG or PNG.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={input}
        id={id}
        type="file"
        accept="image/*"
        capture={kind === "photo" ? "environment" : undefined}
        className="sr-only"
        onChange={(e) => void choose(e.target.files?.[0])}
      />
      {value ? (
        <figure>
          <div className="relative overflow-hidden rounded-inner bg-fill">
            {/* A local data URL the person just made; next/image adds nothing here. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="" className="aspect-[4/3] w-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(null)}
              aria-label="Remove the picture"
              className="press shadow-float absolute top-2 right-2 grid size-9 place-items-center rounded-full bg-raised text-label"
            >
              <X aria-hidden className="size-4" strokeWidth={2} />
            </button>
          </div>
          <figcaption className="text-footnote tnum mt-2 flex items-center justify-between gap-3 text-label-2">
            <span>JPEG, {Math.round(dataUrlBytes(value) / 1024)} kB, no location or camera data</span>
            <label htmlFor={id} className="press cursor-pointer font-medium text-label underline decoration-label-3 underline-offset-4">
              Choose another
            </label>
          </figcaption>
        </figure>
      ) : (
        <label
          htmlFor={id}
          className={cx(
            "press flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-inner border-[1.5px] border-dashed border-control px-6 text-center transition-colors duration-150 hover:bg-fill",
            busy && "pointer-events-none",
          )}
        >
          {busy ? <Spinner /> : kind === "photo" ? <Camera aria-hidden className="size-7 text-label-2" strokeWidth={1.5} /> : <ImageUp aria-hidden className="size-7 text-label-2" strokeWidth={1.5} />}
          <span className="text-headline font-semibold text-label">{LABEL[kind]}</span>
          <span className="text-footnote max-w-[34ch] text-pretty text-label-2">
            {busy ? "Making a clean copy" : "The picture is made smaller and its metadata removed on this device, before it is sent."}
          </span>
        </label>
      )}
      {error ? (
        <div role="alert" className="mt-3 flex items-center justify-between gap-3">
          <p className="text-footnote text-label-2">{error}</p>
          <Button variant="quiet" size="sm" onClick={() => setError(null)}>
            OK
          </Button>
        </div>
      ) : null}
    </div>
  );
}

/**
 * The picture once more, on the send step, with the person's own check. Sending a picture needs it:
 * nothing here can see a face or a name badge, so the person looks before anyone else does.
 */
export function PictureCheck({ src, checked, onChange }: { src: string; checked: boolean; onChange: (checked: boolean) => void }) {
  const id = useId();
  return (
    <div className="rounded-card bg-surface p-5">
      <div className="overflow-hidden rounded-inner bg-fill">
        {/* A local data URL the person just made; next/image adds nothing here. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="Your picture of the work" className="aspect-[4/3] w-full object-cover" />
      </div>
      <div className="mt-4 flex items-start gap-3">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 size-5 shrink-0 cursor-pointer accent-[var(--color-accent)]"
        />
        <label htmlFor={id} className="text-subhead cursor-pointer text-pretty text-label">
          {PICTURE_CHECK_LABEL}
        </label>
      </div>
    </div>
  );
}
