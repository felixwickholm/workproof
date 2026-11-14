import { cx } from "@/components/ui/cx";
import { FRAME, reveal } from "./parts";

/**
 * Finland's own precedent for judging people by their work, said once as a typographic statement
 * between the comparison and the event: larger than body, smaller than a heading.
 */
export function Statement() {
  return (
    <section aria-label="A Finnish precedent" className={cx(FRAME, "pb-10 min-[1024px]:pb-16")}>
      <p
        className="max-w-[60rem] border-t border-separator pt-8 font-serif text-[26px] leading-[32px] tracking-[-0.01em] text-pretty text-label min-[640px]:text-[34px] min-[640px]:leading-[42px] min-[1024px]:pt-12"
        {...reveal(0)}
      >
        Finland already certifies skills by watching real work. It is called <span lang="fi">näyttötutkinto</span>.{" "}
        <span className="text-label-2">Workprint brings that to hiring.</span>
      </p>
    </section>
  );
}
