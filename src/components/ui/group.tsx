import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { cx } from "./cx";

/** An iOS inset grouped list. */
export function Group({ children, footer, className }: { children: ReactNode; footer?: ReactNode; className?: string }) {
  return (
    <div className={className}>
      <div className="overflow-hidden rounded-card bg-surface">{children}</div>
      {footer ? <p className="text-footnote text-label-2 mt-2 px-4">{footer}</p> : null}
    </div>
  );
}

interface RowProps {
  title: ReactNode;
  /** Second line under the title. */
  detail?: ReactNode;
  /** Value at the right. */
  value?: ReactNode;
  leading?: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
  style?: CSSProperties;
}

export function Row({ title, detail, value, leading, href, onClick, className, style }: RowProps) {
  const interactive = Boolean(href || onClick);
  const body = (
    <>
      {leading ? <span className="flex shrink-0 items-center text-label-2">{leading}</span> : null}
      <span className="min-w-0 flex-1 py-3">
        <span className="text-body block text-pretty">{title}</span>
        {detail ? <span className="text-subhead text-label-2 mt-0.5 block text-pretty">{detail}</span> : null}
      </span>
      {value !== undefined ? <span className="text-body tnum shrink-0 text-label-2">{value}</span> : null}
      {interactive ? <ChevronRight aria-hidden className="size-5 shrink-0 text-label-3" strokeWidth={2.2} /> : null}
    </>
  );
  const classes = cx(
    "row relative flex min-h-11 w-full items-center gap-3 px-4 text-left",
    interactive && "transition-colors duration-150 active:bg-raised",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes} style={style}>
        {body}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={classes} style={style}>
        {body}
      </button>
    );
  }
  return (
    <div className={classes} style={style}>
      {body}
    </div>
  );
}
