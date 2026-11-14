import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { cx } from "@/components/ui/cx";
import { FRAME } from "./parts";
import { PartnerLockup } from "./quiet-line";

const LINK = "flex h-11 items-center rounded-full px-3 text-[16px] font-medium text-label-2 transition-colors duration-150 hover:text-label";

/**
 * The partner lockup (on a phone the WorkProof mark and name only), the two page links and the
 * theme switch. On a phone "Evidence for judges" moves to the foot of the first screen.
 */
export function TopBar() {
  return (
    <header className={cx(FRAME, "flex h-16 items-center gap-x-1 min-[768px]:h-[76px]")}>
      <Wordmark className="mr-auto min-[640px]:hidden" />
      <PartnerLockup className="mr-auto max-[639px]:hidden" />
      <nav aria-label="Page" className="flex items-center">
        <Link href="/how-it-works" className={cx(LINK, "max-[359px]:px-2 max-[359px]:text-[15px]")}>
          How it works
        </Link>
        <Link href="/for-judges" className={cx(LINK, "max-[639px]:hidden")}>
          Evidence for judges
        </Link>
      </nav>
      <ThemeToggle />
    </header>
  );
}
