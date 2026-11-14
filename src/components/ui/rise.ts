import type { CSSProperties } from "react";

/** Stagger index for the `.rise` entrance (40ms per step). */
export function riseAt(i: number): CSSProperties {
  return { "--i": i } as CSSProperties;
}
