import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";
import { cx } from "./cx";

/**
 * An iOS grouped inset list: rows on one tonal panel, an inset hairline between them, an optional
 * plain title above and a footnote below.
 */
export function Group({ title, footer, children, className }: { title?: ReactNode; footer?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={className}>
      {title ? <h2 className="text-footnote mb-2 px-4 font-medium text-label-2">{title}</h2> : null}
      <div className="overflow-hidden rounded-inner bg-surface">{children}</div>
      {footer ? <p className="text-footnote mt-2 px-4 text-label-2">{footer}</p> : null}
    </section>
  );
}

/** One row: an optional icon, the words, an optional value on the right. A link row gets a chevron. 48px tall at least. */
export function GroupRow({ icon, children, value, href }: { icon?: ReactNode; children: ReactNode; value?: ReactNode; href?: string }) {
  const body = (
    <>
      {icon ? <span className="flex shrink-0 text-label-2">{icon}</span> : null}
      <span className="text-body min-w-0 flex-1 text-label">{children}</span>
      {value ? <span className="text-body shrink-0 text-label-2">{value}</span> : null}
      {href ? <ChevronRight aria-hidden className="size-4 shrink-0 text-label-3" strokeWidth={1.75} /> : null}
    </>
  );
  const classes = cx("row relative flex min-h-12 items-center gap-3 px-4 py-2", href && "transition-colors duration-150 hover:bg-fill");
  return href ? (
    <Link href={href} className={classes}>
      {body}
    </Link>
  ) : (
    <div className={classes}>{body}</div>
  );
}
