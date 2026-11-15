import type { Metadata } from "next";

/** The share image next to the root layout. A page's own openGraph replaces the file-based one, so it is named again. */
const IMAGE = {
  url: "/opengraph-image.png",
  width: 1200,
  height: 630,
  alt: "WorkProof. Show the work, get the job. Real challenges from Espoo companies; a person scores the work skill by skill, and the AI never scores.",
};

interface PageMeta {
  /** The page name; the tab title becomes "<title> · WorkProof". */
  title: string;
  /** One or two sentences, unique to the page. */
  description: string;
  /** The page's own address, when it has a single one. */
  path?: string;
  /** Pages that hold a person's own work are never indexed. */
  index?: boolean;
}

/** Title, description, OpenGraph and Twitter tags for one page, in one shape for every route. */
export function pageMeta({ title, description, path, index = true }: PageMeta): Metadata {
  const full = `${title} · WorkProof`;
  return {
    title: { absolute: full },
    description,
    ...(path ? { alternates: { canonical: path } } : {}),
    ...(index ? {} : { robots: { index: false, follow: false } }),
    openGraph: { title: full, description, type: "website", siteName: "WorkProof", locale: "en_GB", images: [IMAGE], ...(path ? { url: path } : {}) },
    twitter: { card: "summary_large_image", title: full, description, images: [IMAGE.url] },
  };
}
