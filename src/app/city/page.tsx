import type { Metadata } from "next";
import { pageMeta } from "@/app/page-meta";
import { CityView } from "./city-view";

export const metadata: Metadata = pageMeta({ title: "City of Espoo", description: "The City of Espoo view: event outcomes from challenge taken to scored, invited, talked and hired, the work still waiting, and the safeguards. Slots and labels, never names.", path: "/city" });

export default function CityPage() {
  return <CityView />;
}
