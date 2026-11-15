import Link from "next/link";
import { cx } from "../ui/cx";

/** The pages around the app. /llms.txt sits in the account menu's foot, next to the demo-data line. */
const SITE_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/for-judges", label: "For judges" },
] as const;

/**
 * One quiet line of links at the foot of the sidebar. There is no landing page, so this is how a
 * judge reaches the explainer and the evidence from inside the app.
 */
export function SiteLinks({ className }: { className?: string }) {
  return (
    <nav aria-label="About WorkProof" className={cx("flex items-center gap-x-4 text-caption text-label-2", className)}>
      {SITE_LINKS.map(({ href, label }) => (
        <Link key={href} href={href} className="underline-offset-4 transition-colors duration-150 hover:text-label hover:underline">
          {label}
        </Link>
      ))}
    </nav>
  );
}
