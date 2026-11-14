"use client";

import { Check } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { useEffect, useRef, type PointerEvent } from "react";
import type { ChoiceOption } from "@/lib/domain/types";
import { cx } from "../../ui/cx";

/** Past this many pixels, or with a quick flick, a drag picks the card. */
const SWIPE_PX = 96;
const FLICK = 0.11;

interface Props {
  options: readonly [ChoiceOption, ChoiceOption];
  picked: ChoiceOption["id"] | undefined;
  onPick: (id: ChoiceOption["id"]) => void;
  /** A scripted demo drives the pick; the cards take no input. */
  locked?: boolean;
}

/**
 * Two large cards side by side (stacked on a phone). Pick by tap, by key (A or B, or the arrow keys),
 * or by swiping a card: it follows the finger with a slight turn and springs back below the threshold.
 * The picked card stays; the other fades.
 */
export function ChooseCards({ options, picked, onPick, locked }: Props) {
  useEffect(() => {
    if (locked) return;
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, [contenteditable]")) return;
      const key = e.key.toLowerCase();
      const id = key === "a" || key === "arrowleft" ? "a" : key === "b" || key === "arrowright" ? "b" : null;
      if (!id) return;
      e.preventDefault();
      onPick(id);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, onPick]);

  return (
    <div role="radiogroup" aria-label="Pick one" className="grid grid-cols-1 gap-4 min-[760px]:grid-cols-2 min-[900px]:gap-6">
      {options.map((option) => (
        <OptionCard key={option.id} option={option} state={picked === undefined ? "open" : picked === option.id ? "picked" : "other"} onPick={() => onPick(option.id)} locked={locked} />
      ))}
    </div>
  );
}

function OptionCard({ option, state, onPick, locked }: { option: ChoiceOption; state: "open" | "picked" | "other"; onPick: () => void; locked?: boolean }) {
  const reduce = useReducedMotion();
  const card = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ id: number; x: number; t: number; dx: number } | null>(null);
  const moved = useRef(false);

  const place = (dx: number, animate: boolean) => {
    const el = card.current;
    if (!el) return;
    el.style.transition = animate ? "transform 420ms cubic-bezier(0.34, 1.4, 0.64, 1)" : "none";
    el.style.transform = dx ? `translateX(${dx}px) rotate(${dx / 24}deg)` : "";
  };

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    // Swiping is for touch and pen; reduced motion keeps tap only. A second finger is ignored.
    if (locked || reduce || e.pointerType === "mouse" || drag.current) return;
    drag.current = { id: e.pointerId, x: e.clientX, t: performance.now(), dx: 0 };
    moved.current = false;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    d.dx = e.clientX - d.x;
    if (Math.abs(d.dx) > 6) moved.current = true;
    place(d.dx, false);
  };
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    const velocity = Math.abs(d.dx) / Math.max(1, performance.now() - d.t);
    place(0, true);
    if (Math.abs(d.dx) >= SWIPE_PX || (moved.current && velocity > FLICK)) onPick();
  };

  return (
    <button
      ref={card}
      type="button"
      role="radio"
      aria-checked={state === "picked"}
      disabled={locked}
      data-demo-target={`option-${option.id}`}
      onClick={() => {
        if (moved.current) return;
        onPick();
      }}
      onPointerDown={down}
      onPointerMove={move}
      onPointerUp={up}
      onPointerCancel={up}
      className={cx(
        "group relative flex min-h-[320px] touch-pan-y flex-col overflow-hidden rounded-card bg-surface text-left transition-[opacity,box-shadow] duration-200 ease-(--ease-out) select-none disabled:cursor-default",
        state === "picked" && "shadow-[inset_0_0_0_2px_var(--color-accent)]",
        state === "other" && "opacity-40",
        state === "open" && "hover:shadow-[inset_0_0_0_1px_var(--color-control)]",
      )}
    >
      {option.image ? (
        // eslint-disable-next-line @next/next/no-img-element -- sample pictures under /demo, shown as they are
        <img src={option.image} alt="" className="aspect-[2/1] w-full object-cover" draggable={false} />
      ) : null}
      <div className="flex flex-1 flex-col p-6 min-[900px]:p-8">
        <div className="flex items-center justify-between">
          <span className="text-[28px] leading-[34px] font-semibold text-label-2">{option.id.toUpperCase()}</span>
          <span
            aria-hidden
            className={cx(
              "flex size-9 items-center justify-center rounded-full transition-[opacity,transform] duration-200 ease-(--ease-out)",
              state === "picked" ? "scale-100 bg-accent text-accent-ink opacity-100" : "scale-90 opacity-0",
            )}
          >
            <Check className="size-5" strokeWidth={2} />
          </span>
        </div>
        <p className="mt-3 text-[24px] leading-[30px] font-semibold tracking-[-0.015em] text-pretty text-label">{option.title}</p>
        <p className="mt-3 text-[18px] leading-[28px] text-pretty text-label-2">{option.body}</p>
        <p className="text-footnote mt-auto pt-6 text-label-2">
          {state === "picked" ? "Your pick" : (
            <>
              Tap, swipe, or press <kbd className="font-sans font-semibold text-label">{option.id.toUpperCase()}</kbd>
            </>
          )}
        </p>
      </div>
    </button>
  );
}
