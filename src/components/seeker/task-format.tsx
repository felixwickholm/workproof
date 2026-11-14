import { ChartColumn, PenLine, Split, Wrench, type LucideIcon } from "lucide-react";
import type { TaskFormat } from "@/lib/domain/types";
import { cx } from "../ui/cx";

/** One short line per format: what the person does. */
export const FORMAT_LINE: Record<TaskFormat, string> = {
  choose: "Pick one of two. Say why.",
  make: "Make something small.",
  fix: "Find what is wrong. Fix it.",
  read: "Read it. Say the one thing.",
};

const ICONS: Record<TaskFormat, LucideIcon> = { choose: Split, make: PenLine, fix: Wrench, read: ChartColumn };

/** The format's outline icon. Decorative: the word next to it carries the meaning. */
export function FormatIcon({ format, className }: { format: TaskFormat; className?: string }) {
  const Icon = ICONS[format];
  return <Icon aria-hidden className={cx("size-5 shrink-0", className)} strokeWidth={1.75} />;
}
