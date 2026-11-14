import Link from "next/link";
import type { ReactNode } from "react";
import { cx } from "./cx";

type Tone = "surface" | "raised" | "tint";

const tones: Record<Tone, string> = {
  surface: "bg-surface",
  /** The one raised inner card, for the block that carries a screen's main answer. */
  raised: "bg-raised shadow-[inset_0_0_0_1px_var(--color-separator)]",
  /** A 6% accent wash, for a block a person decided on. */
  tint: "bg-tint",
};

/** A tonal panel: one step off the ground, radius 22, padding 20, no shadow at rest. */
export function Card({ children, className, tone = "surface", tour }: { children: ReactNode; className?: string; tone?: Tone; tour?: string }) {
  return (
    <div data-tour={tour} className={cx("rounded-card p-5", tones[tone], className)}>
      {children}
    </div>
  );
}

/** A panel with its section header inside: title, an optional count and an optional "View all". */
export function Panel({
  title,
  count,
  href,
  linkLabel,
  children,
  className,
  tone,
  tour,
}: {
  title: ReactNode;
  count?: number;
  href?: string;
  linkLabel?: string;
  children: ReactNode;
  className?: string;
  tone?: Tone;
  tour?: string;
}) {
  return (
    <Card className={className} tone={tone} tour={tour}>
      <SectionHeader title={title} count={count} href={href} linkLabel={linkLabel} className="mb-3" />
      {children}
    </Card>
  );
}

/** 14/600 title, a count chip when a number helps, and a "View all" link to the full list. */
export function SectionHeader({
  title,
  count,
  href,
  linkLabel = "View all",
  className,
  as: Heading = "h2",
}: {
  title: ReactNode;
  count?: number;
  href?: string;
  linkLabel?: string;
  className?: string;
  as?: "h2" | "h3";
}) {
  return (
    <div className={cx("flex min-h-7 items-center gap-2", className)}>
      <Heading className="text-section text-label">{title}</Heading>
      {count !== undefined ? (
        <span className="text-caption tnum inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-fill px-2 font-medium text-label-2">
          {count}
        </span>
      ) : null}
      {href ? (
        <Link href={href} className="text-footnote ml-auto inline-flex items-center font-medium pointer-coarse:min-h-11 text-label-2 transition-colors duration-150 hover:text-label">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}

/** Small sentence-case label inside a card or a table head. Never uppercase: the content explains itself. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cx("text-footnote font-medium text-label-2", className)}>{children}</p>;
}

/** A section on the page with a plain sentence-case title above its content. */
export function Section({ label, children, className }: { label?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cx("mt-8", className)}>
      {label ? <SectionHeader title={label} className="mb-2" /> : null}
      {children}
    </section>
  );
}
