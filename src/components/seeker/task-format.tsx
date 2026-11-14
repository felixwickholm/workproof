import { ChartColumn, PenLine, Split, Wrench, type LucideIcon } from "lucide-react";
import { TASK_FORMATS } from "@/lib/domain/kinds";
import type { TaskFormat } from "@/lib/domain/types";
import { cx } from "../ui/cx";

/** The four ways a challenge is done, in the words a person sees. */
export const FORMAT_LABEL: Record<TaskFormat, string> = { choose: "Choose", make: "Make", fix: "Fix", read: "Read" };

/** One short line per format: what the person does. */
export const FORMAT_LINE: Record<TaskFormat, string> = {
  choose: "Pick one of two. Say why.",
  make: "Make something small.",
  fix: "Find what is wrong. Fix it.",
  read: "Read it. Say the one thing.",
};

const ICONS: Record<TaskFormat, LucideIcon> = { choose: Split, make: PenLine, fix: Wrench, read: ChartColumn };

export { TASK_FORMATS };

/** The format's outline icon. Decorative: the word next to it carries the meaning. */
export function FormatIcon({ format, className }: { format: TaskFormat; className?: string }) {
  const Icon = ICONS[format];
  return <Icon aria-hidden className={cx("size-5 shrink-0", className)} strokeWidth={1.75} />;
}
