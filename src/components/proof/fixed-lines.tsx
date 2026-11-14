import { cx } from "../ui/cx";

/**
 * The fixed answer to "did a person do this?", shown on proof cards. The person reads "your own
 * choices"; a reviewer reads "their own choices".
 */
export function HumanWorkLine({ perspective = "seeker", className }: { perspective?: "seeker" | "reviewer"; className?: string }) {
  const whose = perspective === "seeker" ? "your" : "their";
  return (
    <p className={cx("text-footnote text-label-2", className)}>
      AI allowed · 2 follow-up answers about {whose} own choices · the meeting starts from this work
    </p>
  );
}
