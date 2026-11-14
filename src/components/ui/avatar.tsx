import Image from "next/image";
import { UserRound } from "lucide-react";
import { cx } from "./cx";

/** The first letter of the first two words: "Halla Supply" is "HS", "Mikko" is "M". */
export function initialsOf(name: string, max = 1): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .filter(Boolean);
  return letters.slice(0, max).join("") || "?";
}

const PX = { sm: 24, md: 32, lg: 48, xl: 64, "2xl": 96 } as const;
type Size = keyof typeof PX;

const LETTER: Record<Size, string> = { sm: "text-[12px]", md: "text-[14px]", lg: "text-[20px]", xl: "text-[26px]", "2xl": "text-[38px]" };
const ROUND: Record<Size, string> = { sm: "rounded-[6px]", md: "rounded-[8px]", lg: "rounded-[12px]", xl: "rounded-[14px]", "2xl": "rounded-[18px]" };

interface AvatarProps {
  /** Path to an illustrated picture under /public, for example "/people/laura-niemi.svg". */
  src?: string;
  size?: Size;
  className?: string;
}

/**
 * A person's illustrated picture, or a neutral person shape when there is none. Decorative: the name is
 * always written next to it. Only for the visitor's own account and for company people: a job seeker's
 * picture is identity and never reaches a company or city view before they say yes.
 */
export function Avatar({ src, size = "md", className }: AvatarProps) {
  const px = PX[size];
  const frame = cx("inline-flex shrink-0 overflow-hidden rounded-full bg-fill", className);
  if (src) {
    return (
      <span aria-hidden className={frame} style={{ width: px, height: px }}>
        <Image src={src} alt="" width={px} height={px} unoptimized className="size-full object-cover" />
      </span>
    );
  }
  return (
    <span aria-hidden className={cx(frame, "items-center justify-center text-label-2")} style={{ width: px, height: px }}>
      <UserRound style={{ width: px * 0.5, height: px * 0.5 }} strokeWidth={1.75} />
    </span>
  );
}

interface LogoProps {
  company: { name: string; logo?: string };
  size?: Size;
  className?: string;
}

/**
 * A company's logo mark on a white tile, or the company's first letter on a neutral tile when it has no
 * logo yet. Decorative: the company's name is always written next to it.
 */
export function CompanyLogo({ company, size = "md", className }: LogoProps) {
  const px = PX[size];
  const tile = cx("inline-flex shrink-0 items-center justify-center overflow-hidden", ROUND[size], className);
  if (company.logo) {
    return (
      <span aria-hidden className={cx(tile, "bg-logo-tile shadow-[inset_0_0_0_1px_var(--color-separator)]")} style={{ width: px, height: px }}>
        <Image src={company.logo} alt="" width={px} height={px} unoptimized className="size-[78%] object-contain" />
      </span>
    );
  }
  return (
    <span aria-hidden className={cx(tile, "bg-fill font-semibold text-label-2", LETTER[size])} style={{ width: px, height: px }}>
      {initialsOf(company.name)}
    </span>
  );
}

/** Older name for the company's logo; same component. */
export const CompanyMark = CompanyLogo;
