import Link from "next/link";
import type { NavItem } from "./shell/modes";
import { cx } from "./ui/cx";

/** The phone tab bar: the current mode's pages, at most four. The app frame shows it on a mode's top-level pages. */
export function TabBar({ items, activeHref, label }: { items: readonly NavItem[]; activeHref?: string; label: string }) {
  return (
    <nav aria-label={label} className="shell-tabs fixed inset-x-0 bottom-0 z-20 min-[900px]:hidden">
      <div
        className="glass pb-safe mx-auto grid w-full shadow-[inset_0_0.5px_0_var(--color-separator)]"
        style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 4)}, minmax(0, 1fr))` }}
      >
        {items.slice(0, 4).map(({ href, label: name, Icon }) => {
          const active = href === activeHref;
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cx(
                "press flex h-14 flex-col items-center justify-center gap-1 transition-colors duration-150",
                active ? "text-label" : "text-label-3",
              )}
            >
              <Icon aria-hidden className="size-6" strokeWidth={1.75} />
              <span className="text-[11px] leading-[13px] font-medium">{name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
