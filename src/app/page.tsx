import type { Metadata } from "next";
import { TEXT_MAPS } from "@/app/for-judges/site";
import { SeekerHomeView } from "./seeker/seeker-home";

const title = "WorkProof: companies score real work, skill by skill";
const description =
  "For City of Espoo talent events: do a short real challenge from an Espoo company. A named person at the company scores the work 1 to 5 per skill and writes why. AI never scores.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/", types: TEXT_MAPS },
  openGraph: { title, description, type: "website", siteName: "WorkProof", url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

/** The app opens straight on the job seeker's home: the challenges come first, no landing page. */
export default function Home() {
  return <SeekerHomeView />;
}
