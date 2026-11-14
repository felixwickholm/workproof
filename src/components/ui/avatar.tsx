import { cx } from "./cx";

const HUE_STEPS = [25, 70, 130, 175, 215, 345];

/**
 * A stable number per id. Identity carries no colour on screen (the tint it feeds renders as one
 * neutral tone), but the number keeps older callers' layouts unchanged.
 */
export function hueFor(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return HUE_STEPS[hash % HUE_STEPS.length];
}

/** The first letter of the first two words: "Kaari Home Care" is "KH", "Olena" is "O". */
export function initialsOf(name: string, max = 1): string {
  const letters = name
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase())
    .filter(Boolean);
  return letters.slice(0, max).join("") || "?";
}

const sizes = {
  sm: "size-6 text-[12px]",
  md: "size-8 text-[14px]",
  lg: "size-12 text-[20px]",
};

interface Props {
  name: string;
  /** Kept so callers need not change; every mark looks the same. */
  id?: string;
  size?: keyof typeof sizes;
  className?: string;
}

/**
 * A neutral monogram: the letter in ink on a small rounded square in the fill tone. One style for
 * people and companies, no colour per name. Decorative: the name is always written next to it.
 */
export function Avatar({ name, size = "md", className }: Props) {
  return (
    <span aria-hidden className={cx("inline-flex shrink-0 items-center justify-center rounded-[8px] bg-fill font-semibold text-label", sizes[size], className)}>
      {initialsOf(name)}
    </span>
  );
}

/** A company's monogram: the same neutral square. */
export function CompanyMark({ company, size = "md", className }: { company: { id: string; name: string }; size?: keyof typeof sizes; className?: string }) {
  return <Avatar name={company.name} id={company.id} size={size} className={className} />;
}
