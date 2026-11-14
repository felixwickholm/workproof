"use client";

import { MousePointer2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DEMO_MS, frameAt, type CursorTarget, type DemoFrame, type DemoScript } from "@/lib/think-aloud/timeline";
import { cx } from "../ui/cx";

/** The event the guided tour sends to start the sample session on a work page that is already open. */
export const DEMO_SESSION_EVENT = "workproof:demo-session";

/** Plays a scripted session: a frame per animation frame until the end, once `script` is set. */
export function useDemoSession(script: DemoScript | null): DemoFrame | null {
  const [frame, setFrame] = useState<DemoFrame | null>(null);
  useEffect(() => {
    if (!script) return;
    const started = performance.now();
    let id = 0;
    const tick = (now: number) => {
      const next = frameAt(script, now - started);
      setFrame(next);
      if (now - started < DEMO_MS) id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [script]);
  return script ? frame : null;
}

function selectorFor(target: CursorTarget, mark: number | undefined): string | null {
  if (target === "rest") return null;
  if (target === "mark") return `[data-demo-target="mark-${mark ?? 0}"]`;
  return `[data-demo-target="${target}"]`;
}

/**
 * The scripted hand: a pointer that glides to what the session touches, with a press pulse. It moves
 * by transform and fades by opacity only, and it never takes a click.
 */
export function DemoCursor({ frame, mark }: { frame: DemoFrame; mark?: number }) {
  const hand = useRef<HTMLDivElement>(null);
  const selector = selectorFor(frame.cursor, mark);

  // The hand moves by writing its transform directly: one style write per new target, no re-render.
  useLayoutEffect(() => {
    const el = selector ? document.querySelector<HTMLElement>(selector) : null;
    const node = hand.current;
    if (!el || !node) return;
    el.scrollIntoView({ block: "nearest", behavior: "smooth" });
    const box = el.getBoundingClientRect();
    node.style.transform = `translate(${box.left + Math.min(box.width * 0.5, 160)}px, ${box.top + Math.min(box.height * 0.5, 48)}px)`;
    node.style.opacity = "1";
  }, [selector]);

  return (
    <div
      ref={hand}
      aria-hidden
      className={cx("pointer-events-none fixed top-0 left-0 z-50 opacity-0 transition-[transform,opacity] duration-700 ease-(--ease-out)", frame.done && "opacity-0!")}
      style={{ transform: "translate(50vw, 60vh)" }}
    >
      <MousePointer2 className={cx("size-7 fill-label text-ground drop-shadow-md transition-transform duration-150", frame.pressing && "scale-90")} strokeWidth={1.5} />
    </div>
  );
}
