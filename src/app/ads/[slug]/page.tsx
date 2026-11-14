import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { SAMPLE_ADS, sampleAd } from "@/lib/seed/ads";

/** Every sample ad is known at build time, so each page is plain static HTML. Any other slug is not found. */
export function generateStaticParams(): { slug: string }[] {
  return SAMPLE_ADS.map((ad) => ({ slug: ad.slug }));
}

export async function generateMetadata({ params }: PageProps<"/ads/[slug]">): Promise<Metadata> {
  const ad = sampleAd((await params).slug);
  if (!ad) return {};
  return {
    title: `${ad.title}, ${ad.company} (sample job ad)`,
    description: `Sample job ad for an invented company: ${ad.title}.`,
    robots: { index: false },
  };
}

/**
 * A sample job ad, so the "Paste your job ad link" flow has real links to paste. Plain headings and lists:
 * the ad reader takes the title, the headings and the list items.
 * The slug is URL data, so the ad reads it inside a Suspense boundary; the known slugs are still prerendered whole.
 */
export default function SampleAdPage({ params }: PageProps<"/ads/[slug]">) {
  return (
    <main className="mx-auto max-w-[680px] px-4 py-12 text-[17px] leading-[27px] text-label">
      <p className="rounded-xl bg-surface px-4 py-3 text-[15px] leading-[22px] text-label-2">Sample job ad. Invented company.</p>
      <Suspense fallback={null}>
        <SampleAd params={params} />
      </Suspense>
    </main>
  );
}

async function SampleAd({ params }: Pick<PageProps<"/ads/[slug]">, "params">) {
  const ad = sampleAd((await params).slug);
  if (!ad) notFound();
  return (
    <article className="mt-8">
      <p className="text-[15px] font-semibold text-label-2">{ad.company}</p>
      <h1 className="mt-1 text-[34px] leading-[40px] font-semibold tracking-[-0.02em]">{ad.title}</h1>
      <p className="mt-2 text-label-2">{ad.facts}</p>
      <p className="mt-6">{ad.intro}</p>
      <h2 className="mt-8 text-[22px] leading-[28px] font-semibold">What you will do</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        {ad.youWill.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <h2 className="mt-8 text-[22px] leading-[28px] font-semibold">What we look for</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6">
        {ad.weLookFor.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
    </article>
  );
}
