import Link from "next/link";
import type { ReactNode } from "react";
import { Spinner } from "./spinner";
import { cx } from "./cx";

type Variant = "primary" | "secondary" | "quiet";
type Size = "lg" | "sm";

interface Props {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: "button" | "submit";
  className?: string;
}

const variants: Record<Variant, string> = {
  primary: "bg-white text-black disabled:bg-raised disabled:text-label-3",
  secondary: "bg-raised text-label disabled:text-label-3",
  quiet: "text-label-2 active:text-label",
};

const sizes: Record<Size, string> = {
  lg: "h-14 px-6 text-headline w-full",
  sm: "h-11 px-5 text-subhead",
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
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={classes} aria-busy={loading}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
}
