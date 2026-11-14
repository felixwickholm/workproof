import Link from "next/link";
import type { ReactNode } from "react";
import { Spinner } from "./spinner";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "quiet";
type Size = "lg" | "sm";

interface Props {
  children: ReactNode;
  /** primary: the screen's one main action, in the accent. secondary: a tonal fill. quiet: text only. */
  variant?: Variant;
  /** lg: 44px, full width (bottom bars, forms). sm: 38px on a laptop, 44px under a finger. */
  size?: Size;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
  /** A target for the guided walkthrough, `data-tour="<id>"`. */
  tour?: string;
}

const variants: Record<Variant, string> = {
  primary: "bg-accent text-accent-ink disabled:bg-fill disabled:text-label-3",
  secondary: "bg-fill text-label hover:bg-label/10 disabled:text-label-3",
  quiet: "text-label-2 hover:text-label active:text-label disabled:text-label-3",
};

const sizes: Record<Size, string> = {
  lg: "h-11 px-6 text-[16px] leading-5 w-full",
  sm: "h-[38px] px-4 text-[15px] leading-5 pointer-coarse:h-11 pointer-coarse:px-5",
};

export function Button({
  children,
  variant = "primary",
  size = "lg",
  href,
  onClick,
  disabled,
  loading,
  type = "button",
  className,
  tour,
}: Props) {
  const classes = cx(
    "press inline-flex shrink-0 select-none items-center justify-center gap-2 rounded-full font-semibold",
    variants[variant],
    sizes[size],
    variant === "quiet" && size === "lg" && "w-auto",
    className,
  );
  if (href && !disabled) {
    return (
      <Link href={href} className={classes} data-tour={tour}>
        {children}
      </Link>
    );
  }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={classes}
      aria-busy={loading}
      data-tour={tour}
    >
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
