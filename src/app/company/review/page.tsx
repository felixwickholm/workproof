import { Inbox } from "lucide-react";

/** The right pane on desktop before a proof is open. On a phone the queue fills the screen instead. */
export default function ReviewIndexPage() {
  return (
    <div className="hidden h-[calc(100dvh-44px)] flex-col min-[900px]:flex items-center justify-center gap-3 px-8 text-center">
      <Inbox aria-hidden className="size-8 text-label-3" strokeWidth={1.6} />
      <p className="text-subhead max-w-[280px] text-label-2 text-pretty">Open a proof to read the work. Names stay hidden until they accept a meeting.</p>
    </div>
  );
}
