import { cx } from "../ui/cx";
import type { Replay } from "./replays";

/** The person's own recording, played from this device. It was never sent. */
export function LocalReplay({ replay, className }: { replay: Replay; className?: string }) {
  return (
    <figure className={cx("rounded-card bg-surface p-4", className)}>
      {replay.kind === "screen" ? (
        <video src={replay.url} controls playsInline className="aspect-video w-full rounded-inner bg-ground" />
      ) : (
        <audio src={replay.url} controls className="w-full" />
      )}
      <figcaption className="text-footnote mt-3 text-label-2">Your recording. It stays on this device. The company never gets it.</figcaption>
    </figure>
  );
}
