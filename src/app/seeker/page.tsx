import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { SeekerHomeView } from "./seeker-home";

// "/" is the canonical address; /seeker stays so older links and the tour keep working without a redirect hop.
export const metadata: Metadata = pageMeta({ title: "Job seeker", description: "The Job seeker view: pick a role and a real challenge from an Espoo company. A named person at the company scores the work; the AI never scores.", path: "/" });

export default function SeekerPage() {
  return <SeekerHomeView />;
}
