"use client";

import { Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { useStory } from "./story-provider";

/** Starts the guided story at the task list. A quiet outlined pill, second to the page's main action. */
export function PlayStoryButton() {
  const { start } = useStory();
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => {
        start();
        router.push("/challenges");
      }}
      className="press text-headline flex h-12 w-full items-center justify-center gap-2 rounded-full font-semibold text-label shadow-[inset_0_0_0_1px_var(--color-label-3)] transition-colors duration-150 active:bg-surface"
    >
      <Play aria-hidden className="size-4 fill-current" strokeWidth={2} />
      Play the 2-minute story
    </button>
  );
}
