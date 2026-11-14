import type { Metadata } from "next";
import { SeekerHomeView } from "./seeker-home";

// "/" is the canonical address; /seeker stays so older links and the tour keep working without a redirect hop.
export const metadata: Metadata = { title: "Job seeker", alternates: { canonical: "/" } };

export default function SeekerPage() {
  return <SeekerHomeView />;
}
