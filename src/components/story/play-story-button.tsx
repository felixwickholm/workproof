"use client";

import { Play } from "lucide-react";
import { useStory } from "./story-provider";

/** Starts the guided story. A quiet text button in the first screen's top bar, so it is never hidden. */
export function PlayStoryButton() {
  const { start } = useStory();
  return (
    <button
      type="button"
      onClick={() => {
        window.scrollTo({ top: 0 });
        start();
      }}
      className="press text-subhead -mr-2 flex h-11 items-center gap-1.5 px-2 font-medium text-label-2 active:text-label"
    >
      <Play aria-hidden className="size-3.5 fill-current" strokeWidth={2} />
      Play the story
    </button>
  );
}
