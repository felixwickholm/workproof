import type { Metadata } from "next";
import { siteUrl } from "@/app/for-judges/site";
import { LandingPage } from "@/components/landing/landing-page";
import { loadLandingData } from "@/components/landing/load";

const title = "WorkProof: hiring that sees the work, not the name";
const description =
  "Show your work. Get the interview. You do a short challenge and think aloud. A person at an Espoo company scores the work without your name and writes why. Made for Espoo's talent events. Demo data.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  openGraph: { title, description, type: "website", siteName: "WorkProof", url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

/** Structured data with only fields that are true of the demo. */
function jsonLd(): string {
  const data = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "WorkProof",
    description,
    url: siteUrl(),
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web browser",
    isAccessibleForFree: true,
    license: "https://opensource.org/licenses/MIT",
  };
  // Escaped so the JSON can never close the script element.
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function Home() {
  const data = await loadLandingData();
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd() }} />
      <LandingPage data={data} />
    </>
  );
}
