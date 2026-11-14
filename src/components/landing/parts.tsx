import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "@/components/ui/cx";

/** One frame for the whole page: 1200px of content with equal 16px (phone) or 32px margins. */
export const FRAME = "mx-auto w-full max-w-[1264px] px-4 min-[640px]:px-8";

/** Vertical rhythm: sections sit 112px apart on a laptop and 64px on a phone. */
export const SECTION = "py-8 min-[1024px]:py-14";
/** A section on the surface tone needs room inside its own band. */
export const BAND = "py-12 min-[1024px]:py-16";

/** The page's three type sizes above body text: display, section heading, lead. */
export const DISPLAY = "font-serif text-[46px] leading-[0.98] tracking-[-0.02em] min-[640px]:text-[72px] min-[1100px]:text-[96px]";
export const HEADING = "font-serif text-[38px] leading-[1.02] tracking-[-0.015em] text-balance min-[640px]:text-[52px] min-[1100px]:text-[64px]";
export const LEAD = "text-[18px] leading-[28px] text-pretty min-[640px]:text-[20px] min-[640px]:leading-[30px]";

/** Marks a part of a section that rises into view once; `order` staggers the parts. */
export function reveal(order = 0): { "data-reveal": ""; style: CSSProperties } {
  return { "data-reveal": "", style: { "--r": order } as CSSProperties };
}

/** A text link with an arrow that steps right under the pointer. */
export function ArrowLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  return (
    <Link href={href} className={cx("press inline-flex min-h-11 items-center gap-1.5 font-medium text-label underline-offset-4 hover:underline", className)}>
      {children}
      <span aria-hidden className="lp-arrow">
        →
      </span>
    </Link>
  );
}

/** The page's one large button, the same at the top and at the close. */
export const BUTTON = "press inline-flex h-[58px] items-center justify-center gap-2.5 rounded-full px-8 text-[18px] font-semibold transition-colors duration-150";
