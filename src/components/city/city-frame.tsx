import type { ReactNode } from "react";
import { Wordmark } from "../wordmark";

/** A wider page frame for the city view: the same glass header, a two-column body on desktop. */
export function CityFrame({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="glass hairline-b pt-safe sticky top-0 z-20">
        <div className="mx-auto flex h-11 w-full max-w-[1120px] items-center justify-between px-2 min-[900px]:px-5">
          <Wordmark className="px-3" />
          <p className="text-subhead px-3 text-label-2">City view</p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-[1120px] flex-1 px-5 pt-3 pb-16 min-[900px]:px-8 min-[900px]:pt-8">{children}</main>
    </div>
  );
}
