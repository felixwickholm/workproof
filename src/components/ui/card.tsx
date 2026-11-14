import type { ReactNode } from "react";
import { cx } from "./cx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cx("rounded-card bg-surface p-5", className)}>{children}</div>;
}

/** Small sentence-case label inside a card or a table head. Never uppercase: the content explains itself. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-footnote font-medium text-label-2", className)}>{children}</p>;
}

/** A section with a plain sentence-case title. */
export function Section({ label, children, className }: { label?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mt-8", className)}>
      {label ? <h2 className="text-headline mb-2 px-5 font-semibold">{label}</h2> : null}
      {children}
    </section>
  );
}
