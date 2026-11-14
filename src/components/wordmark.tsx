import Link from "next/link";
import { cx } from "./ui/cx";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link href="/" className={cx("flex h-11 items-center text-[20px] font-bold tracking-[-0.03em]", className)}>
      Tryout
    </Link>
  );
}
