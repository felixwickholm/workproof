"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { errorText } from "@/lib/client/api";
import type { Attachment } from "@/lib/domain/types";
import { LIMITS } from "@/lib/http/limits";
import { Button } from "../ui/button";
import { cx } from "../ui/cx";
import { Field } from "../ui/field";
import { clipLength } from "./format";

/** A reviewer's way to take a picture out of the blind proof when it might identify the person. */
export interface PictureReport {
  /** The reviewer's name as last used at this company. */
  defaultReviewer: string;
  onReport: (reviewer: string) => Promise<void>;
}

const PICTURE_CONFIRMED_LINE =
  "The person confirmed this picture shows the work only. If you can identify someone from it, report it instead of deciding.";

const VIDEO_FILE = /\.(webm|mp4|mov)$/i;

/** True when the clip can actually play here, rather than showing its poster only. */
function isPlayable(attachment: Attachment): boolean {
  return attachment.kind === "video" && VIDEO_FILE.test(attachment.src);
}

/**
 * A picture or clip of the work. A photo fills its frame; a design is shown whole on the panel
 * tone. A video shows its poster with a play button and plays inline, muted, with controls.
 * "thumb" is a small fixed frame for lists; "full" fills the width with the description under it.
 * With `report`, the reviewer also reads the person's own check and can report the picture.
 */
export function AttachmentView({
  attachment,
  size = "full",
  className,
  report,
}: {
  attachment: Attachment;
  size?: "thumb" | "full";
  className?: string;
  report?: PictureReport;
}) {
  const [playing, setPlaying] = useState(false);
  const thumb = size === "thumb";
  const video = attachment.kind === "video";
  const poster = video ? attachment.poster ?? (isPlayable(attachment) ? undefined : attachment.src) : attachment.src;

  const frame = (
    <div className={cx("relative overflow-hidden rounded-inner bg-fill", thumb ? "aspect-[4/3] w-28 shrink-0" : "aspect-[4/3] w-full")}>
      {video && playing ? (
        <video src={attachment.src} poster={attachment.poster} autoPlay muted controls playsInline className="absolute inset-0 size-full bg-[#000] object-contain" />
      ) : poster ? (
        <Image
          src={poster}
          alt={thumb ? attachment.alt : ""}
          fill
          unoptimized
          loading="lazy"
          sizes={thumb ? "112px" : "(min-width: 900px) 640px, 100vw"}
          className={attachment.kind === "design" ? "object-contain p-3" : "object-cover"}
        />
      ) : (
        <video src={attachment.src} preload="metadata" muted playsInline aria-hidden className="absolute inset-0 size-full object-cover" />
      )}
      {video && !playing ? (
        <>
          {isPlayable(attachment) && !thumb ? (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play the clip${attachment.seconds ? `, ${clipLength(attachment.seconds)}` : ""}`}
              className="press absolute inset-0 m-auto flex size-14 items-center justify-center rounded-full bg-raised/90 text-label shadow-float backdrop-blur"
            >
              <Play aria-hidden className="ml-0.5 size-6" strokeWidth={1.8} fill="currentColor" />
            </button>
          ) : null}
          {attachment.seconds ? (
            <span className="text-caption tnum absolute right-2 bottom-2 rounded-full bg-raised/90 px-2 py-0.5 font-medium text-label">
              {clipLength(attachment.seconds)}
            </span>
          ) : null}
        </>
      ) : null}
    </div>
  );

  if (thumb) return <div className={className}>{frame}</div>;
  return (
    <figure className={className}>
      {frame}
      <figcaption className="mt-2.5">
        <span className="text-subhead block text-pretty text-label">{attachment.alt}</span>
        <span className="text-footnote mt-0.5 block text-label-2">Shows the work, not the person.</span>
      </figcaption>
      {report ? <ReportPicture report={report} /> : null}
    </figure>
  );
}

/** The quiet line under a picture for a reviewer, and a two-step report: name, then remove for everyone. */
function ReportPicture({ report }: { report: PictureReport }) {
  const [open, setOpen] = useState(false);
  const [reviewer, setReviewer] = useState(report.defaultReviewer);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlight = useRef(false);

  async function send() {
    if (inFlight.current) return;
    inFlight.current = true;
    setBusy(true);
    setError(null);
    try {
      await report.onReport(reviewer.trim());
    } catch (e) {
      setError(errorText(e));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 border-t border-separator pt-3">
      <p className="text-footnote text-pretty text-label-2">{PICTURE_CONFIRMED_LINE}</p>
      {open ? (
        <div className="mt-3 flex flex-col gap-3">
          <Field label="Your name" value={reviewer} onChange={setReviewer} placeholder="The person who reports" autoComplete="name" maxLength={LIMITS.reviewer} />
          <p className="text-footnote text-pretty text-label-2">The picture is removed for every reader. The written answer stays, and the person is told.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" loading={busy} disabled={reviewer.trim().length < 2} onClick={() => void send()}>
              Report and remove
            </Button>
            <Button variant="quiet" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </Button>
          </div>
          {error ? (
            <p role="alert" className="text-footnote text-label-2">
              {error}
            </p>
          ) : null}
        </div>
      ) : (
        <Button variant="quiet" size="sm" onClick={() => setOpen(true)} className="-ml-4 mt-1">
          Report this picture
        </Button>
      )}
    </div>
  );
}
