"use client";

import { useEffect, useState, type ReactNode } from "react";
import { cx } from "./cx";

/** True once the page has scrolled a little, so a bar can turn to glass over the content. */
export function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const check = () => setScrolled(window.scrollY > 8);
    check();
    window.addEventListener("scroll", check, { passive: true });
    return () => window.removeEventListener("scroll", check);
  }, []);
  return scrolled;
}

/**
 * Sticky top bar: clear at rest, glass with a hairline once the page scrolls under it.
 * Inside the app frame on a phone it docks under the frame's own bar.
 */
export function TopBar({ children, className }: { children: ReactNode; className?: string }) {
  const scrolled = useScrolled();
  return (
    <header
      data-scrolled={scrolled || undefined}
      className={cx("top-bar pt-safe sticky top-0 z-20 max-[899px]:in-shell:top-[calc(var(--phone-bar)+env(safe-area-inset-top,0px))] max-[899px]:in-shell:pt-0", className)}
    >
      {children}
    </header>
  );
}
