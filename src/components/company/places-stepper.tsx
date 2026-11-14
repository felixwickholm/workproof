"use client";

import { Minus, Plus } from "lucide-react";
import { useId } from "react";
import { choosePlaces, MAX_PLACES, MIN_PLACES } from "@/lib/domain/places";
import { cx } from "../ui/cx";

const step = cx(
  "press grid size-11 place-items-center rounded-full bg-raised text-label shadow-[inset_0_0_0_1px_var(--color-control)]",
  "transition-[background-color,opacity] duration-150 hover:bg-fill disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-raised",
);

/**
 * "How many answers can you read?" A compact stepper from 5 to 30. Each task takes a limited number
 * of answers, so an employer can read them all.
 */
export function PlacesStepper({ value, onChange }: { value: number | undefined; onChange: (places: number) => void }) {
  const places = choosePlaces(value);
  const labelId = useId();
  const noteId = useId();
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p id={labelId} className="text-subhead font-medium text-label">
          How many answers can you read?
        </p>
        <div role="group" aria-labelledby={labelId} aria-describedby={noteId} className="flex shrink-0 items-center gap-2">
          <button type="button" className={step} onClick={() => onChange(choosePlaces(places - 1))} disabled={places <= MIN_PLACES} aria-label="Fewer answers">
            <Minus aria-hidden className="size-4" strokeWidth={2} />
          </button>
          <output aria-live="polite" className="text-headline tnum w-8 text-center font-semibold text-label">
            {places}
          </output>
          <button type="button" className={step} onClick={() => onChange(choosePlaces(places + 1))} disabled={places >= MAX_PLACES} aria-label="More answers">
            <Plus aria-hidden className="size-4" strokeWidth={2} />
          </button>
        </div>
      </div>
      <p id={noteId} className="text-footnote mt-1 text-pretty text-label-2">
        Each challenge takes a limited number of answers, so an employer can read them all.
      </p>
    </div>
  );
}
