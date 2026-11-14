"use client";

import { Play } from "lucide-react";
import { useStory } from "./story-provider";

/** Starts the guided story on the first screen. */
export function PlayStoryButton() {
  const { start } = useStory();
  return (
    <button
      type="button"
      onClick={start}
      className="press text-subhead mt-4 flex h-11 items-center gap-2 px-4 font-medium text-label-2"
    >
      <Play aria-hidden className="size-4" strokeWidth={2} />
      Play the story
    </button>
  );
}
