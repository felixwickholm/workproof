"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers, WalletCards } from "lucide-react";
import { cx } from "./ui/cx";

const tabs = [
  { href: "/challenges", label: "Tasks", Icon: Layers },
  { href: "/passport", label: "My proofs", Icon: WalletCards },
];

export function TabBar() {
  const pathname = usePathname();
  return (
    <nav aria-label="Talent" className="fixed inset-x-0 bottom-0 z-20">
      <div className="glass highlight pb-safe mx-auto grid w-full max-w-[440px] grid-cols-2">
        {tabs.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "flex h-[56px] flex-col items-center justify-center gap-0.5 transition-colors duration-150",
                active ? "text-label" : "text-label-3",
              )}
            >
              <Icon aria-hidden className="size-6" strokeWidth={active ? 2 : 1.6} />
              <span className="text-[10px] leading-3 font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
